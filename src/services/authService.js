import axios from "axios";

// Use environment variable with fallback
const API_URL = process.env.REACT_APP_API_URL || "https://qr-frontend-4kwe.onrender.com/api";

console.log("🔧 Auth Service - API URL:", `${API_URL}/auth`);

const apiClient = axios.create({
  baseURL: `${API_URL}/auth`,
  timeout: 10000,
});

// Request interceptor for auth requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔐 Auth ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth requests
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Auth ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ Auth Error:", {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
);

// Signup request
export const signup = async (name, email, password) => {
  try {
    const response = await apiClient.post("/signup", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Signup Error:", error.response?.data || error.message);
    throw error;
  }
};

// Login request
export const login = async (email, password) => {
  try {
    const response = await apiClient.post("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

// Get auth configuration
export const getAuthConfig = () => ({
  apiUrl: `${API_URL}/auth`,
  appName: process.env.REACT_APP_APP_NAME || 'QR Auth',
  version: process.env.REACT_APP_VERSION || '1.0.0'
});