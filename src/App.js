import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import { hasValidSession } from "./utils/session";

// Only for signed-in users; expired or missing sessions go to /login.
const RequireAuth = ({ children }) => (hasValidSession() ? children : <Navigate to="/login" replace />);

// Only for signed-out users; signed-in users skip straight to the dashboard.
const GuestOnly = ({ children }) => (hasValidSession() ? <Navigate to="/dashboard" replace /> : children);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
