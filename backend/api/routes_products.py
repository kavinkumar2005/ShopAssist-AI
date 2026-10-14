from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from backend.database.db import (
    get_all_products, get_product_by_id, create_product,
    update_product, delete_product
)
from backend.database.models import Product, ProductCreate

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[Product])
def list_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[int] = Query(None),
    max_price: Optional[int] = Query(None),
    sort_by: Optional[str] = Query("rating", description="rating, price_asc, price_desc")
):
    products = get_all_products()
    filtered = []
    for p in products:
        if category and p["category"].lower() != category.lower():
            continue
        if brand and p["brand"].lower() != brand.lower():
            continue
        if min_price is not None and p["price"] < min_price:
            continue
        if max_price is not None and p["price"] > max_price:
            continue
        filtered.append(p)
        
    if sort_by == "price_asc":
        filtered.sort(key=lambda x: x["price"])
    elif sort_by == "price_desc":
        filtered.sort(key=lambda x: x["price"], reverse=True)
    elif sort_by == "rating":
        filtered.sort(key=lambda x: x["rating"], reverse=True)
        
    return filtered

@router.get("/{product_id}", response_model=Product)
def get_product(product_id: int):
    prod = get_product_by_id(product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod

@router.post("", response_model=Product)
def add_product(payload: ProductCreate):
    created = create_product(payload.model_dump())
    if not created:
        raise HTTPException(status_code=400, detail="Failed to create product")
    return created

@router.put("/{product_id}", response_model=Product)
def modify_product(product_id: int, payload: Dict[str, Any]):
    updated = update_product(product_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found or update failed")
    return updated

@router.delete("/{product_id}")
def remove_product(product_id: int):
    success = delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully", "id": product_id}
