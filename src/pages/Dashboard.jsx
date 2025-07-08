import React, { useState, useEffect } from "react";
import UploadStatement from "../components/UploadStatement";
import AccountInfo from "../components/AccountInfo";
import CategoryTable from "../components/CategoryTable";
import PieChart from "../components/PieChart";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import StatsSummary from "../components/StatsSummary";
// import AlertsPanel from "../components/AlertsPanel";
// import InsightsPanel from "../components/InsightsPanel";
// import DebugPanel from "../components/DebugPanel";
import axios from "../api/axios";

const Dashboard = () => {
  const [sessionData, setSessionData] = useState(null);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLastFetching, setIsLastFetching] = useState(false);
  const [isResultFetching, setIsResultFetching] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch result for uploaded session
  const handleFetchResult = async () => {
    if (!sessionId) return;
    setIsResultFetching(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/session-results/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const first = res.data?.results?.[0]?.result;
      if (first) setSessionData(first);
    } catch (err) {
      setError("Failed to fetch result: " + err.message);
    } finally {
      setIsResultFetching(false);
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
  }, [files]);

  // Helper functions to extract data for pie charts
  const getExpenditureData = (categorizedTransactions) => {
    if (!categorizedTransactions) return {};
    
    const expenditureData = {};
    Object.entries(categorizedTransactions).forEach(([category, info]) => {
      if (info.total_amount && info.total_amount > 0) {
        expenditureData[category] = info.total_amount;
      }
    });
    return expenditureData;
  };

  const getTransactionCountData = (categorizedTransactions) => {
    if (!categorizedTransactions) return {};
    
    const transactionData = {};
    Object.entries(categorizedTransactions).forEach(([category, info]) => {
      if (info.total_transactions && info.total_transactions > 0) {
        transactionData[category] = info.total_transactions;
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
        monthlyData[category] = info.monthly_breakdown;
      }
    });
    return monthlyData;
  };

  const getMonthlyTransactionDataForBarChart = (categorizedTransactions) => {
    if (!categorizedTransactions) return {};
    
    const monthlyData = {};
    Object.entries(categorizedTransactions).forEach(([category, info]) => {
      if (info.monthly_transaction_count && Object.keys(info.monthly_transaction_count).length > 0) {
        monthlyData[category] = info.monthly_transaction_count;
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
        monthlyData[category] = info.monthly_breakdown;
      }
    });
    return monthlyData;
  };

  const getMonthlyTransactionDataForLineChart = (categorizedTransactions) => {
    if (!categorizedTransactions) return {};
    
    const monthlyData = {};
    Object.entries(categorizedTransactions).forEach(([category, info]) => {
      if (info.monthly_transaction_count && Object.keys(info.monthly_transaction_count).length > 0) {
        monthlyData[category] = info.monthly_transaction_count;
      }
    });
    return monthlyData;
  };

  return (
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
      <div className="w-full max-w-5xl px-2 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center">Dashboard</h1>
      </div>
      {/* Main Content: Upload and Analysis Preview */}
      <div className="w-full flex flex-col items-center gap-8 xl:gap-12">
        {/* Upload Card with View Last Result */}
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 w-full text-left">Upload Bank Statement</h2>
          <div className="w-full flex flex-col items-center">
            <UploadStatement files={files} setFiles={setFiles} dropzoneDisabled={isUploading || isResultFetching || isLastFetching} />
          </div>
          {error && <div className="w-full text-center text-red-600 bg-red-50 rounded-lg px-3 py-2 text-sm mb-2">{error}</div>}
          {/* Buttons row or centered view result */}
          {!sessionId ? (
            <div className="w-full flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={handleUpload}
                disabled={!files.length || isUploading}
                className="flex-1 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-lg py-3 text-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploading ? <span className="flex items-center justify-center"><img src="/spinner.gif" alt="Loading" className="w-5 h-5 mr-2 inline-block" />Uploading...</span> : "Upload"}
              </button>
              <button
                onClick={handleFetchLastResult}
                disabled={isLastFetching}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-3 text-lg transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLastFetching && (
                  <img src="/spinner.gif" alt="Loading" className="w-5 h-5 mr-2 inline-block" />
                )}
                View Last Result
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-center mt-2">
              <button
                onClick={handleFetchResult}
                disabled={isResultFetching}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-3 px-8 text-lg transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isResultFetching && (
                  <img src="/spinner.gif" alt="Loading" className="w-5 h-5 mr-2 inline-block" />
                )}
                View Result
              </button>
            </div>
          )}
        </div>
        {/* Analysis Preview Card */}
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col items-start">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Analysis</h2>
          {sessionData ? (
            <div className="w-full">
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-lg text-green-800 mb-2">Account Overview</h3>
                <AccountInfo metadata={sessionData} />
              </div>
              
              {/* Statistics Summary */}
              <div className="mb-6">
                <StatsSummary categorizedTransactions={sessionData.categorized_transactions} />
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-gray-900">Spending Breakdown</h3>
              <CategoryTable data={sessionData.categorized_transactions} />
              
              {/* Visual Analysis Section */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Visual Analysis</h3>
                
                {/* Pie Charts */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Overall Distribution</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                {/* Monthly Bar Charts */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Monthly Trends</h4>
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

                {/* Line Charts for Trend Analysis */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Trend Analysis</h4>
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
              
              <div className="flex flex-col md:flex-row gap-8 w-full mt-6">
                {/* Alerts */}
                <div className="w-full md:w-1/2">
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
                {/* Recommendations */}
                <div className="w-full md:w-1/2">
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
  );
};

export default Dashboard;