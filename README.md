# 🏦 FinSentry AI - Bank Statement Analysis Platform

A comprehensive AI-powered platform for analyzing bank statements, detecting malicious messages, and providing financial insights with real-time streaming capabilities.

## 🚀 Features

- **📊 Bank Statement Analysis**: AI-powered categorization and analysis of bank transactions
- **🛡️ Malicious Message Detection**: Real-time detection of scams, phishing, and fraudulent communications
- **📈 Financial Insights**: Detailed spending breakdowns and monthly analytics
- **⚡ Real-time Streaming**: Live progress updates during analysis
- **🔒 Secure Authentication**: JWT-based user authentication
- **📱 Responsive UI**: Modern React frontend with Tailwind CSS
- **🔧 Production Ready**: Environment-based configuration and security best practices

## 🏗️ Architecture

```
FinSentry AI/
├── client/                 # React Frontend (Yarn)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── api/           # API configuration
│   │   └── config/        # Environment configuration
│   └── build/             # Production build
├── server/                # FastAPI Backend
│   ├── app/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   └── config.py      # Environment configuration
│   └── uploads/           # File upload directory
└── ML/                    # Machine Learning scripts
```

## 🛠️ Technology Stack

### Frontend
- **React 19** with Hooks
- **Yarn** package manager
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **Axios** for API communication

### Backend
- **FastAPI** for API development
- **SQLAlchemy** for database ORM
- **PostgreSQL** database
- **PyJWT** for authentication
- **OpenAI GPT-4o** for AI analysis
- **Python-dotenv** for environment management

### Security
- **JWT Authentication**
- **Environment-based secrets**
- **CORS configuration**
- **Request timeouts**
- **Input validation**

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Yarn
- PostgreSQL
- LLM API key (OpenAI, Krutrim, Anthropic, or other supported provider)

### Backend Setup

1. **Clone and navigate to server directory:**
   ```bash
   cd server
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values:
   # - SECRET_KEY (generate a secure key)
   # - DATABASE_URL (your PostgreSQL connection)
   # - LLM_PROVIDER (openai, krutrim, anthropic, ollama)
   # - LLM_MODEL (model name for your provider)
   # - OPENAI_API_KEY (your OpenAI API key)
   # - LLM_API_KEY (your other provider API key)
   # - ALLOWED_ORIGINS (your frontend domain)
   ```

5. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Configure environment:**
   ```bash
   # Development
   cp .env.development .env.local
   
   # Production
   cp .env.production .env.local
   # Update REACT_APP_API_BASE_URL to your backend URL
   ```

4. **Start development server:**
   ```bash
   yarn start
   ```

5. **Build for production:**
   ```bash
   yarn build
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# =============================================================================
# LLM PROVIDER CONFIGURATION
# =============================================================================
# This system supports multiple LLM providers. You can easily switch between them
# by changing the LLM_PROVIDER setting below.

# Current LLM Provider (openai, krutrim, anthropic, ollama)
LLM_PROVIDER=openai

# LLM Model for the selected provider
LLM_MODEL=gpt-4o

# Base URL for the selected provider
LLM_BASE_URL=https://api.openai.com/v1

# =============================================================================
# API KEYS FOR DIFFERENT PROVIDERS
# =============================================================================
# OPENAI_API_KEY: Used when LLM_PROVIDER=openai
# - Supports: GPT-4o, GPT-3.5-turbo, GPT-4
# - Features: Vision, file upload, chat completions
# - Base URL: https://api.openai.com/v1
OPENAI_API_KEY=your_openai_api_key_here

# LLM_API_KEY: Used when LLM_PROVIDER=krutrim (or other non-OpenAI providers)
# - Supports: Krutrim models (Llama-3.3-70B-Instruct, Qwen3-32B, etc.)
# - Features: Chat completions (vision support varies by model)
# - Base URL: https://cloud.olakrutrim.com/v1
LLM_API_KEY=your_krutrim_or_other_provider_api_key_here

# =============================================================================
# MODEL PARAMETERS
# =============================================================================
LLM_MAX_TOKENS=4000
LLM_TEMPERATURE=0.1
LLM_TIMEOUT=120

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=INFO
```

#### Frontend (.env.local)
```bash
# Development
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development

# Production
REACT_APP_API_BASE_URL=https://your-backend-domain.com
REACT_APP_ENVIRONMENT=production
```

## 🤖 LLM Provider Configuration

### Supported Providers

The system supports multiple LLM providers with a unified interface. You can easily switch between providers by updating your `.env` file.

#### 🔄 Switching Providers

To switch providers, simply update these lines in your `.env` file:

```bash
# For OpenAI
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
LLM_BASE_URL=https://api.openai.com/v1

# For Krutrim
LLM_PROVIDER=krutrim
LLM_MODEL=Llama-3.3-70B-Instruct
LLM_BASE_URL=https://cloud.olakrutrim.com/v1

# For Anthropic
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-sonnet-20240229
LLM_BASE_URL=https://api.anthropic.com

# For Ollama (Local)
LLM_PROVIDER=ollama
LLM_MODEL=llama2
LLM_BASE_URL=http://localhost:11434/v1
```

### Provider-Specific Features

| Provider | Vision Support | File Upload | Chat | Best Models |
|----------|---------------|-------------|------|-------------|
| **OpenAI** | ✅ Full | ✅ Full | ✅ | GPT-4o, GPT-3.5-turbo |
| **Krutrim** | ⚠️ Limited | ✅ Full | ✅ | Llama-3.3-70B-Instruct |
| **Anthropic** | ✅ Full | ✅ Full | ✅ | Claude-3-Sonnet, Claude-3-Haiku |
| **Ollama** | ⚠️ Limited | ❌ No | ✅ | llama2, codellama |

### Adding New LLM Providers

The system is designed to be easily extensible. Adding a new provider requires changes in only **3 places**:

#### Step 1: Update `.env` File
```bash
LLM_PROVIDER=your_new_provider
LLM_MODEL=your_model_name
LLM_API_KEY=your_api_key
LLM_BASE_URL=your_base_url
```

#### Step 2: Update `config.py`
Add provider-specific logic in the `get_llm_config()` method:

```python
elif cls.LLM_PROVIDER == "your_new_provider":
    config["base_url"] = cls.LLM_BASE_URL or "https://api.yourprovider.com/v1"
```

#### Step 3: Update `llm_client.py`
Add provider support in the `_init_client()` method:

```python
elif self.provider == "your_new_provider":
    # For OpenAI-compatible APIs
    openai.api_key = self.api_key
    openai.base_url = self.base_url
```

### Provider Categories

#### Category 1: OpenAI-Compatible APIs (Easiest)
**Examples:** Krutrim, Cohere, Together AI
- ✅ **Just add to a list** - No new code needed
- ✅ **Uses existing functions** - Reuses `_openai_chat_completion()`
- ✅ **Same API format** - Drop-in replacement

#### Category 2: Custom APIs (More Work)
**Examples:** Anthropic Claude, Google Gemini
- 🔧 **Need custom implementation** - New `_provider_chat_completion()` method
- 🔧 **May need format conversion** - Like Anthropic's message format
- 🔧 **More complex** - But still manageable

### Testing New Providers

After adding a new provider, test it:

```bash
# Test the configuration
python -c "
from app.config import settings
from app.services.llm_client import llm_client
print(f'Provider: {settings.LLM_PROVIDER}')
print(f'Model: {settings.LLM_MODEL}')
response = llm_client.chat_completion([{'role': 'user', 'content': 'Hello'}])
print(f'Response: {response.choices[0].message.content}')
"
```

### Benefits of This Architecture

1. **Single Code Path** - All providers use the same interface
2. **Easy to Add** - Only 3 places to modify
3. **Automatic Fallback** - Unknown providers fall back to OpenAI
4. **Consistent API** - Same functions work for all providers
5. **No Code Duplication** - Reuses existing logic where possible

## 🔒 Security Features

### ✅ Implemented Security Measures
- **No hardcoded secrets** - All sensitive data in environment variables
- **JWT authentication** - Secure token-based authentication
- **CORS protection** - Configurable cross-origin resource sharing
- **Request timeouts** - Prevents hanging requests
- **Input validation** - Server-side validation for all inputs
- **Error handling** - Proper error logging and user feedback
- **Secure dependencies** - All vulnerable packages removed/updated

### 🔍 Security Scan Results
- **Bandit**: 0 issues ✅
- **Safety**: 0 vulnerabilities ✅
- **pip-audit**: No issues ✅

## 📊 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /signup` - User registration

### File Analysis
- `POST /api/analyze-stream` - Stream analysis with real-time updates
- `GET /latest-results` - Get last analysis results

### Malicious Detection
- `POST /api/v1/detect-malicious` - Detect malicious messages

## 🚀 Deployment

### Frontend Deployment
1. **Update production environment:**
   ```bash
   # .env.production
   REACT_APP_API_BASE_URL=https://your-backend-domain.com
   ```

2. **Build and deploy:**
   ```bash
   yarn build
   # Deploy build/ folder to your hosting service
   ```

### Backend Deployment
1. **Update CORS for production:**
   ```bash
   # server/.env
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

2. **Deploy to your hosting service**

### Recommended Hosting
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Heroku, DigitalOcean, AWS

## 🔍 Troubleshooting

### Common Issues

#### CORS Errors
**Error:** `Access to fetch at 'https://backend.com' from origin 'https://frontend.com' has been blocked by CORS policy`

**Solution:** Update backend `ALLOWED_ORIGINS` to include your frontend domain

#### API Connection Errors
**Error:** `Failed to fetch` or network errors

**Solution:** 
1. Verify `REACT_APP_API_BASE_URL` is correct
2. Ensure backend is running and accessible
3. Check CORS configuration

#### Build Errors
**Error:** Build fails during deployment

**Solution:**
1. Test build locally first: `yarn build`
2. Check for missing dependencies
3. Verify environment variables are set

## 📝 Development

### Project Structure
```
client/src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── api/                # API configuration
├── config/             # Environment configuration
└── utils/              # Utility functions

server/app/
├── routes/             # API endpoints
├── services/           # Business logic
├── models/             # Database models
├── schemas/            # Pydantic schemas
└── config.py           # Environment configuration
```

### Key Features Implemented
- ✅ **Real-time streaming** for file analysis
- ✅ **Transaction details** modal on month click
- ✅ **Malicious message detection**
- ✅ **Responsive dashboard** with charts
- ✅ **File upload** with progress tracking
- ✅ **Error boundaries** and user feedback
- ✅ **Production-ready** security configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the configuration documentation
3. Check the security improvements guide
4. Open an issue on GitHub

---

**FinSentry AI - Making Financial Analysis Secure and Intelligent** 🏦✨ 