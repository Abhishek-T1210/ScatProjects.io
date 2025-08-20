/**
 * -------------------------------
 *  Node.js Express Backend Server
 * -------------------------------
 *  Handles two forms:
 *   1. Callback request form → "Callback Leads" sheet
 *   2. Project request form → "Project request form" sheet
 *
 *  Uses Google Apps Script Web App endpoint as the backend database.
 *  Includes:
 *    - Request queue to prevent flooding Google Scripts
 *    - Validation for inputs
 *    - Rate limiting per route
 *    - Health checks
 *    - Static file serving for testing
 * -------------------------------
 */

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// -------------------------------
// Environment + Config
// -------------------------------
const app = express();
const port = process.env.PORT || 3001;

// Default Google Apps Script URL (fallback if .env not provided)
const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbykzUfsJGc9w_fPyS6KAm8UdAu5h0HYnX2AuAfDz6LdMVJH9jLT3w4WXYlqMNNsvNUH/exec';

// -------------------------------
// In-memory Request Queue
// -------------------------------
// This avoids multiple simultaneous requests overwhelming Google Apps Script
const requestQueue = [];
let isProcessingQueue = false;
let requestIdCounter = 1;

/**
 * processQueue()
 * - Processes requests one by one from the queue
 * - Ensures order and prevents script quota overrun
 */
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const { id, data, resolve, reject } = requestQueue.shift();
    try {
      console.log(`➡️ [${id}] Sending request to Google Script`, data);

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Google Apps Script failed [${response.status}]: ${rawText.substring(0, 200)}`
        );
      }

      let result;
      try {
        result = JSON.parse(rawText);
      } catch (err) {
        result = { status: 'success', message: rawText };
      }

      console.log(
        `✅ [${id}] Success: Data written to ${data.formType} sheet for phone ${data.phone}`
      );
      resolve(result);
    } catch (error) {
      console.error(`❌ [${id}] Queue Error for ${data.formType}:`, {
        phone: data.phone,
        error: error.message,
      });
      reject(error);
    }
  }

  isProcessingQueue = false;
}

// -------------------------------
// Middlewares
// -------------------------------
app.use(express.static(__dirname)); // Serve static index.html
app.use(
  cors({
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'https://scatprojects.netlify.app',
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json()); // Parse JSON requests

// -------------------------------
// Rate Limits
// -------------------------------
app.use(
  '/callback',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP
    message: {
      status: 'error',
      message: 'Too many callback requests, please try again later.',
    },
  })
);
app.use(
  '/project',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      status: 'error',
      message: 'Too many project requests, please try again later.',
    },
  })
);

// -------------------------------
// Routes
// -------------------------------

/**
 * POST /callback
 * - Stores a callback request
 * - Required fields: phone, timestamp
 */
app.post('/callback', async (req, res) => {
  try {
    const { phone, timestamp } = req.body;

    // ---------------- Validation ----------------
    if (!phone || !timestamp) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone and timestamp are required',
      });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid phone number: Must be a 10-digit number',
      });
    }

    const timestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2} (AM|PM)$/;
    if (!timestampRegex.test(timestamp)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid timestamp: Must be YYYY-MM-DD hh:mm AM/PM',
      });
    }

    // ---------------- Queue Request ----------------
    const id = requestIdCounter++;
    const promise = new Promise((resolve, reject) => {
      requestQueue.push({
        id,
        data: { phone, timestamp, formType: 'callback' },
        resolve,
        reject,
      });
    });

    setImmediate(processQueue);

    res.json({
      status: 'success',
      message: 'Callback request queued for processing',
      requestId: id,
    });

    promise.catch(() => {}); // Suppress unhandled rejection logs
  } catch (error) {
    console.error('❌ Callback Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /project
 * - Stores a project request
 * - Required fields: name, phone, branch, project
 */
app.post('/project', async (req, res) => {
  try {
    const { name, phone, branch, project } = req.body;

    // ---------------- Validation ----------------
    if (!name || !phone || !branch || !project) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, phone, branch, and project are required',
      });
    }

    const nameRegex = /^[a-zA-Z\s]{3,}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid name: Must be at least 3 alphabetic characters',
      });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid phone number: Must be exactly 10 digits',
      });
    }

    const branchRegex = /^[a-zA-Z\s]{3,}$/;
    if (!branchRegex.test(branch)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid branch: Must be at least 3 alphabetic characters',
      });
    }

    if (project.length < 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Project description must be at least 10 characters',
      });
    }

    // ---------------- Queue Request ----------------
    const id = requestIdCounter++;
    const promise = new Promise((resolve, reject) => {
      requestQueue.push({
        id,
        // 🔴 Explicitly attach formType = "project"
        data: { name, phone, branch, project, formType: 'project' },
        resolve,
        reject,
      });
    });

    setImmediate(processQueue);

    res.json({
      status: 'success',
      message: 'Project request queued for processing',
      requestId: id,
    });

    promise.catch(() => {});
  } catch (error) {
    console.error('❌ Project Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// -------------------------------
// Utility Routes
// -------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'success', message: 'Server is running' });
});

// Catch-all → return JSON (not HTML)
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// -------------------------------
// Start Server
// -------------------------------
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
