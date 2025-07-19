import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { formatCurrency, getSelectedCurrency } from '../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieChart = ({ data, title, type = 'expenditure' }) => {
  // Generate colors for categories - ensuring unique colors
  const currency = getSelectedCurrency();
  
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

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: colors.slice(0, Object.keys(data).length),
        borderColor: colors.slice(0, Object.keys(data).length).map(color => color + '80'),
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
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
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            if (type === 'expenditure') {
              return `${label}: ${formatCurrency(value, currency)} (${percentage}%)`;
            } else {
              return `${label}: ${value} transactions (${percentage}%)`;
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
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PieChart; 