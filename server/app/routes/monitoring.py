"""
Production Monitoring Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from ..services.llm_client_production import llm_client_production
from ..auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/monitoring", tags=["monitoring"])

@router.get("/health")
async def health_check():
    """Health check endpoint for load balancers"""
    try:
        llm_health = llm_client_production.health_check()
        
        if llm_health["status"] == "healthy":
            return {
                "status": "healthy",
                "services": {
                    "llm": llm_health
                },
                "timestamp": "2024-01-01T00:00:00Z"
            }
        else:
            return {
                "status": "degraded",
                "services": {
                    "llm": llm_health
                },
                "timestamp": "2024-01-01T00:00:00Z"
            }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@router.get("/metrics")
async def get_metrics(user = Depends(get_current_user)):
    """Get LLM metrics (requires authentication)"""
    try:
        metrics = llm_client_production.get_metrics()
        
        # Add computed metrics
        total_requests = metrics["total_requests"]
        if total_requests > 0:
            success_rate = sum(
                stats["successful_requests"] 
                for stats in metrics["provider_stats"].values()
            ) / total_requests * 100
        else:
            success_rate = 0
        
        return {
            "metrics": metrics,
            "computed": {
                "success_rate_percent": round(success_rate, 2),
                "total_providers": len(metrics["provider_stats"])
            }
        }
    except Exception as e:
        logger.error(f"Failed to get metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get metrics")

@router.get("/status")
async def get_status(user = Depends(get_current_user)):
    """Get detailed system status"""
    try:
        config = llm_client_production.config
        health = llm_client_production.health_check()
        metrics = llm_client_production.get_metrics()
        
        return {
            "system": {
                "provider": config["provider"],
                "model": config["model"],
                "status": health["status"]
            },
            "performance": {
                "total_requests": metrics["total_requests"],
                "success_rate": metrics.get("success_rate", 0),
                "avg_response_time": metrics.get("avg_response_time", 0)
            },
            "circuit_breaker": {
                "state": llm_client_production.circuit_breaker.state,
                "failure_count": llm_client_production.circuit_breaker.failure_count
            }
        }
    except Exception as e:
        logger.error(f"Failed to get status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get status") 