import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const isDashboard = location.pathname === "/dashboard";
  const isMaliciousDetection = location.pathname === "/malicious-detection";

  return (
    <header className="w-full flex fixed top-0 left-0 right-0 z-50 items-center justify-between bg-white px-6 py-2 shadow-sm mb-4">
      <div className="flex-1 flex items-center min-w-0">
        <img 
          src="/fpt_horizontal.png" 
          alt="FPT Software Logo" 
          className="max-h-12 w-auto object-contain" 
          style={{maxWidth: '100%'}} 
        />
      </div>
      <div className="flex items-center space-x-4">
        {/* Toggle Button */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => navigate("/dashboard")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isDashboard
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/malicious-detection")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isMaliciousDetection
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Malicious Detection
          </button>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg text-base transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header; 