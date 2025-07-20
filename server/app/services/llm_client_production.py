"""
Production-Ready Universal LLM Client
Features: Retry logic, circuit breaker, monitoring, security, async support
"""
import asyncio
import time
import hashlib
import json
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass
from functools import wraps
import openai
import requests
from ..config import settings
import logging
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

@dataclass
class LLMRequest:
    """Structured request data for monitoring"""
    provider: str
    model: str
    feature: str
    token_count: int
    start_time: float
    end_time: Optional[float] = None
    success: Optional[bool] = None
    error: Optional[str] = None

class CircuitBreaker:
    """Circuit breaker pattern for API reliability"""
    
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker protection"""
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e
    
    def _on_success(self):
        """Handle successful call"""
        self.failure_count = 0
        self.state = "CLOSED"
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            logger.warning(f"Circuit breaker opened after {self.failure_count} failures")

class RetryHandler:
    """Retry logic with exponential backoff"""
    
    def __init__(self, max_retries: int = 3, base_delay: float = 1.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
    
    def retry(self, func, *args, **kwargs):
        """Execute function with retry logic"""
        last_exception = None
        
        for attempt in range(self.max_retries + 1):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                
                # Don't retry on certain errors
                if self._should_not_retry(e):
                    raise e
                
                if attempt < self.max_retries:
                    delay = self.base_delay * (2 ** attempt)
                    logger.warning(f"Attempt {attempt + 1} failed, retrying in {delay}s: {str(e)}")
                    time.sleep(delay)
        
        raise last_exception
    
    def _should_not_retry(self, exception: Exception) -> bool:
        """Determine if error should not be retried"""
        error_str = str(exception).lower()
        
        # Don't retry authentication errors
        if "authentication" in error_str or "unauthorized" in error_str:
            return True
        
        # Don't retry invalid requests
        if "invalid" in error_str or "bad request" in error_str:
            return True
        
        return False

class LLMMetrics:
    """Metrics collection for monitoring"""
    
    def __init__(self):
        self.requests: List[LLMRequest] = []
        self.provider_stats: Dict[str, Dict] = {}
    
    def record_request(self, request: LLMRequest):
        """Record a request for monitoring"""
        self.requests.append(request)
        
        # Update provider stats
        if request.provider not in self.provider_stats:
            self.provider_stats[request.provider] = {
                "total_requests": 0,
                "successful_requests": 0,
                "failed_requests": 0,
                "total_tokens": 0,
                "avg_response_time": 0
            }
        
        stats = self.provider_stats[request.provider]
        stats["total_requests"] += 1
        stats["total_tokens"] += request.token_count
        
        if request.success:
            stats["successful_requests"] += 1
        else:
            stats["failed_requests"] += 1
        
        if request.end_time:
            response_time = request.end_time - request.start_time
            stats["avg_response_time"] = (
                (stats["avg_response_time"] * (stats["total_requests"] - 1) + response_time) 
                / stats["total_requests"]
            )
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current metrics"""
        return {
            "total_requests": len(self.requests),
            "provider_stats": self.provider_stats,
            "recent_requests": self.requests[-10:] if self.requests else []
        }

class ProductionLLMClient:
    """Production-ready universal LLM client"""
    
    def __init__(self):
        self.config = settings.get_llm_config()
        self.provider = self.config["provider"]
        self.model = self.config["model"]
        self.api_key = self.config["api_key"]
        self.base_url = self.config["base_url"]
        
        # Production features
        self.circuit_breaker = CircuitBreaker()
        self.retry_handler = RetryHandler()
        self.metrics = LLMMetrics()
        
        # Initialize provider-specific client
        self._init_client()
        
        # Validate configuration
        self._validate_config()
    
    def _validate_config(self):
        """Validate configuration for production"""
        if not self.api_key:
            raise ValueError("API key is required for production")
        
        if not self.model:
            raise ValueError("Model name is required for production")
        
        # Log configuration (without sensitive data)
        safe_config = {
            "provider": self.provider,
            "model": self.model,
            "base_url": self.base_url,
            "max_tokens": self.config["max_tokens"],
            "temperature": self.config["temperature"]
        }
        logger.info(f"LLM Client initialized with config: {safe_config}")
    
    def _init_client(self):
        """Initialize the appropriate client based on provider"""
        try:
            if self.provider == "openai":
                openai.api_key = self.api_key
                if self.base_url:
                    openai.base_url = self.base_url
            elif self.provider == "krutrim":
                openai.api_key = self.api_key
                openai.base_url = self.base_url
            elif self.provider == "anthropic":
                import anthropic
                self.anthropic_client = anthropic.Anthropic(api_key=self.api_key)
            elif self.provider == "ollama":
                openai.api_key = "ollama"
                openai.base_url = self.base_url or "http://localhost:11434/v1"
            else:
                logger.warning(f"Unknown provider '{self.provider}', falling back to OpenAI")
                self.provider = "openai"
                openai.api_key = self.api_key
        except Exception as e:
            logger.error(f"Failed to initialize LLM client: {str(e)}")
            raise
    
    def _sanitize_log_data(self, data: Any) -> Any:
        """Remove sensitive data from logs"""
        if isinstance(data, dict):
            sanitized = {}
            for key, value in data.items():
                if "key" in key.lower() or "token" in key.lower() or "secret" in key.lower():
                    sanitized[key] = "***REDACTED***"
                else:
                    sanitized[key] = self._sanitize_log_data(value)
            return sanitized
        elif isinstance(data, list):
            return [self._sanitize_log_data(item) for item in data]
        else:
            return data
    
    def _estimate_tokens(self, messages: List[Dict[str, str]]) -> int:
        """Estimate token count for monitoring"""
        total_tokens = 0
        for message in messages:
            content = message.get("content", "")
            # Rough estimation: 1 token ≈ 4 characters
            total_tokens += len(content) // 4
        return total_tokens
    
    def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Production-ready chat completion with monitoring and error handling
        """
        start_time = time.time()
        token_count = self._estimate_tokens(messages)
        
        request = LLMRequest(
            provider=self.provider,
            model=self.model,
            feature="chat",
            token_count=token_count,
            start_time=start_time
        )
        
        try:
            # Log request (sanitized)
            safe_messages = self._sanitize_log_data(messages)
            logger.info(f"LLM request: provider={self.provider}, model={self.model}, tokens={token_count}")
            logger.debug(f"Messages: {safe_messages}")
            
            # Execute with circuit breaker and retry
            def _execute():
                return self.retry_handler.retry(
                    self._execute_chat_completion,
                    messages, max_tokens, temperature, **kwargs
                )
            
            result = self.circuit_breaker.call(_execute)
            
            # Record success
            request.end_time = time.time()
            request.success = True
            self.metrics.record_request(request)
            
            logger.info(f"LLM request successful: {request.end_time - start_time:.2f}s")
            return result
            
        except Exception as e:
            # Record failure
            request.end_time = time.time()
            request.success = False
            request.error = str(e)
            self.metrics.record_request(request)
            
            logger.error(f"LLM request failed: {str(e)}")
            raise
    
    def _execute_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Execute chat completion based on provider"""
        if self.provider in ["openai", "krutrim", "ollama"]:
            return self._openai_chat_completion(messages, max_tokens, temperature, **kwargs)
        elif self.provider == "anthropic":
            return self._anthropic_chat_completion(messages, max_tokens, temperature, **kwargs)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    def _openai_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """OpenAI-compatible chat completion with timeout"""
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens or self.config["max_tokens"],
                temperature=temperature or self.config["temperature"],
                timeout=self.config["timeout"],
                **kwargs
            )
            return response
        except openai.error.RateLimitError:
            raise Exception("Rate limit exceeded. Please try again later.")
        except openai.error.AuthenticationError:
            raise Exception("Authentication failed. Please check API key.")
        except openai.error.APIError as e:
            raise Exception(f"API error: {str(e)}")
        except Exception as e:
            raise Exception(f"Unexpected error: {str(e)}")
    
    def _anthropic_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Anthropic chat completion"""
        try:
            prompt = self._convert_messages_to_prompt(messages)
            
            response = self.anthropic_client.messages.create(
                model=self.model,
                max_tokens=max_tokens or self.config["max_tokens"],
                temperature=temperature or self.config["temperature"],
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            
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
        """Convert OpenAI format to Anthropic format"""
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
        """Production-ready vision completion"""
        if not self.validate_model_compatibility("vision"):
            recommended = self.get_recommended_model(self.provider, "vision")
            raise ValueError(
                f"Vision not supported for {self.provider} model '{self.model}'. "
                f"Recommended model: {recommended}"
            )
        
        start_time = time.time()
        token_count = self._estimate_tokens(messages)
        
        request = LLMRequest(
            provider=self.provider,
            model=self.model,
            feature="vision",
            token_count=token_count,
            start_time=start_time
        )
        
        try:
            logger.info(f"Vision request: provider={self.provider}, model={self.model}")
            
            def _execute():
                return self.retry_handler.retry(
                    self._execute_vision_completion,
                    messages, max_tokens, temperature, **kwargs
                )
            
            result = self.circuit_breaker.call(_execute)
            
            request.end_time = time.time()
            request.success = True
            self.metrics.record_request(request)
            
            return result
            
        except Exception as e:
            request.end_time = time.time()
            request.success = False
            request.error = str(e)
            self.metrics.record_request(request)
            
            logger.error(f"Vision request failed: {str(e)}")
            raise
    
    def _execute_vision_completion(
        self, 
        messages: List[Dict[str, Any]], 
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Execute vision completion"""
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens or self.config["max_tokens"],
                temperature=temperature or self.config["temperature"],
                timeout=self.config["timeout"],
                **kwargs
            )
            return response
        except Exception as e:
            raise Exception(f"Vision API error: {str(e)}")
    
    def file_upload(self, file_path: str, purpose: str = "assistants") -> str:
        """Production-ready file upload"""
        if not self.validate_model_compatibility("file_upload"):
            recommended = self.get_recommended_model(self.provider, "file_upload")
            raise ValueError(
                f"File upload not supported for {self.provider} model '{self.model}'. "
                f"Recommended model: {recommended}"
            )
        
        start_time = time.time()
        
        request = LLMRequest(
            provider=self.provider,
            model=self.model,
            feature="file_upload",
            token_count=0,  # File upload doesn't consume tokens
            start_time=start_time
        )
        
        try:
            logger.info(f"File upload: provider={self.provider}, file={file_path}")
            
            def _execute():
                return self.retry_handler.retry(
                    self._execute_file_upload,
                    file_path, purpose
                )
            
            result = self.circuit_breaker.call(_execute)
            
            request.end_time = time.time()
            request.success = True
            self.metrics.record_request(request)
            
            return result
            
        except Exception as e:
            request.end_time = time.time()
            request.success = False
            request.error = str(e)
            self.metrics.record_request(request)
            
            logger.error(f"File upload failed: {str(e)}")
            raise
    
    def _execute_file_upload(self, file_path: str, purpose: str = "assistants") -> str:
        """Execute file upload"""
        try:
            with open(file_path, 'rb') as file:
                response = openai.files.create(
                    file=file,
                    purpose=purpose
                )
            return response.id
        except Exception as e:
            raise Exception(f"File upload error: {str(e)}")
    
    def validate_model_compatibility(self, feature: str = "chat") -> bool:
        """Validate model compatibility"""
        model = self.model.lower()
        
        if feature == "vision":
            if self.provider == "openai":
                return any(vision_model in model for vision_model in ["gpt-4o", "gpt-4-vision"])
            elif self.provider == "krutrim":
                return "vision" in model or "pro" in model
            elif self.provider == "anthropic":
                return "opus" in model or "sonnet" in model
            else:
                return False
        
        elif feature == "file_upload":
            return self.provider in ["openai", "krutrim"]
        
        elif feature == "chat":
            return True
        
        return False
    
    def get_recommended_model(self, provider: str, feature: str = "chat") -> str:
        """Get recommended model"""
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
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        return self.metrics.get_stats()
    
    def health_check(self) -> Dict[str, Any]:
        """Health check for monitoring"""
        try:
            # Test simple completion
            response = self.chat_completion([
                {"role": "user", "content": "Hello"}
            ])
            
            return {
                "status": "healthy",
                "provider": self.provider,
                "model": self.model,
                "response_time": "ok"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "provider": self.provider,
                "model": self.model,
                "error": str(e)
            }

# Global production client instance
llm_client_production = ProductionLLMClient() 