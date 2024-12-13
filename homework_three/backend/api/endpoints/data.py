from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.database.setup_database import get_database
from backend.app.filters.filter_one.filter_one_main import run_filter_one
from backend.app.filters.filter_three.filter_three_main import run_filter_three
from datetime import datetime

router = APIRouter()

db = get_database()

@router.get("/filter-one-data")
def get_issuers():
    issuers = list(db.issuers.find({}, {"_id": 0,
                                        "symbol": 1,
                                        "is_bond": 1,
                                        "has_digit": 1,
                                        "valid": 1,
                                        "last_scraped_date": 1}))
    return issuers


@router.get("/filter-three-data")
def get_historical_data(
        date: Optional[str] = Query(
            None,
            description="Filter data by date in MM/DD/YYYY format",
            example="12/11/2024"
        )
):
    query = {}

    if date:
        try:
            parsed_date = datetime.strptime(date, "%m/%d/%Y")
            formatted_date = parsed_date.strftime("%m/%d/%Y")
            query["date"] = formatted_date
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Please use MM/DD/YYYY."
            )
    projection = {
        "_id": 0,
        "pctchg": 1,
        "avg_price": 1,
        "date": 1,
        "last_trade_price": 1,
        "max": 1,
        "min": 1,
        "total_turnover_in_denars": 1,
        "turnover_in_best_in_denars": 1,
        "volume": 1,
        "symbol": 1
    }

    try:
        data = list(db.data_entries.find(query, projection))
        if not data:
            raise HTTPException(
                status_code=404,
                detail="No historical data found within the provided date range."
            )
        return data
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching historical data: {str(e)}"
        )

@router.post("/run-filter-one")
def run_insert_issuers():
    result_message =  run_filter_one()
    return {"message": result_message}

@router.post("/run-filter-three")
def run_insert_issuers():
    result_message =  run_filter_three()
    return {"message": result_message}

