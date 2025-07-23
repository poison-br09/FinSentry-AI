"""
Universal LLM Client - Supports multiple providers
"""
import openai
import requests
import json
import time
from typing import Dict, Any, Optional, List
from ..config import settings
import logging

logger = logging.getLogger(__name__)

class LLMClient:
    """Universal LLM client supporting multiple providers"""
    
    def __init__(self):
        self.config = settings.get_llm_config()
        self.provider = self.config["provider"]
        self.model = self.config["model"]
        self.api_key = self.config["api_key"]
        self.base_url = self.config["base_url"]
        
        # Initialize provider-specific client
        self._init_client()
    
    def _init_client(self):
        """Initialize the appropriate client based on provider"""
        if self.provider == "openai":
            openai.api_key = self.api_key
            if self.base_url:
                openai.base_url = self.base_url
        elif self.provider == "krutrim":
            # Krutrim uses OpenAI-compatible API
            openai.api_key = self.api_key
            openai.base_url = self.base_url
        elif self.provider == "anthropic":
            # Anthropic uses different client
            import anthropic
            self.anthropic_client = anthropic.Anthropic(api_key=self.api_key)
        elif self.provider == "ollama":
            # Ollama uses local API
            openai.api_key = "ollama"  # Dummy key for Ollama
            openai.base_url = self.base_url or "http://localhost:11434/v1"
        else:
            # Fallback to OpenAI if unknown provider
            logger.warning(f"Unknown provider '{self.provider}', falling back to OpenAI")
            self.provider = "openai"
            openai.api_key = self.api_key
    
    def validate_model_compatibility(self, feature: str = "chat") -> bool:
        """Validate if the current model supports the requested feature"""
        model = self.model.lower()
        
        # print(f"[DEBUG] Validating model compatibility - Model: {model}, Feature: {feature}")
        
        # Vision support
        if feature == "vision":
            if self.provider == "openai":
                vision_supported = any(vision_model in model for vision_model in ["gpt-4o", "gpt-4-vision"])
                # print(f"[DEBUG] OpenAI vision support: {vision_supported}")
                return vision_supported
            elif self.provider == "krutrim":
                vision_supported = "vision" in model or "pro" in model
                # print(f"[DEBUG] Krutrim vision support: {vision_supported}")
                return vision_supported
            elif self.provider == "anthropic":
                vision_supported = "opus" in model or "sonnet" in model
                # print(f"[DEBUG] Anthropic vision support: {vision_supported}")
                return vision_supported
            else:
                # print(f"[DEBUG] Unknown provider for vision: {self.provider}")
                return False
        
        # File upload support
        elif feature == "file_upload":
            if self.provider in ["openai", "krutrim"]:
                # print(f"[DEBUG] File upload supported for {self.provider}")
                return True
            else:
                # print(f"[DEBUG] File upload not supported for {self.provider}")
                return False
        
        # Chat support (all models support this)
        elif feature == "chat":
            # print(f"[DEBUG] Chat supported for all models")
            return True
        
        # print(f"[DEBUG] Unknown feature: {feature}")
        return False
    
    def get_recommended_model(self, provider: str, feature: str = "chat") -> str:
        """Get recommended model for provider and feature"""
        recommendations = {
            "openai": {
                "chat": "gpt-3.5-turbo",
                "vision": "gpt-4o",
                "file_upload": "gpt-4o",
                "best": "gpt-4o"
            },
            "krutrim": {
                "chat": "krutrim-pro-lite",
                "vision": "krutrim-pro",
                "file_upload": "krutrim-pro",
                "best": "krutrim-pro"
            },
            "anthropic": {
                "chat": "claude-3-haiku-20240307",
                "vision": "claude-3-sonnet-20240229",
                "file_upload": "claude-3-sonnet-20240229",
                "best": "claude-3-sonnet-20240229"
            },
            "ollama": {
                "chat": "llama2",
                "vision": "llama2",
                "file_upload": "llama2",
                "best": "llama2"
            }
        }
        
        return recommendations.get(provider, {}).get(feature, "unknown")
    
    def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Universal chat completion method
        """
        try:
            if self.provider in ["openai", "krutrim", "ollama"]:
                return self._openai_chat_completion(messages, max_tokens, temperature, **kwargs)
            elif self.provider == "anthropic":
                return self._anthropic_chat_completion(messages, max_tokens, temperature, **kwargs)
            else:
                raise ValueError(f"Unsupported provider: {self.provider}")
                
        except Exception as e:
            logger.error(f"LLM API error with {self.provider}: {str(e)}")
            raise
    
    def _openai_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """OpenAI-compatible chat completion"""
        try:
            # print(f"[DEBUG] LLM Client - Provider: {self.provider}, Model: {self.model}")
            # print(f"[DEBUG] LLM Client - API Key: {self.api_key[:20]}..." if self.api_key else "[DEBUG] LLM Client - No API Key!")
            # print(f"[DEBUG] LLM Client - Base URL: {self.base_url}")
            
            # Use the new OpenAI API syntax with timeout
            client = openai.OpenAI(
                api_key=self.api_key, 
                base_url=self.base_url,
                timeout=self.config.get("timeout", 120)
            )
            
            # print(f"[DEBUG] Sending request to OpenAI with model: {self.model}")
            # print(f"[DEBUG] Messages: {messages}")
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens or self.config["max_tokens"],
                temperature=temperature or self.config["temperature"],
                **kwargs
            )
            # print(f"[DEBUG] OpenAI response received successfully")
            return response
        except Exception as e:
            error_str = str(e).lower()
            if "rate" in error_str or "quota" in error_str:
                raise Exception("Rate limit exceeded. Please try again later.")
            elif "authentication" in error_str or "unauthorized" in error_str:
                raise Exception("Authentication failed. Please check API key.")
            else:
                raise Exception(f"API error: {str(e)}")
    
    def _anthropic_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Anthropic chat completion"""
        try:
            # Convert OpenAI format to Anthropic format
            prompt = self._convert_messages_to_prompt(messages)
            
            response = self.anthropic_client.messages.create(
                model=self.model,
                max_tokens=max_tokens or self.config["max_tokens"],
                temperature=temperature or self.config["temperature"],
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            
            # Convert to OpenAI format for consistency
            return {
                "choices": [{
                    "message": {
                        "content": response.content[0].text,
                        "role": "assistant"
                    }
                }]
            }
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")
    
    def _convert_messages_to_prompt(self, messages: List[Dict[str, str]]) -> str:
        """Convert OpenAI message format to Anthropic prompt format"""
        prompt = ""
        for message in messages:
            role = message["role"]
            content = message["content"]
            
            if role == "system":
                prompt += f"System: {content}\n\n"
            elif role == "user":
                prompt += f"Human: {content}\n\n"
            elif role == "assistant":
                prompt += f"Assistant: {content}\n\n"
        
        prompt += "Assistant:"
        return prompt
    
    def vision_completion(
        self, 
        messages: List[Dict[str, Any]], 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Vision completion for image analysis
        """
        # Validate vision support
        if not self.validate_model_compatibility("vision"):
            recommended = self.get_recommended_model(self.provider, "vision")
            raise ValueError(
                f"Vision not supported for {self.provider} model '{self.model}'. "
                f"Recommended model: {recommended}"
            )
        
        try:
            # print(f"[DEBUG] Vision completion - Provider: {self.provider}, Model: {self.model}")
            # print(f"[DEBUG] Vision messages structure: {len(messages)} messages")
            
            # Log message content without the large base64 image
            # for i, msg in enumerate(messages):
            #     if msg.get("role") == "user" and isinstance(msg.get("content"), list):
            #         content_summary = []
            #         for item in msg["content"]:
            #             if item.get("type") == "text":
            #                 content_summary.append(f"text: {item['text'][:100]}...")
            #             elif item.get("type") == "image_url":
            #                 content_summary.append("image_url: [base64 data]")
            #         print(f"[DEBUG] Message {i} content: {content_summary}")
            #     else:
            #         print(f"[DEBUG] Message {i}: {msg.get('role', 'unknown')} - {str(msg.get('content', ''))[:100]}...")
            
            # Use the new OpenAI API syntax with timeout
            client = openai.OpenAI(
                api_key=self.api_key, 
                base_url=self.base_url,
                timeout=self.config.get("timeout", 120)
            )
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens or self.config["max_tokens"],
                temperature=temperature or self.config["temperature"],
                **kwargs
            )
            # print(f"[DEBUG] Vision response received successfully")
            # print(f"[DEBUG] Response content length: {len(response.choices[0].message.content)}")
            # print(f"[DEBUG] Response content preview: {response.choices[0].message.content[:200]}...")
            return response
        except Exception as e:
            logger.error(f"Vision API error: {str(e)}")
            raise
    
    def file_upload(self, file, purpose: str = "assistants") -> str:
        """
        Upload file for analysis (OpenAI/Krutrim compatible)
        Supports both file path (str) and file tuple (filename, file_bytes)
        """
        # Validate file upload support
        if not self.validate_model_compatibility("file_upload"):
            recommended = self.get_recommended_model(self.provider, "file_upload")
            raise ValueError(
                f"File upload not supported for {self.provider} model '{self.model}'. "
                f"Recommended model: {recommended}"
            )
        
        try:
            # Use the new OpenAI API syntax with timeout
            client = openai.OpenAI(
                api_key=self.api_key, 
                base_url=self.base_url,
                timeout=self.config.get("timeout", 120)
            )
            
            # Handle different file input formats
            if isinstance(file, str):
                # file is a file path
                # print(f"[DEBUG] Uploading file from path: {file}")
                with open(file, 'rb') as f:
                    response = client.files.create(
                        file=f,
                        purpose="assistants"
                    )
            elif isinstance(file, tuple) and len(file) == 2:
                # file is a tuple (filename, file_bytes)
                filename, file_bytes = file
                # print(f"[DEBUG] Uploading file from bytes: {filename}, {len(file_bytes)} bytes")
                import io
                file_obj = io.BytesIO(file_bytes)
                file_obj.name = filename
                response = client.files.create(
                    file=file_obj,
                    purpose="assistants"
                )
            else:
                raise ValueError(f"Invalid file format. Expected string (file path) or tuple (filename, bytes), got {type(file)}")
                
            # print(f"[DEBUG] File uploaded successfully, ID: {response.id}")
            return response.id
        except Exception as e:
            logger.error(f"File upload error: {str(e)}")
            raise

# Global LLM client instance
llm_client = LLMClient() 