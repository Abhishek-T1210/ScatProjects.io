const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyLZGKlEM5b0k8TVOr2acr7p6FXo6dOf13756yJywID5Gq8VBRL4v8GIW8XqXcjya6w/exec';
const PROJECT_API_URL = 'https://script.google.com/macros/s/AKfycbwekWK42H_Ga84yj99Qr3lYOnd80VnFsdNlpXa-5I39Y2vcpK3iGZeZxGJqzVZ8ipKO/exec';

// Request queue for Google Apps Script (callback form)
const requestQueue = [];
let isProcessingQueue = false;
let requestIdCounter = 1;

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const { id, data, resolve, reject } = requestQueue.shift();
    try {
      console.log(`➡️ [${id}] Sending request to Google Script:`, data);
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const rawText = await response.text();
      if (!response.ok) {
        throw new Error(`Google Apps Script failed [${response.status}]: ${rawText.substring(0, 200)}`);
      }

      let result;
      try {
        result = JSON.parse(rawText);
        if (result.status !== 'success') {
          throw new Error(result.message || 'Google Apps Script returned an error');
        }
      } catch (err) {
        throw new Error(`Failed to parse response: ${rawText.substring(0, 200)}`);
      }

      console.log(`✅ [${id}] Success: Data written to ${data.formType} sheet for phone ${data.phone}`);
      resolve(result);
    } catch (error) {
      console.error(`❌ [${id}] Queue Error for ${data.formType}:`, {
        phone: data.phone,
        error: error.message,
        stack: error.stack,
      });
      reject(error);
    }
  }
  isProcessingQueue = false;
}

// Middlewares
app.use(cors({
  origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'https://scatprojects.netlify.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Rate Limits
app.use('/callback', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Too many callback requests, please try again later.' },
}));
app.use('/project', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Too many project requests, please try again later.' },
}));

// Serve index.html for root route
app.get('/', (req, res) => {
  console.log('📥 Serving index.html for GET /');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files from project root
app.use(express.static(__dirname));

// Callback Route
app.post('/callback', async (req, res) => {
  console.log('📥 Received /callback request:', req.body);
  try {
    const { phone, timestamp } = req.body;
    if (!phone || !timestamp) {
      return res.status(400).json({ status: 'error', message: 'Phone and timestamp are required' });
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ status: 'error', message: 'Invalid phone number: Must be a 10-digit number' });
    }
    const timestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2} (AM|PM)$/;
    if (!timestampRegex.test(timestamp)) {
      return res.status(400).json({ status: 'error', message: 'Invalid timestamp: Must be YYYY-MM-DD hh:mm AM/PM' });
    }

    const id = requestIdCounter++;
    const promise = new Promise((resolve, reject) => {
      requestQueue.push({ id, data: { phone, timestamp, formType: 'callback' }, resolve, reject });
    });
    setImmediate(processQueue);
    const result = await promise;
    res.json(result);
  } catch (error) {
    console.error('❌ Callback Error:', error.message, error.stack);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Project Route (unchanged except for improved error handling)
app.post('/project', async (req, res) => {
  console.log('📥 Received /project request:', req.body);
  try {
    const { name, phone, branch, project, timestamp } = req.body;
    if (!name || !phone || !branch || !project || !timestamp) {
      return res.status(400).json({ status: 'error', message: 'Name, phone, branch, project, and timestamp are required' });
    }
    const nameRegex = /^[a-zA-Z\s]{3,}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({ status: 'error', message: 'Invalid name: Must be at least 3 alphabetic characters' });
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ status: 'error', message: 'Invalid phone number: Must be exactly 10 digits' });
    }
    const branchRegex = /^[a-zA-Z\s]{3,}$/;
    if (!branchRegex.test(branch)) {
      return res.status(400).json({ status: 'error', message: 'Invalid branch: Must be at least 3 alphabetic characters' });
    }
    if (project.length < 10) {
      return res.status(400).json({ status: 'error', message: 'Project description must be at least 10 characters' });
    }
    const timestampRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2} (AM|PM)$/;
    if (!timestampRegex.test(timestamp)) {
      return res.status(400).json({ status: 'error', message: 'Invalid timestamp: Must be YYYY-MM-DD hh:mm AM/PM' });
    }

    const data = { formType: 'project', name, phone, branch, project, timestamp };
    console.log(`➡️ Sending /project request to new API:`, data);
    const response = await fetch(PROJECT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(`New API failed [${response.status}]: ${rawText.substring(0, 200)}`);
    }

    let result;
    try {
      result = JSON.parse(rawText);
      if (result.status !== 'success') {
        throw new Error(result.message || 'Google Apps Script returned an error');
      }
    } catch (err) {
      throw new Error(`Failed to parse response: ${rawText.substring(0, 200)}`);
    }

    console.log(`✅ Success: Data sent to new API for phone ${phone}`);
    res.json(result);
  } catch (error) {
    console.error('❌ Project Error:', error.message, error.stack);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/health', (req, res) => {
  console.log('📥 Received /health request');
  res.json({ status: 'success', message: 'Server is running' });
});

// Catch-all route
app.use((req, res) => {
  console.log(`❌ Unmatched route: ${req.method} ${req.url}`);
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});