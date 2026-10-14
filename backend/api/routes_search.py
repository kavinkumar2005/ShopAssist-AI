from fastapi import APIRouter, Query
from typing import List, Optional, Dict, Any
from backend.database.models import SearchRequest, Product, ExtractedConstraints
from backend.nlp.hybrid_search import hybrid_search

router = APIRouter(prefix="/search", tags=["Search"])

@router.post("")
def post_search(payload: SearchRequest):
    results, extracted = hybrid_search(
        query=payload.query,
        category=payload.category,
        brand=payload.brand,
        min_price=payload.min_price,
        max_price=payload.max_price,
        min_ram=payload.min_ram,
        use_case=payload.use_case,
        sort_by=payload.sort_by or "relevance",
        mode=payload.mode or "hybrid",
        limit=payload.limit
    )
    return {
        "query": payload.query,
        "mode": payload.mode,
        "extracted_constraints": extracted,
        "total_results": len(results),
        "results": results
    }

@router.get("")
def get_search(
    q: str = Query(..., description="Natural language search query"),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    min_price: Optional[int] = Query(None),
    max_price: Optional[int] = Query(None),
    min_ram: Optional[int] = Query(None),
    use_case: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("relevance"),
    mode: Optional[str] = Query("hybrid"),
    limit: int = Query(20)
):
    results, extracted = hybrid_search(
        query=q,
        category=category,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        min_ram=min_ram,
        use_case=use_case,
        sort_by=sort_by,
        mode=mode,
        limit=limit
    )
    return {
        "query": q,
        "mode": mode,
        "extracted_constraints": extracted,
        "total_results": len(results),
        "results": results
    }
