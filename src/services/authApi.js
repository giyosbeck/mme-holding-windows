import api, { formatPhoneForApi } from './api';

/**
 * Authentication API Services
 */

// Step 1: Request OTP code
export const requestOTP = async (phoneNumber) => {
  const response = await api.post('/login/phone', {
    phone: formatPhoneForApi(phoneNumber)
  });
  return response.data;
};

// Step 2: Verify OTP and login
export const verifyOTP = async (phoneNumber, code) => {
  const response = await api.post('/login/code', {
    phone: formatPhoneForApi(phoneNumber),
    code: parseInt(code)
  });

  // Save token to localStorage
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
  }

  return response.data;
};

// Get user profile
export const getUserProfile = async (userId) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

// Update user profile
export const updateUserProfile = async (userData) => {
  const response = await api.put('/user/data', userData);
  return response.data;
};

// Get user information
export const getUserInfo = async (userId) => {
  const response = await api.get(`/login/user/${userId}`);
  return response.data;
};

// Request phone change code
export const requestPhoneChangeCode = async (newPhone) => {
  const response = await api.get('/user/code-change-phone', {
    params: {
      phone: formatPhoneForApi(newPhone)
    }
  });
  return response.data;
};

// Verify phone change code
export const verifyPhoneChangeCode = async (code) => {
  const response = await api.put('/user/code-phone', {
    code: parseInt(code)
  });
  return response.data;
};
