import axios from 'axios';

// Axios instance untuk Identity Service (Auth & User Management)
const identityApi = axios.create({
  baseURL: import.meta.env.VITE_IDENTITY_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios instance untuk Attendance Service (Pencatatan Kehadiran)
const attendanceApi = axios.create({
  baseURL: import.meta.env.VITE_ATTENDANCE_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
identityApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

attendanceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== IDENTITY SERVICE API ====================

// Login user
export const loginUser = async (email, password) => {
  const response = await identityApi.post('/api/auth/login', { email, password });
  return response.data;
};

// Register user baru
export const registerUser = async (userData) => {
  const response = await identityApi.post('/api/auth/register', userData);
  return response.data;
};

// Get profile user yang sedang login
export const getUserProfile = async () => {
  const response = await identityApi.get('/api/auth/me');
  return response.data;
};

// Get semua users (Admin only)
export const getAllUsers = async () => {
  const response = await identityApi.get('/api/users');
  return response.data;
};

// ==================== ATTENDANCE SERVICE API ====================

// Submit absensi
export const submitAbsensi = async (userId, status) => {
  console.log('Submitting attendance:', { user_id: userId, status }); // Debug
  
  // Coba beberapa format request body yang mungkin diterima backend
  const payload = {
    user_id: userId,
    userId: userId,
    status: status,
  };
  
  try {
    const response = await attendanceApi.post('/api/v1/attendance/log', payload);
    return response.data;
  } catch (error) {
    console.error('Attendance API error:', error.response?.data || error.message);
    throw error;
  }
};

// Get semua log attendance (Admin)
export const getAttendanceLogs = async () => {
  const response = await attendanceApi.get('/api/v1/attendance/all');
  return response.data;
};

// Get attendance logs by user ID
export const getAttendanceByUser = async (userId) => {
  const response = await attendanceApi.get(`/api/v1/attendance/user/${userId}`);
  return response.data;
};

// Get attendance summary/statistics
export const getAttendanceSummary = async () => {
  const response = await attendanceApi.get('/api/v1/attendance/summary');
  return response.data;
};

export { identityApi, attendanceApi };
