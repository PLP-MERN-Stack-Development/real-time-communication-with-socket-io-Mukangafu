import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username,
          email,
          password,
        }
      );

      // auto-login after register
      login(res.data);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full p-3 rounded bg-[#40444b] outline-none text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-[#5865f2]"
        required
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-3 rounded bg-[#40444b] outline-none text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-[#5865f2]"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-3 rounded bg-[#40444b] outline-none text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-[#5865f2]"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className={`mt-2 bg-[#5865f2] hover:bg-[#4752c4] text-white py-3 rounded font-medium transition-colors text-sm ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}
