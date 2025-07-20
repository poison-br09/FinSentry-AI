import React from 'react';
import { formatCurrency, getSelectedCurrency } from '../utils/formatters';

const TransactionDetails = ({ category, month, transactions, onClose }) => {
  const currency = getSelectedCurrency();

  if (!transactions || transactions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Transaction Details - {category} ({month})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600">No transactions found for this period.</p>
        </div>
      </div>
    );
  }

  const totalAmount = transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
  const debitTransactions = transactions.filter(txn => txn.type === 'DR');
  const creditTransactions = transactions.filter(txn => txn.type === 'CR');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Transaction Details
            </h2>
            <p className="text-gray-600 mt-1">
              {category} • {month} • {transactions.length} transactions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Total Amount</h3>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(totalAmount, currency)}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 mb-1">Debits</h3>
            <p className="text-2xl font-bold text-red-900">
              {debitTransactions.length} transactions
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-1">Credits</h3>
            <p className="text-2xl font-bold text-green-900">
              {creditTransactions.length} transactions
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 rounded-lg overflow-hidden text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Description</th>
                <th className="text-right px-4 py-3 font-semibold">Amount ({currency})</th>
                <th className="text-center px-4 py-3 font-semibold">Type</th>
                <th className="text-right px-4 py-3 font-semibold">Balance ({currency})</th>
                <th className="text-left px-4 py-3 font-semibold">Ref No.</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                    {transaction.description}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${
                    transaction.type === 'DR' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'DR' ? '-' : '+'}
                    {formatCurrency(Math.abs(transaction.amount || 0), currency)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'DR' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {transaction.balance ? formatCurrency(transaction.balance, currency) : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {transaction.ref_no || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails; 