import React from "react";

const InsightsPanel = ({ insights }) => {
  if (!insights || !insights.recommendations?.length) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3> Recommendations</h3>
      <ul style={{ color: "green", fontWeight: "500" }}>
        {insights.recommendations.map((rec, idx) => (
          <li key={idx}>{rec}</li>
        ))}
      </ul>
    </div>
  );
};

export default InsightsPanel;
