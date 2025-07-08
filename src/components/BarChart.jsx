import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Colorblind-friendly palette
const palette = [
  '#E57373', // Red
  '#64B5F6', // Blue
  '#FFD54F', // Yellow
  '#81C784', // Green
  '#BA68C8', // Purple
  '#FFB74D', // Orange
  '#4DD0E1', // Teal
  '#A1887F', // Brown
  '#90A4AE', // Gray
];

// Gradient utility for Chart.js
function getGradient(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color + 'CC'); // 80% opacity
  gradient.addColorStop(1, color + '66'); // 40% opacity
  return gradient;
}

const BarChart = ({ data, title, type = 'expenditure' }) => {
  // Extract months and categories from data
  const months = Object.keys(data[Object.keys(data)[0]] || []);
  const categories = Object.keys(data);

  // Chart.js needs a ref to get context for gradients
  const chartRef = React.useRef();

  // Prepare datasets with gradients and rounded bars
  const chartData = React.useMemo(() => {
    if (!chartRef.current) {
      // Fallback to flat colors for SSR/first render
      return {
        labels: months,
        datasets: categories.map((category, index) => ({
          label: category,
          data: months.map(month => data[category][month] || 0),
          backgroundColor: palette[index % palette.length],
          borderColor: palette[index % palette.length],
          borderWidth: 2,
          borderRadius: 12,
          borderSkipped: false,
          hoverBackgroundColor: palette[index % palette.length],
          hoverBorderColor: palette[index % palette.length],
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        })),
      };
    }
    const ctx = chartRef.current.ctx;
    return {
      labels: months,
      datasets: categories.map((category, index) => ({
        label: category,
        data: months.map(month => data[category][month] || 0),
        backgroundColor: getGradient(ctx, palette[index % palette.length]),
        borderColor: palette[index % palette.length],
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: palette[index % palette.length],
        hoverBorderColor: palette[index % palette.length],
        barPercentage: 0.7,
        categoryPercentage: 0.6,
        shadowOffsetX: 2,
        shadowOffsetY: 4,
        shadowBlur: 8,
        shadowColor: palette[index % palette.length] + '33',
      })),
    };
  }, [data, months, categories]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 18,
          usePointStyle: true,
          font: {
            size: 14,
            family: 'Inter, Arial, sans-serif',
            weight: '600',
          },
          boxWidth: 18,
          boxHeight: 18,
          borderRadius: 12,
          color: '#374151',
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 20,
          weight: '700',
          family: 'Inter, Arial, sans-serif',
        },
        color: '#22223B',
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: 'rgba(30, 41, 59, 0.98)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#90A4AE',
        borderWidth: 1,
        cornerRadius: 10,
        displayColors: true,
        padding: 16,
        bodyFont: {
          size: 15,
          family: 'Inter, Arial, sans-serif',
        },
        titleFont: {
          size: 16,
          weight: 'bold',
          family: 'Inter, Arial, sans-serif',
        },
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (type === 'expenditure') {
              return ` ${label}: ₹${value.toLocaleString('en-IN')}`;
            } else {
              return ` ${label}: ${value} transactions`;
            }
          },
          labelTextColor: function(context) {
            return palette[context.datasetIndex % palette.length];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 13,
            family: 'Inter, Arial, sans-serif',
            weight: '600',
          },
          color: '#22223B',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F1F5F9',
          lineWidth: 1.2,
        },
        ticks: {
          font: {
            size: 13,
            family: 'Inter, Arial, sans-serif',
            weight: '600',
          },
          color: '#22223B',
          callback: function(value) {
            if (type === 'expenditure') {
              return '₹' + value.toLocaleString('en-IN');
            } else {
              return value;
            }
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
      axis: 'x',
    },
    hover: {
      mode: 'nearest',
      intersect: false,
      axis: 'x',
      animationDuration: 400,
    },
    animation: {
      duration: 900,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="h-80">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarChart; 