import React, { useState, useMemo, useCallback } from "react";
import AccessibleButton from "../components/AccessibleButton";
import Footer from "../components/Footer";
import Header from "../components/Header";
import axios from "../api/axios";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { useDebounce } from "../hooks/useDebounce";
import { validateMessage, sanitizeInput } from "../utils/validation";

const MaliciousDetection = () => {
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const { error, handleError, clearError, hasError } = useErrorHandler();
  
  // Debounce message for performance
  const debouncedMessage = useDebounce(message, 300);

  // Memoized validation
  const validation = useMemo(() => {
    return validateMessage(debouncedMessage);
  }, [debouncedMessage]);

  // Update validation errors when validation changes
  React.useEffect(() => {
    setValidationErrors(validation.errors);
  }, [validation]);

  const handleAnalyze = useCallback(async () => {
    // Validate message before sending
    const validation = validateMessage(message);
    if (!validation.isValid) {
      handleError(new Error(validation.errors[0]), "Validation");
      return;
    }

    // Start analysis
    setIsAnalyzing(true);
    clearError();
    setResult(null);

    try {
      // Get auth token and make API call
      const token = localStorage.getItem("token");
      const sanitizedMessage = sanitizeInput(message.trim());
      
      const response = await axios.post(
        "/api/v1/detect-malicious",
        { message: sanitizedMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error("Analysis error:", err);
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        handleError(new Error("Authentication failed. Please check your API configuration."), "API Authentication");
      } else if (err.response?.status === 429) {
        handleError(new Error("Rate limit exceeded. Please wait a moment and try again."), "API Rate Limit");
      } else if (err.response?.status === 500) {
        handleError(new Error("Server error. Please check if the OpenAI API is accessible."), "API Server Error");
      } else if (!err.response) {
        handleError(new Error("Network error. Please check your internet connection."), "Network Error");
      } else {
        handleError(new Error(err.response?.data?.detail || "Analysis failed. Please try again."), "API Error");
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [message, handleError, clearError]);

  // Get color classes for threat levels
  const getThreatLevelColor = (level) => {
    switch (level) {
      case "LOW":
        return "text-green-600 bg-green-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "HIGH":
        return "text-orange-600 bg-orange-100";
      case "CRITICAL":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Get color classes for threat types
  const getThreatTypeColor = (type) => {
    switch (type) {
      case "phishing":
        return "bg-red-500";
      case "scam":
        return "bg-orange-500";
      case "malware":
        return "bg-purple-500";
      case "social_engineering":
        return "bg-blue-500";
      case "financial_fraud":
        return "bg-red-600";
      case "identity_theft":
        return "bg-red-700";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Malicious Message Detection
            </h1>
            <p className="text-gray-600 mb-4">
              Analyze messages for phishing, scams, and other malicious content
            </p>
            <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-700 font-medium">AI Detection Active</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Message Analysis
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Message to Analyze
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Paste any message here to analyze for malicious content, scams, phishing, or other threats..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isAnalyzing}
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500">
                      {message.length}/10,000 characters
                    </p>
                    {validationErrors.length > 0 && (
                      <div className="text-sm text-red-600">
                        {validationErrors.map((error, index) => (
                          <div key={index} className="flex items-center">
                            <span className="mr-1">⚠️</span>
                            {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Sample Messages */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Try these examples:</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setMessage("URGENT: Your bank account has been suspended. Click here to verify your identity: http://fake-bank-verify.com")}
                        className="block w-full text-left p-2 text-xs bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                      >
                        🚨 Phishing Example
                      </button>
                      <button
                        onClick={() => setMessage("Congratulations! You've won $1,000,000! Send $50 processing fee to claim your prize. Reply with your bank details.")}
                        className="block w-full text-left p-2 text-xs bg-orange-50 border border-orange-200 rounded hover:bg-orange-100 transition-colors"
                      >
                        🎰 Scam Example
                      </button>
                      <button
                        onClick={() => setMessage("Hi, this is your bank. We need to verify your account. Please provide your full name, date of birth, and social security number.")}
                        className="block w-full text-left p-2 text-xs bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
                      >
                        🏦 Social Engineering Example
                      </button>
                    </div>
                  </div>
                </div>

                {hasError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error?.message}</p>
                  </div>
                )}

                                <div className="flex gap-3">
                  <AccessibleButton
                    onClick={handleAnalyze}
                    disabled={!message.trim() || isAnalyzing}
                    loading={isAnalyzing}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    ariaLabel="Analyze message for malicious content"
                    ariaDescribedBy="analysis-description"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Message"}
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={() => {
                      setMessage("");
                      setResult(null);
                      clearError();
                    }}
                    disabled={!message.trim() || isAnalyzing}
                    variant="secondary"
                    size="lg"
                    ariaLabel="Clear message and results"
                  >
                    Clear
                  </AccessibleButton>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Analysis Results
              </h2>

              {!result && !isAnalyzing && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="mx-auto h-16 w-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-6">
                    Enter any message and click "Analyze Message" to check for malicious content, scams, or threats
                  </p>
                  
                  {/* Help Section */}
                  <div className="bg-blue-50 rounded-lg p-4 text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">What we detect:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                      <div>• Phishing attempts</div>
                      <div>• Scam messages</div>
                      <div>• Malware links</div>
                      <div>• Social engineering</div>
                      <div>• Financial fraud</div>
                      <div>• Identity theft</div>
                    </div>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mt-4">Analyzing message for threats...</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Overall Result */}
                  <div className={`p-4 rounded-lg border-2 ${
                    result.is_malicious 
                      ? "border-red-200 bg-red-50" 
                      : "border-green-200 bg-green-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-lg font-bold ${
                          result.is_malicious ? "text-red-800" : "text-green-800"
                        }`}>
                          {result.is_malicious ? "⚠️ MALICIOUS DETECTED" : "✅ SAFE"}
                        </h3>
                        <p className={`text-sm ${
                          result.is_malicious ? "text-red-700" : "text-green-700"
                        }`}>
                          Confidence: {(result.confidence_score * 100).toFixed(1)}%
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getThreatLevelColor(result.threat_level)}`}>
                        {result.threat_level} THREAT
                      </span>
                    </div>
                  </div>

                  {/* Alert Message */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Alert</h4>
                    <p className="text-yellow-700">{result.alert_message}</p>
                  </div>

                  {/* Detected Threats */}
                  {result.detected_threats && result.detected_threats.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Detected Threats</h4>
                      <div className="space-y-3">
                        {result.detected_threats.map((threat, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <span className={`w-3 h-3 rounded-full ${getThreatTypeColor(threat.type)} mr-2`}></span>
                              <span className="font-medium text-gray-800 capitalize">
                                {threat.type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2">{threat.description}</p>
                            {threat.indicators && threat.indicators.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Indicators:</p>
                                <ul className="text-xs text-gray-600 list-disc list-inside">
                                  {threat.indicators.map((indicator, idx) => (
                                    <li key={idx}>{indicator}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis Details */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Detailed Analysis</h4>
                    
                    {/* Suspicious Elements */}
                    {result.analysis.suspicious_elements && result.analysis.suspicious_elements.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-red-700 mb-2">Suspicious Elements</h5>
                        <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                          {result.analysis.suspicious_elements.map((element, index) => (
                            <li key={index}>{element}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Legitimate Elements */}
                    {result.analysis.legitimate_elements && result.analysis.legitimate_elements.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-green-700 mb-2">Legitimate Elements</h5>
                        <ul className="text-sm text-green-600 list-disc list-inside space-y-1">
                          {result.analysis.legitimate_elements.map((element, index) => (
                            <li key={index}>{element}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {result.analysis.recommendations && result.analysis.recommendations.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-blue-700 mb-2">Safety Recommendations</h5>
                        <ul className="text-sm text-blue-600 list-disc list-inside space-y-1">
                          {result.analysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MaliciousDetection; 