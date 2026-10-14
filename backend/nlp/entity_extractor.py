import re
from typing import Dict, Any, List, Optional
from backend.nlp.fuzzy_matcher import find_brands_in_query, normalize_category, CATEGORY_ALIASES

def parse_budget_amount(val_str: str) -> Optional[int]:
    """Parses numeric amount from string with support for k, lakh, commas."""
    val_str = val_str.replace(",", "").strip().lower()
    
    # Check for 'lakh' or 'lac'
    lakh_match = re.search(r'([\d.]+)\s*(?:lakh|lac|lacs)', val_str)
    if lakh_match:
        try:
            return int(float(lakh_match.group(1)) * 100000)
        except ValueError:
            pass
            
    # Check for 'k' (e.g., 60k, 50.5k)
    k_match = re.search(r'([\d.]+)\s*k', val_str)
    if k_match:
        try:
            return int(float(k_match.group(1)) * 1000)
        except ValueError:
            pass
            
    # Plain integer
    num_match = re.search(r'\d+', val_str)
    if num_match:
        try:
            num = int(num_match.group(0))
            if num < 300: # Could be shorthand for 60k if someone says "under 60"
                if num in [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150]:
                    return num * 1000
            return num
        except ValueError:
            pass
            
    return None

def extract_budget(query: str) -> Dict[str, Optional[int]]:
    """Extracts min and max budget constraints from natural query."""
    q = query.lower()
    min_budget = None
    max_budget = None
    
    # Range: between X and Y
    range_match = re.search(r'between\s+(?:rs\.?|inr|₹)?\s*([\d.,]+(?:\s*(?:k|lakh|lac))?)\s*(?:and|to|-)\s*(?:rs\.?|inr|₹)?\s*([\d.,]+(?:\s*(?:k|lakh|lac))?)', q)
    if range_match:
        b1 = parse_budget_amount(range_match.group(1))
        b2 = parse_budget_amount(range_match.group(2))
        if b1 and b2:
            min_budget = min(b1, b2)
            max_budget = max(b1, b2)
            return {"min_budget": min_budget, "max_budget": max_budget, "budget": max_budget}
            
    # Under / below / less than / max / within / at most / up to
    max_patterns = [
        r'(?:under|below|less than|within|max(?:imum)?|up to|around|budget(?: of)?)\s*(?:rs\.?|inr|₹)?\s*([\d.,]+(?:\s*(?:k|lakh|lac))?)',
        r'(?:rs\.?|inr|₹)\s*([\d.,]+(?:\s*(?:k|lakh|lac)?))\s*(?:or less|budget|max)?',
        r'([\d.,]+(?:\s*(?:k|lakh|lac)))\s*(?:budget|laptop|phone|smartwatch)?'
    ]
    for pattern in max_patterns:
        m = re.search(pattern, q)
        if m:
            b = parse_budget_amount(m.group(1))
            if b and b > 1000: # ensure realistic price
                max_budget = b
                break
                
    # Above / more than / min / at least
    min_patterns = [
        r'(?:above|more than|at least|minimum|min)\s*(?:rs\.?|inr|₹)?\s*([\d.,]+(?:\s*(?:k|lakh|lac))?)'
    ]
    for pattern in min_patterns:
        m = re.search(pattern, q)
        if m:
            b = parse_budget_amount(m.group(1))
            if b and b > 1000:
                min_budget = b
                break
                
    return {
        "min_budget": min_budget,
        "max_budget": max_budget,
        "budget": max_budget or min_budget
    }

def extract_ram(query: str) -> Optional[int]:
    """Extracts desired RAM capacity in GB."""
    q = query.lower()
    ram_patterns = [
        r'(\d+)\s*(?:gb|gig|gigs)\s*(?:of\s*)?ram',
        r'ram\s*(?:of|at least|minimum|min|:)?\s*(\d+)\s*(?:gb)?',
        r'at least\s*(\d+)\s*gb',
        r'(\d+)\s*gb\s*(?:ddr\d|lpddr\d)?'
    ]
    for p in ram_patterns:
        m = re.search(p, q)
        if m:
            val = int(m.group(1))
            if val in [4, 6, 8, 12, 16, 24, 32, 64]:
                return val
    return None

def extract_storage(query: str) -> Optional[str]:
    """Extracts storage specification like 512GB, 1TB."""
    q = query.lower()
    m_tb = re.search(r'(\d+)\s*(?:tb|terabyte)\s*(?:ssd|storage|rom)?', q)
    if m_tb:
        return f"{m_tb.group(1)}TB"
    m_gb = re.search(r'(\d+)\s*(?:gb|gig)\s*(?:ssd|storage|rom|space)', q)
    if m_gb:
        return f"{m_gb.group(1)}GB"
    if "ssd" in q:
        return "SSD"
    return None

def extract_processor(query: str) -> Optional[str]:
    """Extracts processor preference."""
    q = query.lower()
    if "i7" in q or "core i7" in q:
        return "Intel Core i7"
    if "i5" in q or "core i5" in q:
        return "Intel Core i5"
    if "i9" in q or "core i9" in q:
        return "Intel Core i9"
    if "ryzen 7" in q:
        return "AMD Ryzen 7"
    if "ryzen 5" in q:
        return "AMD Ryzen 5"
    if "m3" in q:
        return "Apple M3"
    if "m2" in q:
        return "Apple M2"
    if "snapdragon 8" in q or "8 gen 3" in q:
        return "Snapdragon 8 Gen 3"
    if "snapdragon" in q:
        return "Snapdragon"
    if "intel" in q:
        return "Intel"
    if "amd" in q or "ryzen" in q:
        return "AMD"
    return None

def extract_entities(query: str) -> Dict[str, Any]:
    """Comprehensive entity extraction pipeline."""
    q_lower = query.lower()
    
    # 1. Category extraction
    category = None
    for token, cat_name in CATEGORY_ALIASES.items():
        # Check boundary
        pattern = r'\b' + re.escape(token) + r'\b'
        if re.search(pattern, q_lower):
            category = cat_name
            break
            
    # 2. Brand extraction (with fuzzy typo correction)
    brands = find_brands_in_query(query)
    primary_brand = brands[0] if brands else None
    
    # 3. Budget extraction
    budget_info = extract_budget(query)
    
    # 4. RAM extraction
    ram = extract_ram(query)
    
    # 5. Storage extraction
    storage = extract_storage(query)
    
    # 6. Processor
    processor = extract_processor(query)
    
    # 7. Use cases and requirements
    gaming_req = any(w in q_lower for w in ["gaming", "game", "games", "rtx", "gpu", "esports", "fps"])
    camera_req = any(w in q_lower for w in ["camera", "photo", "photography", "shots", "megapixels", "sensor", "lens", "vlog"])
    battery_req = any(w in q_lower for w in ["battery", "endurance", "mah", "backup", "long-lasting"])
    
    use_cases = []
    if "coding" in q_lower or "programming" in q_lower or "developer" in q_lower or "python" in q_lower:
        use_cases.append("Coding")
    if "machine learning" in q_lower or "ml" in q_lower or "ai" in q_lower or "deep learning" in q_lower or "data science" in q_lower:
        use_cases.append("Machine Learning")
    if gaming_req:
        use_cases.append("Gaming")
    if camera_req:
        use_cases.append("Photography")
    if "video editing" in q_lower or "editing" in q_lower or "render" in q_lower or "premiere" in q_lower:
        use_cases.append("Video Editing")
    if "college" in q_lower or "student" in q_lower or "study" in q_lower:
        use_cases.append("College")
    if "office" in q_lower or "business" in q_lower or "work" in q_lower:
        use_cases.append("Office")
    if "fitness" in q_lower or "running" in q_lower or "workout" in q_lower or "gym" in q_lower:
        use_cases.append("Fitness")
        
    return {
        "category": category,
        "brand": primary_brand,
        "budget": budget_info["budget"],
        "min_budget": budget_info["min_budget"],
        "max_budget": budget_info["max_budget"],
        "ram": ram,
        "storage": storage,
        "processor": processor,
        "gaming_requirement": gaming_req,
        "camera_requirement": camera_req,
        "battery_requirement": battery_req,
        "use_cases": use_cases,
        "raw_query": query
    }
