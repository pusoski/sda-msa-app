from fastapi import APIRouter
from .personalization import router as personalization_router
from .data import router as data_router
from .filters import router as filters_router
from .app_status import router as app_status_router

api_router = APIRouter()

api_router.include_router(personalization_router)
api_router.include_router(data_router)
api_router.include_router(filters_router)
api_router.include_router(app_status_router)