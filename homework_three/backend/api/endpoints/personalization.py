from fastapi import APIRouter, HTTPException
from typing import List
from backend.database.setup_database import get_database
from pydantic import BaseModel, Field
import pymongo

router = APIRouter()

db = get_database()

class OrderList(BaseModel):
    order_list: List[int] = Field(..., min_length=11, max_length=11)

class Issuer(BaseModel):
    symbol: str
    is_watched: bool


@router.get("/get-personalization-order", response_model=List[int])
def get_personalization_order():
    document = db.personalization.find_one({"_id": "order"}, {"order_list": 1, "_id": 0})
    if document and "order_list" in document:
        return document["order_list"]
    else:
        # Initialize with default order if not present
        default_order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        db.personalization.insert_one({"_id": "order", "order_list": default_order})
        return default_order


@router.post("/update-personalization-order")
def update_personalization_order(order: OrderList):
    # Validate uniqueness
    if len(set(order.order_list)) != 11:
        raise HTTPException(status_code=400, detail="Order list must contain unique IDs.")

    expected_ids = set(range(1, 12))  # IDs from 1 to 11
    if set(order.order_list) != expected_ids:
        raise HTTPException(status_code=400, detail="Order list contains invalid IDs.")

    result = db.personalization.update_one(
        {"_id": "order"},
        {"$set": {"order_list": order.order_list}},
        upsert=True
    )

    if result.modified_count > 0 or result.upserted_id is not None:
        return {"message": "Order updated successfully."}
    else:
        raise HTTPException(status_code=500, detail="Failed to update order.")


@router.get("/get-personalization-issuers", response_model=List[Issuer])
def get_personalization_issuers():
    issuers = list(db.issuers.find({
        "valid": True
    }, {
        "_id": 0,
        "symbol": 1,
        "is_watched": 1
    }))
    return issuers


@router.post("/update-personalization-issuers", response_model=dict)
def update_issuers(issuers: List[Issuer]):
    if not issuers:
        raise HTTPException(status_code=400, detail="Issuers list cannot be empty.")

    for issuer in issuers:
        try:
            result = db.issuers.update_one(
                {"symbol": issuer.symbol},
                {"$set": {"is_watched": issuer.is_watched}},
                upsert=False
            )
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail=f"No issuer found with symbol: {issuer.symbol}")
        except pymongo.errors.OperationFailure as e:
            raise HTTPException(status_code=500, detail=f"Failed to update issuer {issuer.symbol}: {str(e)}")

    return {"message": "Issuers updated successfully."}