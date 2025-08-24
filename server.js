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
  origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'https://scatprojects.netlify.app', 'https://scatprojects-io.onrender.com'],
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

// Background API processor for callback
const processCallback = async (data, jobId) => {
  const { phone, timestamp, formType } = data;
  console.log(`➡️ Processing callback job ${jobId}:`, data);
  try {
    const response = await fetch(CALLBACK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType, phone, timestamp }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `Callback API failed [${response.status}]`);
    }

    console.log(`✅ Success: Callback job ${jobId} processed for phone ${phone || 'unknown'}`);
    return result;
  } catch (error) {
    console.error(`❌ Callback Error for job ${jobId}:`, error.message);
    return { status: 'error', message: error.message };
  }
};

// Background API processor for project
const processProject = async (data, jobId) => {
  const { name, phone, branch, project, timestamp, formType } = data;
  console.log(`➡️ Processing project job ${jobId}:`, data);
  try {
    const response = await fetch(PROJECT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType, name, phone, branch, project, timestamp }),
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

    console.log(`✅ Success: Project job ${jobId} processed for phone ${phone || 'unknown'}`);
    return result;
  } catch (error) {
    console.error(`❌ Project Error for job ${jobId}:`, error.message);
    return { status: 'error', message: error.message };
  }
};

// Callback Route
app.post('/callback', callbackLimiter, async (req, res) => {
  try {
    console.log('📥 Received /callback request:', req.body);
    const { phone, timestamp, formType } = req.body;

    // Validate inputs
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid phone: Must be a 10-digit number',
      });
    }
    if (!formType || formType !== 'callback') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid formType: Must be "callback"',
      });
    }

    // Generate a simple job ID
    const jobId = `callback-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Process API call in background
    processCallback({ formType, phone, timestamp }, jobId).catch(err => {
      console.error(`❌ Background Callback Error for job ${jobId}:`, err.message);
    });

    // Send immediate acknowledgment
    console.log(`✅ Callback request queued with job ID ${jobId} for phone ${phone || 'unknown'}`);
    res.status(202).json({
      status: 'queued',
      message: 'Callback request queued successfully. You will be contacted soon.',
      jobId,
    });
  } catch (error) {
    console.error('❌ Callback Route Error:', error.message, error.stack);
    res.status(500).json({ status: 'error', message: 'Failed to queue callback request' });
  }
});

// Project Route
app.post('/project', projectLimiter, async (req, res) => {
  try {
    console.log('📥 Received /project request:', req.body);
    const { name, phone, branch, project, timestamp, formType } = req.body;

    // Validate inputs
    if (!name || !/^[a-zA-Z\s]{3,}$/.test(name.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Name must be at least 3 alphabetic characters',
      });
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid phone: Must be a 10-digit number',
      });
    }
    if (!branch || !/^[a-zA-Z\s]{3,}$/.test(branch.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Branch must be at least 3 alphabetic characters',
      });
    }
    if (!project || project.trim().length < 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Project description must be at least 10 characters',
      });
    }
    if (!formType || formType !== 'project') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid formType: Must be "project"',
      });
    }

    // Generate a simple job ID
    const jobId = `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Process API call in background
    processProject({ formType, name, phone, branch, project, timestamp }, jobId).catch(err => {
      console.error(`❌ Background Project Error for job ${jobId}:`, err.message);
    });

    // Send immediate acknowledgment
    console.log(`✅ Project request queued with job ID ${jobId} for phone ${phone || 'unknown'}`);
    res.status(202).json({
      status: 'queued',
      message: 'Project request queued successfully. We will review your submission.',
      jobId,
    });
  } catch (error) {
    console.error('❌ Project Route Error:', error.message, error.stack);
    res.status(500).json({ status: 'error', message: 'Failed to queue project request' });
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
