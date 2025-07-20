// Sample data structure showing how the new monthly_transactions field works
export const sampleCategorizedData = {
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
          description: 'Amazon.in - Electronics purchase',
          amount: 1000.00,
          type: 'DR',
          balance: 25000.00,
          ref_no: 'UPI123456789'
        },
        {
          date: '20 Jan 2024',
          description: 'Flipkart - Clothing purchase',
          amount: 300.00,
          type: 'DR',
          balance: 24700.00,
          ref_no: 'UPI987654321'
        },
        {
          date: '25 Jan 2024',
          description: 'Myntra - Fashion items',
          amount: 200.00,
          type: 'DR',
          balance: 24500.00,
          ref_no: 'UPI111222333'
        }
      ],
      'February 2024': [
        {
          date: '10 Feb 2024',
          description: 'Amazon.in - Books purchase',
          amount: 500.00,
          type: 'DR',
          balance: 24000.00,
          ref_no: 'UPI444555666'
        },
        {
          date: '15 Feb 2024',
          description: 'Flipkart - Home goods',
          amount: 500.00,
          type: 'DR',
          balance: 23500.00,
          ref_no: 'UPI777888999'
        }
      ]
    }
  },
  dining: {
    total_amount: 1200.00,
    total_transactions: 4,
    monthly_breakdown: {
      'January 2024': 800.00,
      'February 2024': 400.00
    },
    monthly_transaction_count: {
      'January 2024': 3,
      'February 2024': 1
    },
    monthly_transactions: {
      'January 2024': [
        {
          date: '5 Jan 2024',
          description: 'Zomato - Restaurant delivery',
          amount: 300.00,
          type: 'DR',
          balance: 25200.00,
          ref_no: 'UPI555666777'
        },
        {
          date: '15 Jan 2024',
          description: 'Swiggy - Food delivery',
          amount: 250.00,
          type: 'DR',
          balance: 24950.00,
          ref_no: 'UPI888999000'
        },
        {
          date: '25 Jan 2024',
          description: 'Restaurant - Dine in',
          amount: 250.00,
          type: 'DR',
          balance: 24700.00,
          ref_no: 'CASH001'
        }
      ],
      'February 2024': [
        {
          date: '10 Feb 2024',
          description: 'Zomato - Coffee shop',
          amount: 400.00,
          type: 'DR',
          balance: 24300.00,
          ref_no: 'UPI111333555'
        }
      ]
    }
  },
  utilities: {
    total_amount: 800.00,
    total_transactions: 2,
    monthly_breakdown: {
      'January 2024': 500.00,
      'February 2024': 300.00
    },
    monthly_transaction_count: {
      'January 2024': 1,
      'February 2024': 1
    },
    monthly_transactions: {
      'January 2024': [
        {
          date: '1 Jan 2024',
          description: 'Electricity bill payment',
          amount: 500.00,
          type: 'DR',
          balance: 25500.00,
          ref_no: 'BILL001'
        }
      ],
      'February 2024': [
        {
          date: '1 Feb 2024',
          description: 'Internet bill payment',
          amount: 300.00,
          type: 'DR',
          balance: 25200.00,
          ref_no: 'BILL002'
        }
      ]
    }
  },
  salary: {
    total_amount: 50000.00,
    total_transactions: 2,
    monthly_breakdown: {
      'January 2024': 25000.00,
      'February 2024': 25000.00
    },
    monthly_transaction_count: {
      'January 2024': 1,
      'February 2024': 1
    },
    monthly_transactions: {
      'January 2024': [
        {
          date: '31 Jan 2024',
          description: 'Salary credit - January 2024',
          amount: 25000.00,
          type: 'CR',
          balance: 50000.00,
          ref_no: 'SAL001'
        }
      ],
      'February 2024': [
        {
          date: '29 Feb 2024',
          description: 'Salary credit - February 2024',
          amount: 25000.00,
          type: 'CR',
          balance: 75000.00,
          ref_no: 'SAL002'
        }
      ]
    }
  }
};

// Sample account metadata
export const sampleAccountMetadata = {
  Account_Name: 'John Doe',
  Account_Number: '1234567890',
  Bank_Name: 'Sample Bank',
  IFSC_Code: 'SAMP0001234',
  Total_Transactions: 13
};

// Sample alerts
export const sampleAlerts = [
  'High spending in shopping for January (₹1,500, 3 transactions)',
  'Frequent dining expenses in January (3 transactions, ₹800)',
  'Regular salary credits on month-end'
];

// Sample insights
export const sampleInsights = {
  recommendations: [
    'Consider setting a monthly budget for shopping category',
    'Review dining expenses - consider cooking more at home',
    'Utilities are well-managed with consistent payments'
  ]
}; 