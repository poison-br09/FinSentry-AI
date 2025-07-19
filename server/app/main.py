from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import logging

from .routes import user, upload, malicious_detection
from .db import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ Logging middleware for request debugging
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        body = await request.body()
        logging.info(f"[LOGGING] Request Headers: {dict(request.headers)}")
        logging.info(f"[LOGGING] Raw Body (first 500 bytes): {body[:500]}")
        return await call_next(request)

app.add_middleware(LoggingMiddleware)

# ✅ CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers
app.include_router(user.router)
app.include_router(upload.router)
app.include_router(malicious_detection.router, prefix="/api/v1")
