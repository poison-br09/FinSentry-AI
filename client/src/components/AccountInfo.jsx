import React from 'react';

const AccountInfo = ({ metadata }) => {
  const {
    Account_Name,
    Account_Number,
    Bank_Name,
    IFSC_Code,
    // Total_Transactions,
  } = metadata;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Account Information</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          <tr><td><strong>Account Name:</strong></td><td>{Account_Name}</td></tr>
          <tr><td><strong>Account Number:</strong></td><td>{Account_Number}</td></tr>
          <tr><td><strong>Bank:</strong></td><td>{Bank_Name}</td></tr>
          <tr><td><strong>IFSC Code:</strong></td><td>{IFSC_Code}</td></tr>
          {/* <tr><td><strong>Total Transactions:</strong></td><td>{Total_Transactions}</td></tr> */}
        </tbody>
      </table>
    </div>
  );
};

export default AccountInfo;
