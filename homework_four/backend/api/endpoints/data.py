from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.database.setup_database import get_database

router = APIRouter()

db = get_database()

@router.get("/filter-one-data")
def get_issuers():
    issuers = list(db.issuers.find({}, {
        "_id": 0,
        "symbol": 1,
        "is_bond": 1,
        "has_digit": 1,
        "valid": 1,
        "last_scraped_date": 1
    }))
    return issuers

@router.get("/get-watched-issuers")
def get_watched_issuers():
    issuers = list(db.issuers.find({
        "is_watched": True
    }, {
        "_id": 0,
        "symbol": 1,
    }))
    return issuers

@router.get("/get-valid-issuers")
def get_valid_issuers():
    issuers = list(db.issuers.find({
        "valid": True
    }, {
        "_id": 0,
        "symbol": 1,
    }))
    return issuers


@router.get("/filter-three-data")
def get_historical_data(
        symbolOne: Optional[str] = Query(
            None,
            description="First symbol to filter data",
            example="ADIN"
        ),
        symbolTwo: Optional[str] = Query(
            None,
            description="Second symbol to filter data (requires symbolOne and must be different)",
            example="OTHER"
        )
):

    if symbolTwo and not symbolOne:
        raise HTTPException(
            status_code=400,
            detail="symbolOne must be provided if symbolTwo is specified."
        )

    if symbolOne and symbolTwo and symbolOne == symbolTwo:
        raise HTTPException(
            status_code=400,
            detail="symbolOne and symbolTwo must be different."
        )

    query_one = {}
    if symbolOne:
        query_one["symbol"] = symbolOne

    query_two = {}
    if symbolTwo:
        query_two["symbol"] = symbolTwo

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

    data = []
    if symbolOne:
        data = list(db.data_entries.find(query_one, projection))
        if not data:
            raise HTTPException(
                status_code=404,
                detail=f"No historical data found for symbol '{symbolOne}'."
            )

    data_two = []
    if symbolTwo:
        data_two = list(db.data_entries.find(query_two, projection))
        if not data_two:
            raise HTTPException(
                status_code=404,
                detail=f"No historical data found for symbol '{symbolTwo}'."
            )

    response = {
        "data": data,
        "dataTwo": data_two
    }

    return response