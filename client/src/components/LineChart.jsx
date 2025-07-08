import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data, title, type = 'expenditure' }) => {
  // Generate colors for categories
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
  ];

  // Extract months and categories from data
  const months = Object.keys(data[Object.keys(data)[0]] || []);
  const categories = Object.keys(data);

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
        beginAtZero: true,
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
        }
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