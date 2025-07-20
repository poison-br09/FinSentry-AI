import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryTable from './CategoryTable';

// Mock the formatters module
jest.mock('../utils/formatters', () => ({
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  getSelectedCurrency: jest.fn(() => 'INR'),
  formatCategoryName: jest.fn((name) => name.charAt(0).toUpperCase() + name.slice(1))
}));

// Mock the TransactionDetails component
jest.mock('./TransactionDetails', () => {
  return function MockTransactionDetails({ category, month, transactions, onClose }) {
    return (
      <div data-testid="transaction-details-modal">
        <div>Transaction Details for {category} - {month}</div>
        <div>Transactions: {transactions.length}</div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

const mockData = {
  shopping: {
    total_amount: 2500.00,
    total_transactions: 5,
    monthly_breakdown: {
      'January 2024': 1500.00,
      'February 2024': 1000.00
    },
    monthly_transaction_count: {
      'January 2024': 3,
      'February 2024': 2
    },
    monthly_transactions: {
      'January 2024': [
        {
          date: '15 Jan 2024',
          description: 'Amazon.in purchase',
          amount: 1000.00,
          type: 'DR',
          balance: 25000.00,
          ref_no: 'UPI123456789'
        },
        {
          date: '20 Jan 2024',
          description: 'Flipkart purchase',
          amount: 500.00,
          type: 'DR',
          balance: 24500.00,
          ref_no: 'UPI987654321'
        }
      ],
      'February 2024': [
        {
          date: '10 Feb 2024',
          description: 'Myntra purchase',
          amount: 1000.00,
          type: 'DR',
          balance: 23500.00,
          ref_no: 'UPI111222333'
        }
      ]
    }
  },
  dining: {
    total_amount: 800.00,
    total_transactions: 3,
    monthly_breakdown: {
      'January 2024': 800.00
    },
    monthly_transaction_count: {
      'January 2024': 3
    },
    monthly_transactions: {
      'January 2024': [
        {
          date: '25 Jan 2024',
          description: 'Zomato order',
          amount: 300.00,
          type: 'DR',
          balance: 23200.00,
          ref_no: 'UPI444555666'
        }
      ]
    }
  }
};

describe('CategoryTable', () => {
  test('renders category table with data', () => {
    render(<CategoryTable data={mockData} />);
    
    // Check if category names are rendered
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Dining')).toBeInTheDocument();
    
    // Check if amounts are rendered
    expect(screen.getByText('₹2500')).toBeInTheDocument();
    expect(screen.getByText('₹800')).toBeInTheDocument();
    
    // Check if transaction counts are rendered
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('expands category when clicked', () => {
    render(<CategoryTable data={mockData} />);
    
    // Initially, monthly data should not be visible
    expect(screen.queryByText('January 2024')).not.toBeInTheDocument();
    
    // Click on shopping category
    const shoppingRow = screen.getByText('Shopping').closest('tr');
    fireEvent.click(shoppingRow);
    
    // Now monthly data should be visible
    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByText('February 2024')).toBeInTheDocument();
  });

  test('shows transaction details modal when month is clicked', () => {
    render(<CategoryTable data={mockData} />);
    
    // Expand shopping category first
    const shoppingRow = screen.getByText('Shopping').closest('tr');
    fireEvent.click(shoppingRow);
    
    // Click on January 2024 month
    const januaryRow = screen.getByText('January 2024').closest('tr');
    fireEvent.click(januaryRow);
    
    // Check if transaction details modal is rendered
    expect(screen.getByTestId('transaction-details-modal')).toBeInTheDocument();
    expect(screen.getByText('Transaction Details for shopping - January 2024')).toBeInTheDocument();
    expect(screen.getByText('Transactions: 2')).toBeInTheDocument();
  });

  test('closes transaction details modal when close button is clicked', () => {
    render(<CategoryTable data={mockData} />);
    
    // Expand shopping category and click on month
    const shoppingRow = screen.getByText('Shopping').closest('tr');
    fireEvent.click(shoppingRow);
    
    const januaryRow = screen.getByText('January 2024').closest('tr');
    fireEvent.click(januaryRow);
    
    // Modal should be visible
    expect(screen.getByTestId('transaction-details-modal')).toBeInTheDocument();
    
    // Click close button
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Modal should be hidden
    expect(screen.queryByTestId('transaction-details-modal')).not.toBeInTheDocument();
  });

  test('prevents category toggle when month is clicked', () => {
    render(<CategoryTable data={mockData} />);
    
    // Expand shopping category
    const shoppingRow = screen.getByText('Shopping').closest('tr');
    fireEvent.click(shoppingRow);
    
    // January should be visible
    expect(screen.getByText('January 2024')).toBeInTheDocument();
    
    // Click on January month
    const januaryRow = screen.getByText('January 2024').closest('tr');
    fireEvent.click(januaryRow);
    
    // January should still be visible (category not collapsed)
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test('renders nothing when data is empty', () => {
    const { container } = render(<CategoryTable data={{}} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when data is null', () => {
    const { container } = render(<CategoryTable data={null} />);
    expect(container.firstChild).toBeNull();
  });
}); 