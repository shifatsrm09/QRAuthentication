import axios from "axios";

// CORRECT URL - Make sure it includes /qr
const API_URL = process.env.REACT_APP_API_URL || "https://qr-frontend-4kwe.onrender.com/api/qr";

export const generateQR = async () => {
  const res = await axios.get(`${API_URL}/generate`);
  return res.data;
};

export const checkQRStatus = async (sessionId) => {
  const res = await axios.get(`${API_URL}/status?sessionId=${sessionId}`);
  return res.data;
};

export const confirmQR = async (token, sessionId) => {
  const res = await axios.post(`${API_URL}/confirm`, 
    { sessionId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};