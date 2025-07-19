import React, { useState, useEffect, useRef } from "react";
import UploadStatement from "../components/UploadStatement";
import AccountInfo from "../components/AccountInfo";
import CategoryTable from "../components/CategoryTable";
import PieChart from "../components/PieChart";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import StatsSummary from "../components/StatsSummary";
import Footer from "../components/Footer";
import Spinner from "../components/Spinner";
import { formatCategoryName, setSelectedCurrency, CURRENCIES } from "../utils/formatters";
// import AlertsPanel from "../components/AlertsPanel";
// import InsightsPanel from "../components/InsightsPanel";
// import DebugPanel from "../components/DebugPanel";
import axios from "../api/axios";

const Dashboard = () => {
  const [sessionData, setSessionData] = useState(null);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLastFetching, setIsLastFetching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCurrency, setSelectedCurrencyState] = useState('');
  const [currencySearchTerm, setCurrencySearchTerm] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const currencyDropdownRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // Upload handler
  const handleUpload = async () => {
    if (!files.length) return;
    setIsUploading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await axios.post("/upload-statement", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSessionId(res.data.session_id);
      // Start processing state and polling
      setIsProcessing(true);
      setProcessingProgress(0);
      startPollingForResults(res.data.session_id);
    } catch (err) {
      setError("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // Poll for results
  const startPollingForResults = (sessionId) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
    
    const poll = async () => {
      attempts++;
      setProcessingProgress(Math.min((attempts / maxAttempts) * 100, 95)); // Cap at 95% until complete
      
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/session-results/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const first = res.data?.results?.[0]?.result;
        if (first) {
          setSessionData(first);
          setProcessingProgress(100);
          setIsProcessing(false);
          setShowSuccess(true);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          // Hide success message after 5 seconds
          setTimeout(() => setShowSuccess(false), 5000);
          return;
        }
        
        // If no result yet and we haven't exceeded max attempts, continue polling
        if (attempts < maxAttempts) {
          pollingIntervalRef.current = setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          setError("Processing timeout. Please try again.");
          setIsProcessing(false);
          setProcessingProgress(0);
        }
      } catch (err) {
        if (attempts < maxAttempts) {
          pollingIntervalRef.current = setTimeout(poll, 5000);
        } else {
          setError("Failed to fetch result: " + err.message);
          setIsProcessing(false);
          setProcessingProgress(0);
        }
      }
    };
    
    // Start polling after 2 seconds
    pollingIntervalRef.current = setTimeout(poll, 2000);
  };

  // Fetch result for uploaded session (manual fetch if needed)
  const handleFetchResult = async () => {
    if (!sessionId) return;
    setIsProcessing(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/session-results/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const first = res.data?.results?.[0]?.result;
      if (first) {
        setSessionData(first);
        setIsProcessing(false);
      } else {
        setError("No results available yet. Please wait for processing to complete.");
        setIsProcessing(false);
      }
    } catch (err) {
      setError("Failed to fetch result: " + err.message);
      setIsProcessing(false);
    }
  };

  // Fetch last result
  const handleFetchLastResult = async () => {
    setIsLastFetching(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/latest-results", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.result) setSessionData(res.data.result);
    } catch (err) {
      setError("Failed to fetch last result: " + err.message);
    } finally {
      setIsLastFetching(false);
    }
  };

  // Reset state when new file is selected
  useEffect(() => {
    setSessionId(null);
    setSessionData(null);
    setError(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setShowSuccess(false);
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [files]);

  // Handle currency change
  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    setSelectedCurrencyState(currency);
    setShowCurrencyDropdown(false);
    setCurrencySearchTerm('');
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showCurrencyDropdown) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCurrencies.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCurrencies.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCurrencies[highlightedIndex]) {
          handleCurrencyChange(filteredCurrencies[highlightedIndex].code);
        }
        break;
      case 'Escape':
        setShowCurrencyDropdown(false);
        setCurrencySearchTerm('');
        setHighlightedIndex(-1);
        break;
      default:
        // Handle other keys - do nothing
        break;
    }
  };

  // Filter currencies based on search term and sort alphabetically by country
  const filteredCurrencies = CURRENCIES
    .filter(currency => 
      currency.country.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
      currency.name.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
      currency.code.toLowerCase().includes(currencySearchTerm.toLowerCase())
    )
    .sort((a, b) => a.country.localeCompare(b.country));

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
        setCurrencySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
      }
    };
  }, []);

  // Helper functions to extract data for pie charts
  const getExpenditureData = (categorizedTransactions) => {
    if (!categorizedTransactions) return {};
    
    const expenditureData = {};
    Object.entries(categorizedTransactions).forEach(([category, info]) => {
      if (info.total_amount && info.total_amount > 0) {
        expenditureData[formatCategoryName(category)] = info.total_amount;
      }
    });
    return expenditureData;
  };

  const getTransactionCountData = (categorizedTransactions) => {
    if (!categorizedTransactions) return {};
    
    const transactionData = {};
    Object.entries(categorizedTransactions).forEach(([category, info]) => {
      if (info.total_transactions && info.total_transactions > 0) {
        transactionData[formatCategoryName(category)] = info.total_transactions;
      }
    });
    return transactionData;
  };

  // Helper functions to extract monthly data for bar charts
  const getMonthlyExpenditureDataForBarChart = (categorizedTransactions) => {
    if (!categorizedTransactions) return {};
    
    const monthlyData = {};
    Object.entries(categorizedTransactions).forEach(([category, info]) => {
      if (info.monthly_breakdown && Object.keys(info.monthly_breakdown).length > 0) {
        monthlyData[formatCategoryName(category)] = info.monthly_breakdown;
      }
    });
    return monthlyData;
  };

  const getMonthlyTransactionDataForBarChart = (categorizedTransactions) => {
    if (!categorizedTransactions) return {};
    
    const monthlyData = {};
    Object.entries(categorizedTransactions).forEach(([category, info]) => {
      if (info.monthly_transaction_count && Object.keys(info.monthly_transaction_count).length > 0) {
        monthlyData[formatCategoryName(category)] = info.monthly_transaction_count;
      }
    });
    return monthlyData;
  };

  // Helper functions for line charts (preserve monthly breakdown structure)
  const getMonthlyExpenditureDataForLineChart = (categorizedTransactions) => {
    if (!categorizedTransactions) return {};
    
    const monthlyData = {};
    Object.entries(categorizedTransactions).forEach(([category, info]) => {
      if (info.monthly_breakdown && Object.keys(info.monthly_breakdown).length > 0) {
        monthlyData[formatCategoryName(category)] = info.monthly_breakdown;
      }
    });
    return monthlyData;
  };

  const getMonthlyTransactionDataForLineChart = (categorizedTransactions) => {
    if (!categorizedTransactions) return {};
    
    const monthlyData = {};
    Object.entries(categorizedTransactions).forEach(([category, info]) => {
      if (info.monthly_transaction_count && Object.keys(info.monthly_transaction_count).length > 0) {
        monthlyData[formatCategoryName(category)] = info.monthly_transaction_count;
      }
    });
    return monthlyData;
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col items-center px-2 py-6 sm:px-4 pt-20">
        {/* Header */}
        <header className="w-full flex fixed top-0 left-0 right-0 z-50 items-center justify-between bg-white px-6 py-2 shadow-sm mb-4">
        {/* <header className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between bg-white px-6 py-2 shadow-sm"> */}
          <div className="flex-1 flex items-center min-w-0">
            <img src="/fpt_horizontal.png" alt="FPT Software Logo" className="max-h-12 w-auto object-contain" style={{maxWidth: '100%'}} />
          </div>
          <button
            onClick={logout}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg text-base transition-colors ml-4"
          >
            Logout
          </button>
        </header>
        {/* Dashboard Title */}
        <div className="w-full max-w-7xl px-2 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center">Dashboard</h1>
          {/* <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Currency: {CURRENCIES.find(c => c.code === selectedCurrency)?.symbol} {selectedCurrency}
            </span>
          </div> */}
        </div>
        {/* Main Content: Upload and Analysis Preview */}
        <div className="w-full flex flex-col items-center gap-8 xl:gap-12">
          {/* Upload Card with View Last Result */}
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 w-full text-left">Upload Bank Statement</h2>
            <div className="w-full flex flex-col items-center">
              <UploadStatement 
                files={files} 
                setFiles={setFiles} 
                dropzoneDisabled={isUploading || isProcessing || isLastFetching}
                isProcessing={isProcessing}
              />
            </div>
            {error && <div className="w-full text-center text-red-600 bg-red-50 rounded-lg px-3 py-2 text-sm mb-2">{error}</div>}
            {showSuccess && (
              <div className="w-full text-center text-green-600 bg-green-50 rounded-lg px-3 py-2 text-sm mb-2">
                ✅ Processing complete! Your analysis is ready below.
              </div>
            )}
            
            {/* Currency Selection */}
            <div className="w-full mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 text-sm font-semibold">Select Currency:</span>
                <span className="text-blue-600 text-xs">All amounts will be displayed in this currency</span>
              </div>
              
              {/* Searchable Currency Dropdown */}
              <div className="relative" ref={currencyDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="w-full text-left text-sm border border-blue-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                >
                  <span>
                    {selectedCurrency ? 
                      `${CURRENCIES.find(c => c.code === selectedCurrency)?.country} - ${CURRENCIES.find(c => c.code === selectedCurrency)?.name} (${CURRENCIES.find(c => c.code === selectedCurrency)?.symbol})` : 
                      'Select the currency'
                    }
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCurrencyDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-blue-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search by country, currency name, or code..."
                        value={currencySearchTerm}
                        onChange={(e) => {
                          setCurrencySearchTerm(e.target.value);
                          setHighlightedIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    
                    {/* Currency List */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCurrencies.length > 0 ? (
                        filteredCurrencies.map((currency, index) => (
                          <button
                            key={currency.code}
                            onClick={() => handleCurrencyChange(currency.code)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                              selectedCurrency === currency.code ? 'bg-blue-100 text-blue-800' : 
                              index === highlightedIndex ? 'bg-blue-50 text-blue-800' : 'text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{currency.country}</div>
                                <div className="text-xs text-gray-500">{currency.name} ({currency.code})</div>
                              </div>
                              <span className="text-lg font-semibold text-blue-600">{currency.symbol}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No currencies found matching "{currencySearchTerm}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-blue-700 text-xs mt-2">
                Choose the currency for your bank statement.
              </p>
            </div>
            {/* Processing Status */}
            {isProcessing && (
              <div className="w-full mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-800 font-semibold">Processing your bank statement...</span>
                  <span className="text-blue-600 text-sm">{Math.round(processingProgress)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  This may take a few minutes. Please don't close this page.
                </p>
              </div>
            )}

            {/* Buttons row */}
            <div className="w-full flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={handleUpload}
                disabled={!files.length || isUploading || isProcessing}
                className="flex-1 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-lg py-3 text-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="w-5 h-5" color="text-white" />
                    <span className="ml-2">Uploading...</span>
                  </span>
                ) : (
                  "Upload & Process"
                )}
              </button>
              <button
                onClick={handleFetchLastResult}
                disabled={isLastFetching || isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-3 text-lg transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLastFetching && (
                  <Spinner size="w-5 h-5" color="text-white" />
                )}
                <span className={isLastFetching ? "ml-2" : ""}>View Last Result</span>
              </button>
            </div>

            {/* Manual fetch button (only show if session exists but no data and not processing) */}
            {sessionId && !sessionData && !isProcessing && (
              <div className="w-full flex justify-center mt-2">
                <button
                  onClick={handleFetchResult}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg py-2 px-6 text-base transition-colors"
                >
                  Check for Results
                </button>
              </div>
            )}
          </div>
          {/* Analysis Preview Card */}
          <div className="w-full max-w-7xl bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col items-start">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Analysis</h2>
            {sessionData ? (
              <div className="w-full">
                {/* Row 1: Account Overview and Key Statistics side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-green-800 mb-2">Account Overview</h3>
                    <AccountInfo metadata={sessionData} />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-blue-800 mb-2">Key Statistics</h3>
                    <StatsSummary categorizedTransactions={sessionData.categorized_transactions} />
                  </div>
                </div>
                
                {/* Row 2: Spending Breakdown & Overall Distribution side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Spending Breakdown</h3>
                    <CategoryTable data={sessionData.categorized_transactions} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Overall Distribution</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <PieChart 
                        data={getExpenditureData(sessionData.categorized_transactions)}
                        title="Expenditure by Category"
                        type="expenditure"
                      />
                      <PieChart 
                        data={getTransactionCountData(sessionData.categorized_transactions)}
                        title="Number of Transactions by Category"
                        type="transactions"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Monthly Trends and Trend Analysis side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Monthly Trends</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <BarChart 
                        data={getMonthlyExpenditureDataForBarChart(sessionData.categorized_transactions)}
                        title="Monthly Expenditure by Category"
                        type="expenditure"
                      />
                      <BarChart 
                        data={getMonthlyTransactionDataForBarChart(sessionData.categorized_transactions)}
                        title="Monthly Transaction Count by Category"
                        type="transactions"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">Trend Analysis</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <LineChart 
                        data={getMonthlyExpenditureDataForLineChart(sessionData.categorized_transactions)}
                        title="Expenditure Trends Over Time"
                        type="expenditure"
                      />
                      <LineChart 
                        data={getMonthlyTransactionDataForLineChart(sessionData.categorized_transactions)}
                        title="Transaction Count Trends Over Time"
                        type="transactions"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Row 4: Alerts and Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-red-700 mb-2">Alerts</h3>
                    {sessionData.alerts && sessionData.alerts.length > 0 ? (
                      <ul className="text-red-600 text-base list-disc pl-5">
                        {sessionData.alerts.map((alert, idx) => (
                          <li key={idx}>{alert}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No alerts</div>
                    )}
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-green-700 mb-2">Recommendations</h3>
                    {sessionData.insights && sessionData.insights.recommendations && sessionData.insights.recommendations.length > 0 ? (
                      <ul className="text-green-700 text-base list-disc pl-5">
                        {sessionData.insights.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">No recommendations</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 text-base">
                No analysis to show. Please upload a valid bank statement or view the last result.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;