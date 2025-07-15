import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data, title, type = 'expenditure' }) => {
  // Generate colors for categories - ensuring unique colors
  const colors = [
    '#E57373', // Red
    '#64B5F6', // Blue
    '#FFD54F', // Yellow
    '#81C784', // Green
    '#BA68C8', // Purple
    '#FFB74D', // Orange
    '#4DD0E1', // Teal
    '#A1887F', // Brown
    '#90A4AE', // Gray
    '#FF8A80', // Light Red
    '#42A5F5', // Light Blue
    '#FFF176', // Light Yellow
  ];

  // Extract months and categories from data
  const months = Object.keys(data[Object.keys(data)[0]] || []);
  const categories = Object.keys(data);

  // Calculate data statistics for better scaling
  const allValues = [];
  Object.values(data).forEach(categoryData => {
    Object.values(categoryData).forEach(value => {
      if (value > 0) allValues.push(value);
    });
  });

  // Determine if we should use logarithmic scale
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const useLogScale = maxValue > minValue * 100; // Use log scale if max is 100x greater than min
  
  // For transaction counts, use linear scale with better min/max to show small values
  const isTransactionChart = type === 'transactions';
  const finalUseLogScale = useLogScale && !isTransactionChart;

  const chartData = {
    labels: months,
    datasets: categories.map((category, index) => ({
      label: category,
      data: months.map(month => data[category][month] || 0),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      borderWidth: 3,
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      fill: false,
      tension: 0.4,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: '600'
        },
        color: '#374151',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (type === 'expenditure') {
              return `${label}: ₹${value.toLocaleString('en-IN')}`;
            } else {
              return `${label}: ${value} transactions`;
            }
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        type: finalUseLogScale ? 'logarithmic' : 'linear',
        beginAtZero: !finalUseLogScale,
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            if (type === 'expenditure') {
              return '₹' + value.toLocaleString('en-IN');
            } else {
              return value;
            }
          }
        },
        // For logarithmic scale, ensure we don't start from 0
        // For transaction charts, set a reasonable max to show small values better
        min: finalUseLogScale ? Math.max(0.1, minValue * 0.1) : 0,
        max: isTransactionChart ? Math.max(maxValue * 1.2, 10) : undefined,
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChart; 