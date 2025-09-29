import axios from "axios";

const API_URL = "https://qr-frontend-4kwe.onrender.com/api/qr";

// Create axios instance with timeout
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Request successful: ${response.status}`);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", {
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