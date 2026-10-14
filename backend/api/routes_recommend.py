from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from backend.database.db import get_all_products, get_product_by_id, get_user_preferences
from backend.nlp.hybrid_search import hybrid_search
from backend.rag.embeddings import search_vector_index, product_to_embedding_text

router = APIRouter(tags=["Recommendations"])

@router.get("/recommend")
def get_recommendations(
    category: Optional[str] = Query(None),
    budget: Optional[int] = Query(None),
    use_case: Optional[str] = Query(None),
    limit: int = Query(5)
):
    """Generates intelligent recommendations given criteria."""
    query_parts = []
    if category:
        query_parts.append(category)
    if use_case:
        query_parts.append(use_case)
    if budget:
        query_parts.append(f"under {budget}")
        
    q_str = " ".join(query_parts) if query_parts else "best top rated products"
    
    products, extracted = hybrid_search(
        query=q_str,
        category=category,
        max_price=budget,
        use_case=use_case,
        sort_by="rating",
        limit=limit
    )
    
    # Generate tailored explanations
    recommendations = []
    for p in products:
        features_highlight = ", ".join(p.get("features", [])[:2])
        rec_item = dict(p)
        rec_item["explanation"] = (
            f"Equipped with {p.get('processor', 'powerful specs')} and {p.get('ram', '')} RAM, "
            f"offering excellent performance for {', '.join(p.get('use_cases', [])[:2])} at ₹{p['price']:,}."
        )
        recommendations.append(rec_item)
        
    return {
        "criteria": {"category": category, "budget": budget, "use_case": use_case},
        "count": len(recommendations),
        "recommendations": recommendations
    }

@router.get("/similar/{product_id}")
def get_similar_products(product_id: int, limit: int = 4):
    """Finds semantically similar products using vector search."""
    base_prod = get_product_by_id(product_id)
    if not base_prod:
        raise HTTPException(status_code=404, detail="Base product not found")
        
    text_rep = product_to_embedding_text(base_prod)
    # Search vector index for nearest neighbors
    vector_matches = search_vector_index(text_rep, top_k=limit + 5)
    
    similar_products = []
    for pid, score in vector_matches:
        if pid == product_id:
            continue
        p = get_product_by_id(pid)
        if p and p["category"] == base_prod["category"]:
            p_copy = dict(p)
            p_copy["similarity_score"] = round(max(0.0, min(1.0, (score + 1.0) / 2.0)), 3)
            similar_products.append(p_copy)
            if len(similar_products) >= limit:
                break
                
    # Fallback to category if vector returned few
    if len(similar_products) < limit:
        all_prods = get_all_products()
        for p in all_prods:
            if p["id"] != product_id and p["category"] == base_prod["category"]:
                if not any(sp["id"] == p["id"] for sp in similar_products):
                    p_copy = dict(p)
                    p_copy["similarity_score"] = 0.85
                    similar_products.append(p_copy)
                    if len(similar_products) >= limit:
                        break
                        
    return {
        "base_product": base_prod,
        "similar_products": similar_products
    }

@router.get("/personalized")
def get_personalized_recommendations(user_id: str = "default_user", limit: int = 6):
    """Generates personalized product feed based on saved user preferences and history."""
    prefs = get_user_preferences(user_id)
    categories = prefs.get("preferred_categories", [])
    brands = prefs.get("preferred_brands", [])
    max_budget = prefs.get("max_budget", 200000)
    use_cases = prefs.get("preferred_use_cases", [])
    
    all_products = get_all_products()
    scored = []
    
    for p in all_products:
        if p["price"] > max_budget:
            continue
            
        score = 0.0
        # Category preference
        if p["category"] in categories:
            score += 3.0
        # Brand preference
        if p["brand"] in brands:
            score += 2.5
        # Use cases preference
        p_uses = set(p.get("use_cases", []))
        common_uses = p_uses.intersection(set(use_cases))
        score += len(common_uses) * 1.5
        # Rating boost
        score += (p.get("rating", 4.0) - 4.0) * 2.0
        
        p_copy = dict(p)
        p_copy["personalized_score"] = round(score, 2)
        scored.append(p_copy)
        
    scored.sort(key=lambda x: x["personalized_score"], reverse=True)
    return {
        "user_id": user_id,
        "preferences_applied": prefs,
        "products": scored[:limit]
    }
