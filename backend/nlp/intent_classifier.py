import re
from typing import Dict, Any, List

INTENT_SEARCH = "Search Product"
INTENT_COMPARE = "Compare Products"
INTENT_QUESTION = "Ask Product Question"
INTENT_RECOMMENDATION = "Recommendation Request"
INTENT_BUDGET = "Budget-Based Search"
INTENT_FEATURE = "Feature-Based Search"
INTENT_REFINEMENT = "Requirement Refinement"

COMPARE_KEYWORDS = [
    "compare", "difference between", "vs", "versus", "which is better",
    "better between", "comparison", "should i buy x or y"
]

RECOMMENDATION_KEYWORDS = [
    "recommend", "recommendation", "suggest", "best", "top", "which one should i buy",
    "what should i get", "ideal", "good options"
]

QUESTION_KEYWORDS = [
    "does it have", "is this good for", "is it suitable", "can i use", "how much is",
    "what is the price", "what is the battery", "can it run", "does this support",
    "is it worth", "why should i", "battery life of", "is it waterproof", "can it handle",
    "how many hours"
]

def has_any_keyword(text: str, keywords: List[str]) -> bool:
    for kw in keywords:
        pattern = r'\b' + re.escape(kw) + r'\b'
        if re.search(pattern, text):
            return True
    return False

def classify_intent(query: str, extracted_entities: Dict[str, Any], context_product_id: Any = None) -> str:
    """Classifies user intent based on query structure, entities, and context."""
    q_lower = query.strip().lower()
    
    # 1. Check Compare intent
    if has_any_keyword(q_lower, COMPARE_KEYWORDS):
        return INTENT_COMPARE
    if re.search(r'\b(?:vs\.?|versus)\b', q_lower):
        return INTENT_COMPARE
    # E.g. "HP Victus or Lenovo LOQ"
    if " or " in q_lower and ("laptop" in q_lower or "phone" in q_lower or extracted_entities.get("brand")):
        return INTENT_COMPARE
        
    # 2. Check Question about a specific product (or active product context)
    if context_product_id is not None:
        if has_any_keyword(q_lower, QUESTION_KEYWORDS) or q_lower.startswith(("is it", "can it", "does it", "will it", "how", "what", "is this")):
            return INTENT_QUESTION

    if has_any_keyword(q_lower, QUESTION_KEYWORDS):
        return INTENT_QUESTION
            
    # 3. Check Short Refinement Response (e.g. "budget is 60k", "16gb", "for coding", "lenovo") without category
    word_count = len(q_lower.split())
    if word_count <= 4 and not extracted_entities.get("category") and (
        extracted_entities.get("budget") or 
        extracted_entities.get("ram") or 
        len(extracted_entities.get("use_cases", [])) > 0
    ) and not has_any_keyword(q_lower, ["best", "recommend", "show", "find", "search", "under", "below"]):
        return INTENT_REFINEMENT

    # 4. Check Recommendation Request
    if has_any_keyword(q_lower, RECOMMENDATION_KEYWORDS):
        return INTENT_RECOMMENDATION
            
    # 5. Check Budget-Based Search
    if extracted_entities.get("budget") is not None and not extracted_entities.get("processor"):
        if any(w in q_lower for w in ["under", "below", "budget", "around", "less than"]):
            return INTENT_BUDGET
            
    # 6. Check Feature-Based Search
    if (extracted_entities.get("ram") or 
        extracted_entities.get("storage") or 
        extracted_entities.get("processor") or 
        any(f in q_lower for f in ["oled", "144hz", "120hz", "rtx", "anc", "touchscreen", "wireless", "4k"])):
        return INTENT_FEATURE
        
    # Default: General Search
    return INTENT_SEARCH
