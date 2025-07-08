import React from 'react';

const AlertsPanel = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3> Alerts</h3>
      <ul style={{ color: 'red', fontWeight: '500' }}>
        {alerts.map((alert, idx) => (
          <li key={idx}>{alert}</li>
        ))}
      </ul>
    </div>
  );
};

export default AlertsPanel;
