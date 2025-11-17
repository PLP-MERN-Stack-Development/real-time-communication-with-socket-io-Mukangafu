import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import { AuthContext } from "./context/AuthContext";

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* Home page with login/register tabs */}
        <Route path="/" element={<Home />} />

        {/* Protected Chat page */}
        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/" />}
        />

        {/* Redirect unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}
