import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
      
      </Routes>
    </Router>
  );
}

export default App;
