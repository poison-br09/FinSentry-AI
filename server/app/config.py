import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")  # Empty default, will be validated
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    
    # LLM Configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai").lower()  # openai, krutrim, anthropic, etc.
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o")  # Model name for the selected provider
    LLM_API_KEY: Optional[str] = os.getenv("LLM_API_KEY")  # Generic API key
    LLM_BASE_URL: Optional[str] = os.getenv("LLM_BASE_URL")  # For custom endpoints
    
    # Legacy OpenAI support (for backward compatibility)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    
    # Model-specific configurations
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "4000"))
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.1"))
    LLM_TIMEOUT: int = int(os.getenv("LLM_TIMEOUT", "60"))
    
    # File Upload
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB default
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    @classmethod
    def get_llm_config(cls) -> dict:
        """Get LLM configuration based on provider"""
        config = {
            "provider": cls.LLM_PROVIDER,
            "model": cls.LLM_MODEL,
            "api_key": cls.LLM_API_KEY or cls.OPENAI_API_KEY,
            "base_url": cls.LLM_BASE_URL,
            "max_tokens": cls.LLM_MAX_TOKENS,
            "temperature": cls.LLM_TEMPERATURE,
            "timeout": cls.LLM_TIMEOUT
        }
        
        # Provider-specific configurations
        if cls.LLM_PROVIDER == "openai":
            config["api_key"] = cls.OPENAI_API_KEY or cls.LLM_API_KEY
        elif cls.LLM_PROVIDER == "krutrim":
            config["base_url"] = cls.LLM_BASE_URL or "https://api.krutrim.ai/v1"
        elif cls.LLM_PROVIDER == "anthropic":
            config["base_url"] = cls.LLM_BASE_URL or "https://api.anthropic.com"
        
        return config
    
    @classmethod
    def validate(cls):
        """Validate required settings"""
        if not cls.SECRET_KEY:
            raise ValueError("SECRET_KEY environment variable is required!")
        
        # Validate LLM configuration
        llm_config = cls.get_llm_config()
        if not llm_config["api_key"]:
            print(f"⚠️  WARNING: LLM_API_KEY not set for provider '{cls.LLM_PROVIDER}'. Some features may not work!")
        
        if cls.LLM_PROVIDER not in ["openai", "krutrim", "anthropic", "ollama"]:
            print(f"⚠️  WARNING: Unsupported LLM provider '{cls.LLM_PROVIDER}'. Using OpenAI as fallback.")

# Global settings instance
settings = Settings() 