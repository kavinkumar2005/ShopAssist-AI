from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.database.models import CompareRequest, CompareResponse, Product
from backend.database.db import get_products_by_ids, log_comparison

router = APIRouter(prefix="/compare", tags=["Comparison"])

def analyze_comparison(products: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generates structured spec comparisons, pros & cons, winner, and AI verdict."""
    if not products:
        return {"verdict": "No products selected.", "pros_cons": {}, "winner_id": None}
        
    p1 = products[0]
    p2 = products[1] if len(products) > 1 else None
    
    pros_cons = {}
    for p in products:
        pros = []
        cons = []
        
        # Rating
        if p["rating"] >= 4.6:
            pros.append(f"Outstanding user rating of {p['rating']}★")
        # RAM
        if "16GB" in p.get("ram", "") or "32GB" in p.get("ram", "") or "12GB" in p.get("ram", ""):
            pros.append(f"Generous {p['ram']} RAM for smooth multitasking")
        # Features
        if any("rtx" in f.lower() or "hasselblad" in f.lower() or "oled" in f.lower() for f in p.get("features", [])):
            pros.append("Premium hardware components included")
            
        # Price perspective
        if p2 and p["price"] < p2["price"]:
            pros.append(f"Significantly more affordable (saves ₹{abs(p1['price'] - p2['price']):,})")
        elif p2 and p["price"] > p2["price"]:
            cons.append("Higher price tag")
            
        if not pros:
            pros.append("Balanced performance profile")
        if not cons:
            cons.append("Standard market specifications")
            
        pros_cons[p["id"]] = {"pros": pros, "cons": cons}
        
    # Determine winner
    winner_id = None
    if p2:
        # Score calculation based on rating, value, and specs
        score1 = p1["rating"] * 20 - (p1["price"] / 10000)
        score2 = p2["rating"] * 20 - (p2["price"] / 10000)
        winner_id = p1["id"] if score1 >= score2 else p2["id"]
        winner = p1 if winner_id == p1["id"] else p2
        runner_up = p2 if winner_id == p1["id"] else p1
        
        verdict = (
            f"**Overall Verdict**: The **{winner['name']}** emerges as the stronger value proposition. "
            f"While the **{runner_up['name']}** offers admirable qualities, the {winner['name']} "
            f"strikes an ideal balance between price (₹{winner['price']:,}), processor performance ({winner['processor']}), "
            f"and overall customer satisfaction ({winner['rating']}★)."
        )
    else:
        verdict = f"Selected product: **{p1['name']}** at ₹{p1['price']:,} with {p1['rating']}★ rating."
        winner_id = p1["id"]
        
    return {
        "verdict": verdict,
        "pros_cons": pros_cons,
        "winner_id": winner_id
    }

@router.post("", response_model=CompareResponse)
def compare_products_endpoint(payload: CompareRequest):
    if len(payload.product_ids) < 1:
        raise HTTPException(status_code=400, detail="At least 1 product ID must be provided")
    if len(payload.product_ids) > 4:
        raise HTTPException(status_code=400, detail="Cannot compare more than 4 products simultaneously")
        
    products = get_products_by_ids(payload.product_ids)
    if not products:
        raise HTTPException(status_code=404, detail="None of the specified products were found")
        
    # Log comparison event
    log_comparison([p["id"] for p in products])
    
    # Build Comparison Table
    spec_keys = [
        ("Price", "price", lambda v: f"₹{v:,}"),
        ("Category", "category", lambda v: v),
        ("Brand", "brand", lambda v: v),
        ("Processor / Engine", "processor", lambda v: v),
        ("RAM", "ram", lambda v: v),
        ("Storage", "storage", lambda v: v),
        ("Display", "display", lambda v: v),
        ("Battery", "battery", lambda v: v),
        ("Rating", "rating", lambda v: f"{v}★"),
        ("Reviews Count", "reviews_count", lambda v: f"{v:,}"),
        ("Top Features", "features", lambda v: ", ".join(v[:3])),
        ("Best For", "use_cases", lambda v: ", ".join(v[:3])),
        ("Stock Status", "stock_status", lambda v: v)
    ]
    
    table: Dict[str, Dict[str, Any]] = {}
    for label, key, formatter in spec_keys:
        table[label] = {}
        for p in products:
            raw_val = p.get(key, "N/A")
            table[label][str(p["id"])] = formatter(raw_val) if raw_val != "N/A" else "N/A"
            
    analysis = analyze_comparison(products)
    
    return {
        "products": products,
        "comparison_table": table,
        "verdict": analysis["verdict"],
        "pros_cons": analysis["pros_cons"],
        "winner_id": analysis["winner_id"]
    }
