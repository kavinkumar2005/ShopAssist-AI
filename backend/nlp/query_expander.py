from typing import List, Dict

SYNONYMS: Dict[str, str] = {
    "phone": "smartphone",
    "phones": "smartphones",
    "cell": "smartphone",
    "cellphone": "smartphone",
    "mobile": "smartphone",
    "notebook": "laptop",
    "notebooks": "laptops",
    "netbook": "laptop",
    "macbook": "laptop apple",
    "earbuds": "headphones",
    "earphones": "headphones",
    "tws": "headphones",
    "headset": "headphones",
    "cans": "headphones",
    "watch": "smart watch",
    "watches": "smart watches",
    "smartwatch": "smart watch",
    "tab": "tablet",
    "tabs": "tablets",
    "ipad": "tablet apple",
    "pad": "tablet",
    "cam": "camera",
    "dslr": "camera mirrorless",
    "gamepad": "controller gaming accessory"
}

EXPANSION_RULES: Dict[str, List[str]] = {
    "gaming": [
        "high performance", "RTX", "dedicated GPU", "144Hz refresh rate", "AAA gaming"
    ],
    "coding": [
        "programming", "developer", "software engineering", "multitasking", "fast compilation"
    ],
    "machine learning": [
        "deep learning", "PyTorch", "TensorFlow", "CUDA GPU", "AI models", "16GB RAM"
    ],
    "ml": [
        "machine learning", "deep learning", "CUDA GPU", "high RAM", "AI training"
    ],
    "ai": [
        "neural processing unit", "NPU", "AI features", "machine learning", "smart"
    ],
    "photography": [
        "camera sensor", "OIS optical stabilization", "high megapixel", "Leica Hasselblad", "portrait"
    ],
    "video editing": [
        "4K rendering", "color accurate display", "high performance", "DCI-P3 OLED"
    ],
    "fitness": [
        "heart rate sensor", "workout tracking", "GPS", "sports modes", "waterproof"
    ],
    "noise cancelling": [
        "active noise cancellation", "ANC", "ambient sound", "travel headphones"
    ],
    "anc": [
        "active noise cancellation", "quiet comfort", "sound isolation"
    ],
    "battery": [
        "long battery life", "fast charging", "all-day endurance"
    ],
    "lightweight": [
        "slim portable", "thin and light", "travel friendly", "compact"
    ]
}

def replace_synonyms(query: str) -> str:
    """Substitutes informal or colloquial terms with standardized domain terminology."""
    words = query.lower().split()
    processed = []
    for w in words:
        clean_w = w.strip(".,?!:;()")
        if clean_w in SYNONYMS:
            # Replace while retaining original formatting if possible
            processed.append(SYNONYMS[clean_w])
        else:
            processed.append(w)
    return " ".join(processed)

def expand_query(query: str) -> str:
    """Expands domain-specific terms with relevant contextual synonyms and specs."""
    query_lower = query.lower()
    expansions = []
    
    for trigger, terms in EXPANSION_RULES.items():
        # Check word boundary / substring
        if trigger in query_lower:
            expansions.extend(terms[:2])
            
    # Combine original query with unique expansion keywords
    unique_expansions = []
    for t in expansions:
        if t.lower() not in query_lower and t.lower() not in unique_expansions:
            unique_expansions.append(t)
            
    if unique_expansions:
        return f"{query} {' '.join(unique_expansions)}"
    return query
