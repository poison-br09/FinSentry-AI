import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionDetails from './TransactionDetails';

// Mock the formatters module
jest.mock('../utils/formatters', () => ({
  formatCurrency: jest.fn((amount) => `₹${amount}`),
  getSelectedCurrency: jest.fn(() => 'INR')
}));

const mockTransactions = [
  {
    date: '15 Jan 2024',
    description: 'Amazon.in purchase',
    amount: 1500.00,
    type: 'DR',
    balance: 25000.00,
    ref_no: 'UPI123456789'
  },
  {
    date: '20 Jan 2024',
    description: 'Salary credit',
    amount: 50000.00,
    type: 'CR',
    balance: 75000.00,
    ref_no: 'SAL001'
  }
];

describe('TransactionDetails', () => {
  const defaultProps = {
    category: 'Shopping',
    month: 'January 2024',
    transactions: mockTransactions,
    onClose: jest.fn()
  };

  test('renders transaction details modal with correct information', () => {
    render(<TransactionDetails {...defaultProps} />);
    
    // Check if modal title and subtitle are rendered
    expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    expect(screen.getByText('Shopping • January 2024 • 2 transactions')).toBeInTheDocument();
    
    // Check if summary cards are rendered
    expect(screen.getByText('Total Amount')).toBeInTheDocument();
    expect(screen.getByText('Debits')).toBeInTheDocument();
    expect(screen.getByText('Credits')).toBeInTheDocument();
    
    // Check if transaction table headers are rendered
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Amount (INR)')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Balance (INR)')).toBeInTheDocument();
    expect(screen.getByText('Ref No.')).toBeInTheDocument();
  });

  test('displays transaction data correctly', () => {
    render(<TransactionDetails {...defaultProps} />);
    
    // Check if transaction details are displayed
    expect(screen.getByText('15 Jan 2024')).toBeInTheDocument();
    expect(screen.getByText('Amazon.in purchase')).toBeInTheDocument();
    expect(screen.getByText('20 Jan 2024')).toBeInTheDocument();
    expect(screen.getByText('Salary credit')).toBeInTheDocument();
    
    // Check if transaction types are displayed
    expect(screen.getByText('DR')).toBeInTheDocument();
    expect(screen.getByText('CR')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    render(<TransactionDetails {...defaultProps} onClose={onCloseMock} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when close button at bottom is clicked', () => {
    const onCloseMock = jest.fn();
    render(<TransactionDetails {...defaultProps} onClose={onCloseMock} />);
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('renders empty state when no transactions', () => {
    render(<TransactionDetails {...defaultProps} transactions={[]} />);
    
    expect(screen.getByText('No transactions found for this period.')).toBeInTheDocument();
  });

  test('renders empty state when transactions is null', () => {
    render(<TransactionDetails {...defaultProps} transactions={null} />);
    
    expect(screen.getByText('No transactions found for this period.')).toBeInTheDocument();
  });
}); 