import openai
import json
from typing import Dict, Any
from ..config import settings

# Configure your OpenAI API key
client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

MALICIOUS_DETECTION_PROMPT = """
You are a cybersecurity expert AI designed to detect malicious messages, scams, phishing attempts, and fraudulent communications.

Your task is to analyze the given message and determine if it's malicious or legitimate. You must provide a detailed analysis with specific reasons.

CRITICAL: You must respond with ONLY a valid JSON object. Do not include any explanations, markdown formatting, or additional text outside the JSON.

Use this EXACT JSON structure:

{
  "is_malicious": true,
  "confidence_score": 0.85,
  "threat_level": "HIGH",
  "detected_threats": [
    {
      "type": "scam",
      "description": "This is a classic lottery scam attempting to extract money from the victim",
      "indicators": ["promises of large sums of money", "requests for processing fees", "urgency to respond"]
    }
  ],
  "analysis": {
    "suspicious_elements": ["promises unrealistic money", "requests payment", "creates urgency"],
    "legitimate_elements": [],
    "recommendations": ["Do not send any money", "Do not provide personal information", "Report to authorities"]
  },
  "alert_message": "This appears to be a scam message. Do not send any money or provide personal information."
}

Detection Criteria:
1. Phishing Indicators:
   - Urgent action required
   - Suspicious links or domains
   - Requests for personal/financial information
   - Poor grammar or spelling
   - Impersonation of trusted entities

2. Scam Indicators:
   - Too good to be true offers
   - Requests for money or payments
   - Pressure tactics
   - Unusual payment methods
   - Requests for account access

3. Malware Indicators:
   - Suspicious attachments
   - Executable files
   - Unusual file extensions
   - Requests to download software

4. Social Engineering:
   - Emotional manipulation
   - Authority figures mentioned
   - Fear or urgency tactics
   - Personal information gathering

5. Financial Fraud:
   - Banking-related urgency
   - Account verification requests
   - Investment opportunities
   - Lottery or prize notifications

Analyze the message thoroughly and provide specific evidence for your classification.
"""

def detect_malicious_message(message: str, model: str = "gpt-4o") -> Dict[str, Any]:
    """
    Analyzes a message to detect if it's malicious or a scam.
    
    Args:
        message (str): The message to analyze
        model (str): The OpenAI model to use
        
    Returns:
        Dict[str, Any]: Analysis results with threat detection
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": MALICIOUS_DETECTION_PROMPT},
                {
                    "role": "user", 
                    "content": f"Analyze this message for malicious content:\n\n{message}"
                }
            ],
            temperature=0.1  # Low temperature for consistent analysis
        )
        
        content = response.choices[0].message.content
        
        # Parse the JSON response
        try:
            result = json.loads(content)
            
            # Validate required fields
            required_fields = ["is_malicious", "confidence_score", "threat_level", "detected_threats", "analysis", "alert_message"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field: {field}")
            
            return result
            
        except json.JSONDecodeError as e:
            # Fallback response if JSON parsing fails
            print(f"[DEBUG] JSON parsing failed. Raw response: {content}")
            print(f"[DEBUG] JSON error: {str(e)}")
            
            return {
                "is_malicious": True,
                "confidence_score": 0.8,
                "threat_level": "MEDIUM",
                "detected_threats": [
                    {
                        "type": "other",
                        "description": "Unable to parse analysis response",
                        "indicators": ["Analysis error"]
                    }
                ],
                "analysis": {
                    "suspicious_elements": ["Analysis failed"],
                    "legitimate_elements": [],
                    "recommendations": ["Please review the message manually and be cautious"]
                },
                "alert_message": "Unable to analyze message. Please review manually and be cautious.",
                "error": f"JSON parsing failed: {str(e)}",
                "raw_response": content[:500]  # Include first 500 chars of raw response for debugging
            }
            
    except Exception as e:
        # Error handling with more specific error messages
        error_message = str(e)
        
        if "authentication" in error_message.lower() or "api_key" in error_message.lower():
            alert_msg = "OpenAI API authentication failed. Please check API key configuration."
        elif "rate" in error_message.lower() or "quota" in error_message.lower():
            alert_msg = "OpenAI API rate limit exceeded. Please try again later."
        elif "network" in error_message.lower() or "connection" in error_message.lower():
            alert_msg = "Network connection error. Please check your internet connection."
        else:
            alert_msg = f"Analysis service error: {error_message}"
        
        return {
            "is_malicious": True,
            "confidence_score": 0.7,
            "threat_level": "MEDIUM",
            "detected_threats": [
                {
                    "type": "other",
                    "description": "Analysis service error",
                    "indicators": [error_message]
                }
            ],
            "analysis": {
                "suspicious_elements": ["Analysis service error"],
                "legitimate_elements": [],
                "recommendations": ["Please review the message manually and be cautious"]
            },
            "alert_message": alert_msg,
            "error": error_message
        } 