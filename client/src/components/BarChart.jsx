import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Colorblind-friendly palette - ensuring unique colors
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
  '#FF8A80', // Light Red
  '#42A5F5', // Light Blue
  '#FFF176', // Light Yellow
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
  const range = maxValue - minValue;
  const useLogScale = maxValue > minValue * 100; // Use log scale if max is 100x greater than min
  
  // For transaction counts, use linear scale with better min/max to show small values
  const isTransactionChart = type === 'transactions';
  const finalUseLogScale = useLogScale && !isTransactionChart;
  
  // For transaction charts, ensure small values are visible
  const transactionMinValue = isTransactionChart ? Math.min(...allValues.filter(v => v > 0)) : 0;
  const transactionMaxValue = isTransactionChart ? Math.max(...allValues) : 0;

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
          data: months.map(month => {
            const value = data[category][month] || 0;
            // For transaction charts, ensure minimum visible height for small values
            if (isTransactionChart && value > 0 && value < 3) {
              return Math.max(value, 0.5); // Minimum 0.5 height for small values
            }
            return value;
          }),
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
          data: months.map(month => {
            const value = data[category][month] || 0;
            // For transaction charts, ensure minimum visible height for small values
            if (isTransactionChart && value > 0 && value < 3) {
              return Math.max(value, 0.5); // Minimum 0.5 height for small values
            }
            return value;
          }),
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
            // For transaction charts, show the actual value (not the artificially increased height)
            const actualValue = isTransactionChart && value > 0 && value < 3 ? 
              Math.round(value) : value;
            if (type === 'expenditure') {
              return ` ${label}: ₹${value.toLocaleString('en-IN')}`;
            } else {
              return ` ${label}: ${actualValue} transactions`;
            }
          },
          labelTextColor: function(context) {
            return palette[context.datasetIndex % palette.length];
          },
        },
        mode: 'nearest',
        intersect: false,
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
        type: finalUseLogScale ? 'logarithmic' : 'linear',
        beginAtZero: !finalUseLogScale,
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
        // For logarithmic scale, ensure we don't start from 0
        // For transaction charts, set a reasonable max to show small values better
        min: finalUseLogScale ? Math.max(0.1, minValue * 0.1) : 0,
        max: isTransactionChart ? Math.max(transactionMaxValue * 1.2, 25) : undefined,
        // For transaction charts, ensure small values have minimum height
        suggestedMin: isTransactionChart ? 0 : undefined,
        suggestedMax: isTransactionChart ? Math.max(transactionMaxValue * 1.5, 30) : undefined,
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