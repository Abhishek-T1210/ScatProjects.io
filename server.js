const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// API URLs
const CALLBACK_API_URL = 'https://script.google.com/macros/s/AKfycbxI1dVbFZ7w-Tm8WpKWY5eDFaqv7M3sqJ93aezQQ-0FH3cucoe4Z2xIiHfOE6aeKQmc/exec';
const PROJECT_API_URL = 'https://script.google.com/macros/s/AKfycbwekWK42H_Ga84yj99Qr3lYOnd80VnFsdNlpXa-5I39Y2vcpK3iGZeZxGJqzVZ8ipKO/exec';

// Enable trust proxy to handle X-Forwarded-For header
app.set('trust proxy', 1);

// Middlewares
app.use(cors({
  origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'https://scatprojects.netlify.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Rate Limits for endpoints
const callbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { status: 'error', message: 'Too many callback requests, please try again later.' },
});

const projectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { status: 'error', message: 'Too many project requests, please try again later.' },
});

// Serve index.html for root route
app.get('/', (req, res) => {
  console.log('📥 Serving index.html for GET /');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files from project root
app.use(express.static(__dirname));

// Callback Route
app.post('/callback', callbackLimiter, async (req, res) => {
  console.log('📥 Received /callback request:', req.body);
  try {
    const data = req.body; // Expecting { phone, timestamp, formType }
    console.log(`➡️ Sending /callback request to API:`, data);
    const response = await fetch(CALLBACK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `Callback API failed [${response.status}]`);
    }

    console.log(`✅ Success: Callback data sent for phone ${data.phone || 'unknown'}`);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Callback Error:', error.message, error.stack);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to submit callback request' });
  }
});

// Project Route
app.post('/project', projectLimiter, async (req, res) => {
  console.log('📥 Received /project request:', req.body);
  try {
    const { name, phone, branch, project, timestamp } = req.body;
    const data = { formType: 'project', name, phone, branch, project, timestamp };
    console.log(`➡️ Sending /project request to API:`, data);
    const response = await fetch(PROJECT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(`Project API failed [${response.status}]: ${rawText.substring(0, 200)}`);
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

    console.log(`✅ Success: Project data sent for phone ${phone || 'unknown'}`);
    res.json(result);
  } catch (error) {
    console.error('❌ Project Error:', error.message, error.stack);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Health Check Route
app.get('/health', (req, res) => {
  console.log('📥 Received /health request');
  res.json({ status: 'success', message: 'Server is running' });
});

// Catch-all route
app.use((req, res) => {
  console.log(`❌ Unmatched route: ${req.method} ${req.url}`);
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});