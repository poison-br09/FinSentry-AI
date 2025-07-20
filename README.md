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
- OpenAI API key

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
   # - OPENAI_API_KEY (your OpenAI API key)
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

# API Keys
OPENAI_API_KEY=your-openai-api-key

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