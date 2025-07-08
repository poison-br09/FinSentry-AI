import React from 'react';

const StatsSummary = ({ categorizedTransactions }) => {
  if (!categorizedTransactions) return null;

  // Calculate summary statistics
  const totalExpenditure = Object.values(categorizedTransactions).reduce((sum, info) => {
    return sum + (info.total_amount || 0);
  }, 0);

  const totalTransactions = Object.values(categorizedTransactions).reduce((sum, info) => {
    return sum + (info.total_transactions || 0);
  }, 0);

  const categoryCount = Object.keys(categorizedTransactions).length;

  // Find top spending category
  const topCategory = Object.entries(categorizedTransactions).reduce((top, [category, info]) => {
    return (info.total_amount || 0) > (top.amount || 0) 
      ? { category, amount: info.total_amount || 0 } 
      : top;
  }, { category: 'None', amount: 0 });

  // Find category with most transactions
  const mostActiveCategory = Object.entries(categorizedTransactions).reduce((most, [category, info]) => {
    return (info.total_transactions || 0) > (most.transactions || 0) 
      ? { category, transactions: info.total_transactions || 0 } 
      : most;
  }, { category: 'None', transactions: 0 });

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const stats = [
    {
      title: 'Total Expenditure',
      value: formatCurrency(totalExpenditure),
      icon: '💰',
      color: 'bg-red-50 text-red-700'
    },
    {
      title: 'Total Transactions',
      value: totalTransactions.toLocaleString('en-IN'),
      icon: '📊',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Categories',
      value: categoryCount,
      icon: '🏷️',
      color: 'bg-green-50 text-green-700'
    },
    {
      title: 'Top Category',
      value: topCategory.category,
      subtitle: formatCurrency(topCategory.amount),
      icon: '🏆',
      color: 'bg-purple-50 text-purple-700'
    },
    {
      title: 'Most Active',
      value: mostActiveCategory.category,
      subtitle: `${mostActiveCategory.transactions} transactions`,
      icon: '⚡',
      color: 'bg-orange-50 text-orange-700'
    },
    {
      title: 'Avg per Transaction',
      value: totalTransactions > 0 ? formatCurrency(totalExpenditure / totalTransactions) : '₹0.00',
      icon: '📈',
      color: 'bg-indigo-50 text-indigo-700'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Key Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{stat.title}</p>
                <p className="text-lg font-bold">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs opacity-70">{stat.subtitle}</p>
                )}
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSummary; 