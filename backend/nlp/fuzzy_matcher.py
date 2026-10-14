import difflib
from typing import Optional, List, Tuple

KNOWN_BRANDS = [
    "HP", "Lenovo", "Acer", "ASUS", "Dell", "Apple", "Samsung",
    "OnePlus", "Google", "Nothing", "Xiaomi", "Realme", "POCO",
    "Motorola", "Sony", "Bose", "Sennheiser", "JBL", "Garmin",
    "Amazfit", "Canon", "Fujifilm", "Nikon", "Panasonic",
    "Razer", "Logitech", "Corsair", "SteelSeries"
]

KNOWN_CATEGORIES = [
    "Laptops", "Smartphones", "Headphones", "Smart Watches",
    "Cameras", "Tablets", "Gaming Accessories"
]

CATEGORY_ALIASES = {
    "laptop": "Laptops",
    "laptops": "Laptops",
    "notebook": "Laptops",
    "notebooks": "Laptops",
    "macbook": "Laptops",
    "phone": "Smartphones",
    "phones": "Smartphones",
    "smartphone": "Smartphones",
    "smartphones": "Smartphones",
    "mobile": "Smartphones",
    "mobiles": "Smartphones",
    "cell": "Smartphones",
    "headphone": "Headphones",
    "headphones": "Headphones",
    "earphone": "Headphones",
    "earphones": "Headphones",
    "earbud": "Headphones",
    "earbuds": "Headphones",
    "airpods": "Headphones",
    "headset": "Headphones",
    "watch": "Smart Watches",
    "watches": "Smart Watches",
    "smartwatch": "Smart Watches",
    "smartwatches": "Smart Watches",
    "smart watch": "Smart Watches",
    "camera": "Cameras",
    "cameras": "Cameras",
    "dslr": "Cameras",
    "mirrorless": "Cameras",
    "tablet": "Tablets",
    "tablets": "Tablets",
    "ipad": "Tablets",
    "tab": "Tablets",
    "tabs": "Tablets",
    "pad": "Tablets",
    "mouse": "Gaming Accessories",
    "keyboard": "Gaming Accessories",
    "controller": "Gaming Accessories",
    "gamepad": "Gaming Accessories",
    "gaming accessory": "Gaming Accessories",
    "gaming accessories": "Gaming Accessories"
}

COMMON_EXCLUSIONS = {
    "gaming", "game", "gamer", "games", "coding", "code", "coder", "learning",
    "machine", "camera", "photo", "audio", "sound", "smart", "watch", "phone",
    "laptop", "notebook", "tablet", "mouse", "keyboard", "under", "above", "below",
    "least", "budget", "need", "best", "good", "fast", "cheap", "high", "performance",
    "battery", "display", "screen", "price", "video", "editing", "office", "work",
    "student", "college", "store", "online", "india", "deals", "review"
}

def correct_brand(token: str, threshold: float = 0.74) -> Optional[str]:
    """Matches potentially misspelled brand name against known brand list."""
    token_lower = token.strip().lower()
    
    if token_lower in COMMON_EXCLUSIONS:
        return None
        
    # Direct match check
    for brand in KNOWN_BRANDS:
        if brand.lower() == token_lower:
            return brand
            
    # Fuzzy match only if token length >= 4 and not in common exclusion
    if len(token_lower) >= 4:
        matches = difflib.get_close_matches(
            token_lower, 
            [b.lower() for b in KNOWN_BRANDS], 
            n=1, 
            cutoff=threshold
        )
        if matches:
            matched_lower = matches[0]
            for brand in KNOWN_BRANDS:
                if brand.lower() == matched_lower:
                    return brand
                    
    return None

def find_brands_in_query(query: str) -> List[str]:
    """Identifies and corrects brand names in a natural language query."""
    words = query.replace(",", " ").replace(".", " ").replace("?", " ").replace("!", " ").split()
    found_brands = []
    
    # 2-word tokens first (e.g., 'One Plus')
    for i in range(len(words) - 1):
        bigram = f"{words[i]} {words[i+1]}"
        if bigram.lower() in ["one plus", "one-plus"]:
            if "OnePlus" not in found_brands:
                found_brands.append("OnePlus")
                
    # 1-word tokens
    for w in words:
        if len(w) >= 3:
            matched = correct_brand(w)
            if matched and matched not in found_brands:
                found_brands.append(matched)
                
    return found_brands

def normalize_category(token_or_phrase: str) -> Optional[str]:
    """Resolves a category string or fuzzy misspelling to standard category name."""
    clean = token_or_phrase.strip().lower()
    if clean in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[clean]
        
    # Check fuzzy on aliases
    matches = difflib.get_close_matches(clean, list(CATEGORY_ALIASES.keys()), n=1, cutoff=0.8)
    if matches:
        return CATEGORY_ALIASES[matches[0]]
        
    return None
