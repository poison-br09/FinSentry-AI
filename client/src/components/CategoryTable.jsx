import React, { useState } from 'react';

const formatCurrency = (val) =>
  typeof val === 'number' ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-';

const CategoryTable = ({ data }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  if (!data || Object.keys(data).length === 0) return null;

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="mb-8">
      <table className="w-full border-separate border-spacing-0 rounded-lg overflow-hidden text-base">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="text-left px-4 py-3 font-semibold">Account</th>
            <th className="text-right px-4 py-3 font-semibold">Amount (₹)</th>
            <th className="text-right px-4 py-3 font-semibold">Transactions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([category, info], idx) => {
            const monthlyData = Object.entries(info.monthly_breakdown || {});
            const monthlyTransactionCount = info.monthly_transaction_count || {};
            const isExpanded = expandedCategories.has(category);
            return (
              <React.Fragment key={category}>
                <tr
                  className={
                    (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50') +
                    ' border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors'
                  }
                  onClick={() => toggleCategory(category)}
                >
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <span className={
                      'inline-block transition-transform ' +
                      (isExpanded ? 'rotate-90' : '')
                    }>
                      ▶
                    </span>
                    {category}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(info.total_amount)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{info.total_transactions ?? '-'}</td>
                </tr>
                {isExpanded && monthlyData
                  .filter(([month, amount]) => amount > 0)
                  .map(([month, amount], mIdx) => (
                    <tr key={`${category}-${month}`} className={mIdx % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'}>
                      <td className="px-8 py-2 text-gray-700">{month}</td>
                      <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(amount)}</td>
                      <td className="px-4 py-2 text-right text-gray-700">{monthlyTransactionCount && monthlyTransactionCount[month] ? monthlyTransactionCount[month] : '-'}</td>
                    </tr>
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
