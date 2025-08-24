
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const Queue = require('bull');``
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// API URLs
const CALLBACK_API_URL = 'https://script.google.com/macros/s/AKfycbxI1dVbFZ7w-Tm8WpKWY5eDFaqv7M3sqJ93aezQQ-0FH3cucoe4Z2xIiHfOE6aeKQmc/exec';
const PROJECT_API_URL = 'https://script.google.com/macros/s/AKfycbwekWK42H_Ga84yj99Qr3lYOnd80VnFsdNlpXa-5I39Y2vcpK3iGZeZxGJqzVZ8ipKO/exec';

// Initialize Bull queues
const callbackQueue = new Queue('callback-queue', process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const projectQueue = new Queue('project-queue', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

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

// Callback Queue Processor
callbackQueue.process(async (job) => {
  const { phone, timestamp, formType } = job.data;
  console.log(`➡️ Processing callback queue job:`, job.data);
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

    console.log(`✅ Success: Callback job processed for phone ${phone || 'unknown'}`);
    return result;
  } catch (error) {
    console.error('❌ Callback Queue Error:', error.message, error.stack);
    throw error; // Bull will handle retries or move to failed queue
  }
});

// Project Queue Processor
projectQueue.process(async (job) => {
  const { name, phone, branch, project, timestamp, formType } = job.data;
  console.log(`➡️ Processing project queue job:`, job.data);
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

    console.log(`✅ Success: Project job processed for phone ${phone || 'unknown'}`);
    return result;
  } catch (error) {
    console.error('❌ Project Queue Error:', error.message, error.stack);
    throw error; // Bull will handle retries or move to failed queue
  }
});

// Callback Route
app.post('/callback', callbackLimiter, async (req, res) => {
  console.log('📥 Received /callback request:', req.body);
  try {
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

    // Add to queue
    await callbackQueue.add({ formType, phone, timestamp }, { attempts: 3, backoff: 5000 });
    console.log(`✅ Callback request queued for phone ${phone || 'unknown'}`);

    // Send immediate acknowledgment
    res.status(202).json({
      status: 'queued',
      message: 'Callback request queued successfully. You will be contacted soon.',
    });
  } catch (error) {
    console.error('❌ Callback Route Error:', error.message, error.stack);
    res.status(500).json({ status: 'error', message: 'Failed to queue callback request' });
  }
});

// Project Route
app.post('/project', projectLimiter, async (req, res) => {
  console.log('📥 Received /project request:', req.body);
  try {
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

    // Add to queue
    await projectQueue.add({ formType, name, phone, branch, project, timestamp }, { attempts: 3, backoff: 5000 });
    console.log(`✅ Project request queued for phone ${phone || 'unknown'}`);

    // Send immediate acknowledgment
    res.status(202).json({
      status: 'queued',
      message: 'Project request queued successfully. We will review your submission.',
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
