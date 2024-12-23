from fastapi import APIRouter
from backend.database.setup_database import get_database

router = APIRouter()

db = get_database()

@router.get("/app-status")
def get_app_status():
    status = db.app_status.find_one({}, {
        "_id": 0,
        "status": 1,
        "details": 1
    })
    return status