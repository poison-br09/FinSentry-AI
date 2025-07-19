import React, {useState, useEffect} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MaliciousDetection from "./pages/MaliciousDetection";
import { config, isDevelopment } from "./config";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./context/ToastContext";


function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    
    // Log environment info in development only
    if (isDevelopment()) {
      console.log('🚀 App Environment:', config.ENVIRONMENT);
      console.log('🔗 API Base URL:', config.API_BASE_URL);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={!token ? <Login /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/signup"
              element={!token ? <Signup /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/dashboard"
              element={token ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/malicious-detection"
              element={token ? <MaliciousDetection /> : <Navigate to="/login" />}
            />
            <Route
              path="*"
              element={<Navigate to={token ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
