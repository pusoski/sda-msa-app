from fastapi import APIRouter
from backend.app.filters.filter_one.filter_one_main import run_filter_one
from backend.app.filters.filter_three.filter_three_main import run_filter_three

router = APIRouter()


@router.post("/run-filter-one")
def run_insert_issuers():
    result_message = run_filter_one()
    return {"message": result_message}


@router.post("/run-filter-three")
def run_insert_issuers():
    result_message = run_filter_three()
    return {"message": result_message}