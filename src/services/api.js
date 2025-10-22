import axios from "axios";

// Base URLs
const BASE_URLS = {
  production: "https://dastur.mme-holding.uz",
  development: "https://dastur.mme-holding.uz",
};

// Get base URL based on environment (can be changed via settings)
const getBaseUrl = () => {
  const env = localStorage.getItem("api_environment") || "development";
  return BASE_URLS[env];
};

// Create axios instance with timeout for bad internet connections
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second

// Helper function for exponential backoff delay
const getRetryDelay = (retryCount) => {
  return RETRY_DELAY * Math.pow(2, retryCount); // 1s, 2s, 4s
};

// Request interceptor to add auth token and retry count
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `mme:${token}`;
    }
    // Initialize retry count
    config._retryCount = config._retryCount || 0;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/";
      return Promise.reject(error);
    }

    // Retry logic for network errors and timeouts
    const shouldRetry =
      config &&
      config._retryCount < MAX_RETRIES &&
      (
        error.code === 'ECONNABORTED' || // Timeout
        error.code === 'ERR_NETWORK' ||   // Network error
        error.message === 'Network Error' ||
        !error.response || // No response = network issue
        (error.response?.status >= 500 && error.response?.status < 600) // Server errors
      );

    if (shouldRetry) {
      config._retryCount += 1;
      const delayTime = getRetryDelay(config._retryCount - 1);

      console.log(`🔄 Retrying request (${config._retryCount}/${MAX_RETRIES}) after ${delayTime}ms...`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayTime));

      // Retry the request
      return api(config);
    }

    // If all retries failed or error is not retryable
    if (config._retryCount >= MAX_RETRIES) {
      console.error('❌ Max retries reached. Request failed.');
    }

    return Promise.reject(error);
  }
);

// Helper to format phone number for API (remove + and spaces)
export const formatPhoneForApi = (phone) => {
  return phone.replace(/[\s+]/g, "");
};

// Helper to format phone number for display
export const formatPhoneForDisplay = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s+]/g, "");
  const digits = cleaned.replace("998", "");
  return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(
    5,
    7
  )} ${digits.slice(7, 9)}`;
};

// Helper to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${getBaseUrl()}${imagePath}`;
};

export default api;
