// Currency selection and formatting utilities
export const getSelectedCurrency = () => {
  return localStorage.getItem('selectedCurrency') || 'USD';
};

export const setSelectedCurrency = (currency) => {
  localStorage.setItem('selectedCurrency', currency);
};

// Comprehensive currency list with country names
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union' },
  { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country: 'Canada' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', country: 'China' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', country: 'Switzerland' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', country: 'Sweden' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', country: 'Norway' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', country: 'Denmark' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', country: 'Poland' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', country: 'Czech Republic' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', country: 'Hungary' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', country: 'Russia' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', country: 'Brazil' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', country: 'Mexico' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', country: 'South Korea' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', country: 'Thailand' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', country: 'Malaysia' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', country: 'Indonesia' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', country: 'Philippines' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', country: 'Vietnam' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', country: 'Turkey' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', country: 'Israel' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', country: 'United Arab Emirates' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', country: 'Saudi Arabia' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', country: 'Qatar' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', country: 'Kuwait' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', country: 'Bahrain' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', country: 'Oman' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.أ', country: 'Jordan' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', country: 'Lebanon' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', country: 'Egypt' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', country: 'Nigeria' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', country: 'Ghana' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', country: 'Uganda' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', country: 'Tanzania' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', country: 'Zambia' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', country: 'Botswana' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', country: 'Namibia' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', country: 'Mauritius' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', country: 'Sri Lanka' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', country: 'Bangladesh' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', country: 'Pakistan' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', country: 'Nepal' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', country: 'Myanmar' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', country: 'Laos' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', country: 'Cambodia' },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', country: 'Mongolia' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', country: 'Kazakhstan' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'so\'m', country: 'Uzbekistan' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ', country: 'Tajikistan' },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'T', country: 'Turkmenistan' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', country: 'Azerbaijan' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', country: 'Georgia' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', country: 'Armenia' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', country: 'Belarus' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', country: 'Moldova' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', country: 'Ukraine' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.', country: 'Serbia' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', country: 'Bulgaria' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', country: 'Croatia' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', country: 'Romania' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', country: 'Albania' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', country: 'North Macedonia' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', country: 'Bosnia and Herzegovina' }
];

export const formatCurrency = (amount, currency = null) => {
  if (typeof amount !== 'number') return '-';
  
  // Use provided currency or get from localStorage
  const selectedCurrency = currency || getSelectedCurrency();
  
  // Find currency info from the CURRENCIES array
  const currencyInfo = CURRENCIES.find(c => c.code === selectedCurrency);
  const symbol = currencyInfo ? currencyInfo.symbol : selectedCurrency;
  
  // Format based on currency
  if (selectedCurrency === 'USD' || selectedCurrency === 'CAD' || selectedCurrency === 'AUD' || selectedCurrency === 'NZD') {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (selectedCurrency === 'EUR' || selectedCurrency === 'GBP') {
    return `${symbol}${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (selectedCurrency === 'INR') {
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (selectedCurrency === 'JPY' || selectedCurrency === 'CNY') {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else {
    // Generic formatting for other currencies
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

// Category name formatting
export const formatCategoryName = (category) => {
  if (!category) return '';
  
  // Handle common patterns
  const replacements = {
    'card_withdrawals': 'Card Withdrawals',
    'atm_withdrawals': 'ATM Withdrawals',
    'online_purchases': 'Online Purchases',
    'grocery_shopping': 'Grocery Shopping',
    'restaurant_dining': 'Restaurant & Dining',
    'transportation': 'Transportation',
    'gas_station': 'Gas Station',
    'healthcare': 'Healthcare',
    'entertainment': 'Entertainment',
    'utilities': 'Utilities',
    'rent_mortgage': 'Rent & Mortgage',
    'insurance': 'Insurance',
    'subscriptions': 'Subscriptions',
    'travel': 'Travel',
    'education': 'Education',
    'clothing': 'Clothing',
    'electronics': 'Electronics',
    'home_improvement': 'Home Improvement',
    'personal_care': 'Personal Care',
    'charity_donations': 'Charity & Donations',
    'investment': 'Investment',
    'salary_income': 'Salary & Income',
    'freelance_income': 'Freelance Income',
    'business_income': 'Business Income',
    'interest_income': 'Interest Income',
    'dividend_income': 'Dividend Income',
    'refunds': 'Refunds',
    'transfers': 'Transfers',
    'fees_charges': 'Fees & Charges',
    'late_fees': 'Late Fees',
    'overdraft_fees': 'Overdraft Fees',
    'atm_fees': 'ATM Fees',
    'foreign_transaction_fees': 'Foreign Transaction Fees',
    'maintenance_fees': 'Maintenance Fees',
    'annual_fees': 'Annual Fees',
    'balance_transfer_fees': 'Balance Transfer Fees',
    'cash_advance_fees': 'Cash Advance Fees',
    'returned_check_fees': 'Returned Check Fees',
    'stop_payment_fees': 'Stop Payment Fees',
    'wire_transfer_fees': 'Wire Transfer Fees',
    'check_ordering_fees': 'Check Ordering Fees',
    'statement_copy_fees': 'Statement Copy Fees',
    'research_fees': 'Research Fees',
    'legal_fees': 'Legal Fees',
    'collection_fees': 'Collection Fees',
    'garnishment_fees': 'Garnishment Fees',
    'levy_fees': 'Levy Fees',
    'seizure_fees': 'Seizure Fees',
    'lien_fees': 'Lien Fees',
    'judgment_fees': 'Judgment Fees',
    'execution_fees': 'Execution Fees',
    'sheriff_fees': 'Sheriff Fees',
    'court_fees': 'Court Fees',
    'filing_fees': 'Filing Fees',
    'service_fees': 'Service Fees',
    'process_fees': 'Process Fees',
    'witness_fees': 'Witness Fees',
    'expert_fees': 'Expert Fees',
    'appraisal_fees': 'Appraisal Fees',
    'survey_fees': 'Survey Fees',
    'title_fees': 'Title Fees',
    'escrow_fees': 'Escrow Fees',
    'closing_fees': 'Closing Fees',
    'origination_fees': 'Origination Fees',
    'points_fees': 'Points Fees',
    'discount_fees': 'Discount Fees',
    'commitment_fees': 'Commitment Fees',
    'application_fees': 'Application Fees',
    'credit_report_fees': 'Credit Report Fees',
    'flood_certificate_fees': 'Flood Certificate Fees',
    'tax_service_fees': 'Tax Service Fees',
    'processing_fees': 'Processing Fees',
    'underwriting_fees': 'Underwriting Fees',
    'documentation_fees': 'Documentation Fees',
    'notary_fees': 'Notary Fees',
    'recording_fees': 'Recording Fees',
    'transfer_taxes': 'Transfer Taxes',
    'stamp_taxes': 'Stamp Taxes',
    'intangible_taxes': 'Intangible Taxes',
    'documentary_stamp_taxes': 'Documentary Stamp Taxes',
    'mortgage_taxes': 'Mortgage Taxes',
    'property_taxes': 'Property Taxes',
    'school_taxes': 'School Taxes',
    'county_taxes': 'County Taxes',
    'city_taxes': 'City Taxes',
    'state_taxes': 'State Taxes',
    'federal_taxes': 'Federal Taxes',
    'income_taxes': 'Income Taxes',
    'sales_taxes': 'Sales Taxes',
    'use_taxes': 'Use Taxes',
    'excise_taxes': 'Excise Taxes',
    'luxury_taxes': 'Luxury Taxes',
    'sin_taxes': 'Sin Taxes',
    'carbon_taxes': 'Carbon Taxes',
    'value_added_taxes': 'Value Added Taxes',
    'goods_and_services_taxes': 'Goods and Services Taxes',
    'harmonized_sales_taxes': 'Harmonized Sales Taxes',
    'provincial_sales_taxes': 'Provincial Sales Taxes',
    'territorial_sales_taxes': 'Territorial Sales Taxes',
    'gst': 'GST',
    'hst': 'HST',
    'pst': 'PST',
    'qst': 'QST',
    'vat': 'VAT',
    'cst': 'CST',
    'sst': 'SST',
    'mst': 'MST',
    'lst': 'LST',
    'rst': 'RST',
    'tst': 'TST',
    'ust': 'UST',
    'vst': 'VST',
    'wst': 'WST',
    'xst': 'XST',
    'yst': 'YST',
    'zst': 'ZST'
  };
  
  // Check if we have a direct replacement
  if (replacements[category.toLowerCase()]) {
    return replacements[category.toLowerCase()];
  }
  
  // Generic formatting: capitalize first letter and replace underscores with spaces
  return category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}; 