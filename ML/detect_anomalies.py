# detect_anomalies.py

import json
import pandas as pd
from sklearn.ensemble import IsolationForest

def load_transactions(path):
    with open(path) as f:
        data = json.load(f)
    return pd.DataFrame(data)

def rule_based_flags(df):
    flags = []

    for _, row in df.iterrows():
        if row['DR'] and row['DR'] > 50000:
            flags.append("🚨 High debit")
        elif "3AM" in row['Date']:
            flags.append("🕒 Suspicious time")
        elif "lottery" in row['Description'].lower():
            flags.append("🎰 Suspicious keyword")
        else:
            flags.append("")
    df['RuleFlags'] = flags
    return df

def ml_anomaly_detection(df):
    model = IsolationForest(contamination=0.05)
    df['Amount'] = df['DR'].fillna(0) - df['CR'].fillna(0)
    df['AnomalyScore'] = model.fit_predict(df[['Amount']])
    df['Anomaly'] = df['AnomalyScore'].apply(lambda x: "Yes" if x == -1 else "No")
    return df

def detect_and_save(input_path, output_path):
    df = load_transactions(input_path)
    df = rule_based_flags(df)
    df = ml_anomaly_detection(df)
    df.drop(columns=['Amount', 'AnomalyScore'], inplace=True)
    df.to_json(output_path, orient='records', indent=2)
    print(f"[✔] Anomalies detected → {output_path}")

if __name__ == "__main__":
    detect_and_save("output_raw.json", "anomalies.json")
