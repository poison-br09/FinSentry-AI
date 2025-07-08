import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      window.location.href = "/dashboard";
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        {/* Logo placeholder - replace src with your FPT Software logo */}
        <img src="/fpt_software.png" alt="FPT Software Logo" className="h-16 mb-2" />
        {/* <span className="text-blue-700 text-lg font-medium mb-4">Software</span> */}
        <h2 className="text-2xl font-bold mb-6 text-center">Login to FinSentry AI</h2>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg py-2 mt-2 transition-colors"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-gray-700">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-green-600 hover:underline font-medium">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
