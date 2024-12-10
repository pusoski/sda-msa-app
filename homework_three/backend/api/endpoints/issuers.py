from fastapi import APIRouter
from backend.database.setup_database import get_database
from backend.app.filters.filter_one.filter_one_main import run_filter_one


router = APIRouter()

db = get_database()
collection = db["issuers"]


@router.post("/scrape-issuers")
async def run_insert_issuers():
    result_message = await run_filter_one()
    return {"message": result_message}


@router.get("/issuers")
async def get_issuers():
    issuers = list(collection.find({}, {"_id": 0,
                                        "symbol": 1,
                                        "is_bond": 1,
                                        "has_digit": 1,
                                        "valid": 1,
                                        "last_scraped_date": 1}))
    return issuers