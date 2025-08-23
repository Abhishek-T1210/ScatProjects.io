const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxI1dVbFZ7w-Tm8WpKWY5eDFaqv7M3sqJ93aezQQ-0FH3cucoe4Z2xIiHfOE6aeKQmc/exec';
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

      console.log(`✅ [${id}] Success: Data written to ${data.formType} sheet for phone ${data.phone || 'unknown'}`);
      resolve(result);
    } catch (error) {
      console.error(`❌ [${id}] Queue Error for ${data.formType}:`, {
        phone: data.phone || 'unknown',
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

// Callback Route (add timestamp dynamically)
app.post('/callback', async (req, res) => {
  console.log('📥 Received /callback request:', req.body);
  try {
    const { phone } = req.body;
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(/,/, ''); // Format: YYYY-MM-DD hh:mm AM/PM
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

// Project Route (validations removed)
app.post('/project', async (req, res) => {
  console.log('📥 Received /project request:', req.body);
  try {
    const { name, phone, branch, project, timestamp } = req.body;
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

    console.log(`✅ Success: Data sent to new API for phone ${phone || 'unknown'}`);
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