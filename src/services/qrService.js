import axios from "axios";

// Use environment variables with fallbacks
const API_URL = process.env.REACT_APP_API_URL || "https://qr-frontend-4kwe.onrender.com/api";
const QR_BASE_URL = process.env.REACT_APP_BACKEND_URL || "https://qr-frontend-4kwe.onrender.com";

console.log("🔧 Environment Configuration:");
console.log("- API URL:", API_URL);
console.log("- Backend URL:", QR_BASE_URL);

// Create axios instance with configuration from env
const apiClient = axios.create({
  baseURL: `${API_URL}/qr`,
  timeout: parseInt(process.env.REACT_APP_REQUEST_TIMEOUT) || 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });
    
    if (error.code === 'ECONNABORTED') {
      throw new Error("Request timeout - please check your connection");
    }
    
    if (error.response?.status === 404) {
      throw new Error("Service unavailable - please try again later");
    }
    
    if (error.response?.status >= 500) {
      throw new Error("Server error - please try again later");
    }
    
    throw error;
  }
);

export const generateQR = async () => {
  try {
    const response = await apiClient.get("/generate");
    return response.data;
  } catch (error) {
    console.error("QR Generation Error:", error.message);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

export const checkQRStatus = async (sessionId) => {
  if (!sessionId) {
    throw new Error("Session ID is required");
  }
  
  try {
    const response = await apiClient.get(`/status?sessionId=${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("QR Status Check Error:", error.message);
    throw new Error(`Failed to check QR status: ${error.message}`);
  }
};

export const confirmQR = async (token, sessionId) => {
  if (!token || !sessionId) {
    throw new Error("Token and Session ID are required");
  }
  
  try {
    const response = await apiClient.post("/confirm", 
      { sessionId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("QR Confirmation Error:", error.message);
    throw new Error(`Failed to confirm QR login: ${error.message}`);
  }
};

// Get configuration from environment
export const getConfig = () => ({
  backendUrl: process.env.REACT_APP_BACKEND_URL,
  frontendUrl: process.env.REACT_APP_FRONTEND_URL,
  qrAuthPage: process.env.REACT_APP_QR_AUTH_PAGE,
  pollingInterval: parseInt(process.env.REACT_APP_QR_POLLING_INTERVAL) || 3000,
  maxPolls: parseInt(process.env.REACT_APP_QR_MAX_POLLS) || 100,
  appName: process.env.REACT_APP_APP_NAME || 'QR Auth'
});