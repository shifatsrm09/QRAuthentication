import axios from "axios";
const API_URL = "https://qr-frontend-4kwe.onrender.com/api/qr";

export const generateQR = async () => {
  const res = await axios.get(`${API_URL}/generate`);
  return res.data;
};

export const checkQRStatus = async (token) => {
  const res = await axios.get(`${API_URL}/status/${token}`);
  return res.data;
};

export const confirmQR = async (token, userId) => {
  const res = await axios.post(`${API_URL}/confirm`, { token, userId });
  return res.data;
};
