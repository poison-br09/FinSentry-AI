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
import Header from "../components/Header";
import { formatCategoryName, setSelectedCurrency, CURRENCIES } from "../utils/formatters";
import { useStreamingAnalysis } from "../hooks/useStreamingAnalysis";
import axios from "../api/axios";

const DashboardStreaming = () => {
  const [sessionData, setSessionData] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLastFetching, setIsLastFetching] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCurrency, setSelectedCurrencyState] = useState('USD');
  const [currencySearchTerm, setCurrencySearchTerm] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const currencyDropdownRef = useRef(null);

  // Use the streaming analysis hook
  const {
    analyzeFile,
    isProcessing,
    progress,
    result,
    error: streamingError,
    reset: resetStreaming
  } = useStreamingAnalysis();

  // Upload handler using streaming API
  const handleUpload = async () => {
    if (!files.length) return;
    setError(null);
    
    try {
      // Use the streaming analysis
      await analyzeFile(files[0]); // For now, handle single file
    } catch (err) {
      setError("Upload failed: " + err.message);
    }
  };

  // Handle streaming results
  useEffect(() => {
    if (result) {
      setSessionData(result);
      setShowSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [result]);

  // Handle streaming errors
  useEffect(() => {
    if (streamingError) {
      setError(streamingError);
    }
  }, [streamingError]);

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
    setSessionData(null);
    setError(null);
    setShowSuccess(false);
    resetStreaming();
  }, [files, resetStreaming]);

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
        // Handle other keys if needed
        break;
    }
  };

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
        setCurrencySearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter currencies based on search term
  const filteredCurrencies = CURRENCIES.filter(currency =>
    currency.name.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(currencySearchTerm.toLowerCase())
  );

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ Analysis completed successfully! Your statement has been processed.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Progress Message */}
        {isProcessing && progress && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            🔄 {progress}
          </div>
        )}

        {/* Upload Section */}
        <div className="w-full max-w-7xl bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col items-start">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Statement</h2>
          
          <UploadStatement 
            files={files} 
            setFiles={setFiles} 
            dropzoneDisabled={isProcessing} 
            isProcessing={isProcessing}
          />
          
          <div className="flex gap-4 w-full">
            <button
              onClick={handleUpload}
              disabled={!files.length || isProcessing}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <Spinner size="w-5 h-5" color="text-white" />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                "Analyze Statement"
              )}
            </button>
            
            <button
              onClick={handleFetchLastResult}
              disabled={isLastFetching}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {isLastFetching ? (
                <div className="flex items-center">
                  <Spinner size="w-5 h-5" color="text-gray-600" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : (
                "Load Last Result"
              )}
            </button>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="w-full max-w-7xl bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col items-start mt-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Currency Settings</h2>
          <div className="relative w-full max-w-md" ref={currencyDropdownRef}>
            <input
              type="text"
              placeholder="Search currency..."
              value={currencySearchTerm}
              onChange={(e) => {
                setCurrencySearchTerm(e.target.value);
                setShowCurrencyDropdown(true);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowCurrencyDropdown(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showCurrencyDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCurrencies.map((currency, index) => (
                  <div
                    key={currency.code}
                    onClick={() => handleCurrencyChange(currency.code)}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      index === highlightedIndex ? 'bg-blue-100' : ''
                    }`}
                  >
                    <div className="font-medium">{currency.name}</div>
                    <div className="text-sm text-gray-500">{currency.code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {sessionData && (
          <div className="w-full max-w-7xl bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col items-start mt-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Analysis</h2>
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
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardStreaming; 