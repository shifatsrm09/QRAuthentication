// src/services/authService.js
import axios from "axios";

const API_URL = "https://qr-frontend-4kwe.onrender.com/api/auth";


// Signup request
export const signup = async (name, email, password) => {
  const res = await axios.post(`${API_URL}/signup`, {
    name,
    email,
    password,
  });
  return res.data;
};

// Login request
export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return res.data;
};
