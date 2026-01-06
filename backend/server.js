const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Microservices URLs dari .env
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const LOG_SERVICE_URL = process.env.LOG_SERVICE_URL;

app.use(cors());
app.use(express.json());

// === AUTH ROUTES ===
// Login - proxy ke User Identity Service (NOI)
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('📥 Login request:', req.body);
    console.log('🔗 Forwarding to:', `${USER_SERVICE_URL}/api/users/login`);
    
    const response = await axios.post(
      `${USER_SERVICE_URL}/api/users/login`, 
      req.body,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Login success:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Login failed',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get current user profile
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/me`, {
      headers: { Authorization: token }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 401).json({
      error: error.response?.data || 'Unauthorized'
    });
  }
});

// === USER ROUTES (proxy ke NOI) ===
app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to fetch users'
    });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to fetch user'
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/api/users`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to create user'
    });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.put(`${USER_SERVICE_URL}/api/users/${req.params.id}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to update user'
    });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${USER_SERVICE_URL}/api/users/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to delete user'
    });
  }
});

// === ATTENDANCE ROUTES (proxy ke JENNI) ===
app.get('/api/attendance/logs', async (req, res) => {
  try {
    const response = await axios.get(`${LOG_SERVICE_URL}/attendance/logs`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to fetch attendance logs'
    });
  }
});

app.get('/api/attendance/user/:userId', async (req, res) => {
  try {
    const response = await axios.get(`${LOG_SERVICE_URL}/attendance/user/${req.params.userId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to fetch user attendance'
    });
  }
});

app.post('/api/attendance/checkin', async (req, res) => {
  try {
    const response = await axios.post(`${LOG_SERVICE_URL}/attendance/checkin`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Check-in failed'
    });
  }
});

app.post('/api/attendance/checkout', async (req, res) => {
  try {
    const response = await axios.post(`${LOG_SERVICE_URL}/attendance/checkout`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Check-out failed'
    });
  }
});

// === INTEGRATED REPORTING (Gabungan data dari NOI & JENNI) ===
app.get('/api/reports/attendance', async (req, res) => {
  try {
    // 1. Ambil semua attendance logs dari JENNI
    const logsResponse = await axios.get(`${LOG_SERVICE_URL}/attendance/logs`, {
      headers: { Authorization: req.headers.authorization }
    });
    
    // 2. Ambil semua users dari NOI
    const usersResponse = await axios.get(`${USER_SERVICE_URL}/api/users`, {
      headers: { Authorization: req.headers.authorization }
    });
    
    // 3. Gabungkan data (join by user_id)
    const logs = logsResponse.data;
    const users = usersResponse.data;
    
    const enrichedLogs = logs.map(log => {
      const user = users.find(u => u.id === log.user_id);
      return {
        ...log,
        user_name: user?.name || 'Unknown',
        user_email: user?.email || 'Unknown',
        user_role: user?.role || 'Unknown'
      };
    });
    
    res.json(enrichedLogs);
  } catch (error) {
    console.error('Report error:', error.message);
    res.status(500).json({
      error: 'Failed to generate report'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Tendee Integration Service',
    timestamp: new Date().toISOString(),
    microservices: {
      userIdentity: USER_SERVICE_URL,
      attendanceLog: LOG_SERVICE_URL
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tendee - Integrated Attendance System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      login: 'POST /api/auth/login',
      users: '/api/users',
      attendance: '/api/attendance/logs',
      reports: '/api/reports/attendance'
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Tendee Integration Service running on port ${PORT}`);
  console.log(`📡 User Identity Service: ${USER_SERVICE_URL}`);
  console.log(`📝 Attendance Log Service: ${LOG_SERVICE_URL}`);
  console.log(`\n✅ Ready to integrate microservices!\n`);
});