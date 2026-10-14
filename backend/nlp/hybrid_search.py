import re
from typing import List, Dict, Any, Optional, Tuple
from backend.database.db import get_all_products
from backend.rag.embeddings import search_vector_index
from backend.nlp.query_expander import replace_synonyms, expand_query
from backend.nlp.entity_extractor import extract_entities

def parse_ram_int(ram_str: str) -> int:
    """Parses integer RAM from string like '16GB', '8GB'."""
    m = re.search(r'(\d+)', ram_str)
    return int(m.group(1)) if m else 0

def compute_keyword_score(query: str, product: Dict[str, Any]) -> float:
    """Calculates term frequency and field-weighted relevance score."""
    q_tokens = [t.lower() for t in query.split() if len(t) > 1]
    if not q_tokens:
        return 0.0
        
    name_text = product["name"].lower()
    brand_text = product["brand"].lower()
    cat_text = product["category"].lower()
    desc_text = product["description"].lower()
    features_text = " ".join(product.get("features", [])).lower()
    use_cases_text = " ".join(product.get("use_cases", [])).lower()
    
    score = 0.0
    for token in q_tokens:
        if token in brand_text:
            score += 4.0
        if token in name_text:
            score += 3.0
        if token in cat_text:
            score += 2.5
        if token in use_cases_text:
            score += 2.0
        if token in features_text:
            score += 1.5
        if token in desc_text:
            score += 1.0
            
    # Normalize score
    return min(1.0, score / (len(q_tokens) * 3.5))

def compute_spec_match_score(product: Dict[str, Any], constraints: Dict[str, Any]) -> float:
    """Scores how well product specifications align with extracted use-cases and requirements."""
    score = 0.0
    total_checks = 0
    
    # Use cases match
    target_use_cases = constraints.get("use_cases", [])
    if target_use_cases:
        total_checks += 1
        prod_use_cases = [u.lower() for u in product.get("use_cases", [])]
        matched = sum(1 for u in target_use_cases if u.lower() in prod_use_cases)
        score += (matched / len(target_use_cases))
        
    # Gaming check
    if constraints.get("gaming_requirement"):
        total_checks += 1
        is_gaming = "gaming" in product.get("description", "").lower() or "rtx" in " ".join(product.get("features", [])).lower()
        if is_gaming:
            score += 1.0
            
    # Camera check
    if constraints.get("camera_requirement"):
        total_checks += 1
        has_cam = product["category"] == "Cameras" or any(w in product.get("description", "").lower() for w in ["camera", "ois", "sensor"])
        if has_cam:
            score += 1.0
            
    # Processor match
    target_proc = constraints.get("processor")
    if target_proc:
        total_checks += 1
        if target_proc.lower() in product.get("processor", "").lower():
            score += 1.0
            
    return (score / total_checks) if total_checks > 0 else 0.5

def hybrid_search(
    query: str,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    min_ram: Optional[int] = None,
    use_case: Optional[str] = None,
    sort_by: str = "relevance",
    mode: str = "hybrid", # hybrid, keyword, semantic
    limit: int = 20
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Executes multi-stage hybrid search combining vector retrieval, keyword scoring, and constraint filtering."""
    
    all_products = get_all_products()
    product_map = {p["id"]: p for p in all_products}
    
    # Step 1: Query normalization and constraint extraction
    extracted = extract_entities(query)
    effective_category = category or extracted.get("category")
    effective_brand = brand or extracted.get("brand")
    effective_max_price = max_price or extracted.get("max_budget") or extracted.get("budget")
    effective_min_price = min_price or extracted.get("min_budget")
    effective_min_ram = min_ram or extracted.get("ram")
    
    # Step 2: Query synonym substitution & expansion
    norm_query = replace_synonyms(query)
    expanded_query = expand_query(norm_query)
    
    # Step 3: Vector Search
    vector_scores: Dict[int, float] = {}
    if mode in ["hybrid", "semantic"]:
        vector_results = search_vector_index(expanded_query, top_k=50)
        for pid, score in vector_results:
            # Map cosine similarity [-1, 1] roughly to [0, 1]
            vector_scores[pid] = max(0.0, min(1.0, (score + 1.0) / 2.0))
            
    # Step 4: Keyword Search & Filter Candidates
    scored_candidates = []
    for p in all_products:
        pid = p["id"]
        
        # Hard constraint: Category
        if effective_category and p["category"].lower() != effective_category.lower():
            continue
            
        # Hard constraint: Brand
        if effective_brand and p["brand"].lower() != effective_brand.lower():
            continue
            
        # Hard constraint: Price
        if effective_max_price is not None and p["price"] > effective_max_price:
            continue
        if effective_min_price is not None and p["price"] < effective_min_price:
            continue
            
        # Hard constraint: RAM
        if effective_min_ram is not None:
            p_ram = parse_ram_int(p.get("ram", "0"))
            if p_ram > 0 and p_ram < effective_min_ram:
                continue
                
        # Hard constraint: Use Case
        if use_case:
            p_use_cases = [u.lower() for u in p.get("use_cases", [])]
            if use_case.lower() not in p_use_cases:
                continue
                
        # Calculate component scores
        v_score = vector_scores.get(pid, 0.4)
        k_score = compute_keyword_score(norm_query, p)
        s_score = compute_spec_match_score(p, extracted)
        
        if mode == "semantic":
            final_score = v_score
        elif mode == "keyword":
            final_score = k_score
        else: # Hybrid
            final_score = (0.45 * v_score) + (0.35 * k_score) + (0.20 * s_score)
            
        p_copy = dict(p)
        p_copy["relevance_score"] = round(final_score, 4)
        p_copy["match_reason"] = f"Semantic match: {int(v_score*100)}% | Spec match: {int(s_score*100)}%"
        scored_candidates.append(p_copy)
        
    # Fallback relax: If zero results due to strict budget, relax budget slightly
    if not scored_candidates and (effective_max_price or effective_min_ram):
        for p in all_products:
            if effective_category and p["category"].lower() != effective_category.lower():
                continue
            if effective_brand and p["brand"].lower() != effective_brand.lower():
                continue
            # Relax budget by 10%
            if effective_max_price is not None and p["price"] > (effective_max_price * 1.15):
                continue
            v_score = vector_scores.get(p["id"], 0.4)
            k_score = compute_keyword_score(norm_query, p)
            final_score = (0.5 * v_score) + (0.5 * k_score)
            p_copy = dict(p)
            p_copy["relevance_score"] = round(final_score, 4)
            p_copy["match_reason"] = "Nearest match with relaxed constraints"
            scored_candidates.append(p_copy)

    # Sort results
    if sort_by == "price_asc":
        scored_candidates.sort(key=lambda x: x["price"])
    elif sort_by == "price_desc":
        scored_candidates.sort(key=lambda x: x["price"], reverse=True)
    elif sort_by == "rating":
        scored_candidates.sort(key=lambda x: x["rating"], reverse=True)
    else: # relevance
        scored_candidates.sort(key=lambda x: x["relevance_score"], reverse=True)
        
    return scored_candidates[:limit], extracted
