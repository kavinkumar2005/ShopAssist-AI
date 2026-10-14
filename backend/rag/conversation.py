import uuid
from typing import Dict, Any, List, Tuple, Optional
from backend.nlp.entity_extractor import extract_entities
from backend.nlp.intent_classifier import classify_intent, INTENT_COMPARE, INTENT_QUESTION, INTENT_REFINEMENT
from backend.rag.retriever import retrieve_grounded_context
from backend.rag.generator import generate_grounded_response
from backend.database.db import get_product_by_id, log_search

# In-memory session store (conversation_id -> state dict)
CONVERSATIONS: Dict[str, Dict[str, Any]] = {}

def get_or_create_conversation(conv_id: Optional[str]) -> Tuple[str, Dict[str, Any]]:
    if not conv_id or conv_id not in CONVERSATIONS:
        new_id = str(uuid.uuid4())
        CONVERSATIONS[new_id] = {
            "conversation_id": new_id,
            "accumulated_constraints": {},
            "history": [],
            "last_product_ids": []
        }
        return new_id, CONVERSATIONS[new_id]
    return conv_id, CONVERSATIONS[conv_id]

def merge_constraints(existing: Dict[str, Any], new_extracted: Dict[str, Any]) -> Dict[str, Any]:
    """Merges new extracted constraints into the conversation state."""
    merged = dict(existing)
    for k, v in new_extracted.items():
        if v is not None and v != "" and v != []:
            if k == "use_cases":
                existing_cases = set(merged.get("use_cases", []))
                existing_cases.update(v)
                merged["use_cases"] = list(existing_cases)
            else:
                merged[k] = v
    return merged

def check_refinement_need(query: str, constraints: Dict[str, Any], intent: str) -> Tuple[bool, List[str], List[str]]:
    """Checks if the query is too underspecified and requires conversational refinement."""
    # Don't prompt for refinement on explicit comparisons, questions, or specific product queries
    if intent in [INTENT_COMPARE, INTENT_QUESTION]:
        return False, [], []
        
    words = query.strip().lower().split()
    category = constraints.get("category")
    budget = constraints.get("budget") or constraints.get("max_budget")
    ram = constraints.get("ram")
    use_cases = constraints.get("use_cases", [])
    
    # If the user literally just said "I need a laptop" or "Show me laptops" or "phone"
    is_short_vague = len(words) <= 4 and category is not None and not budget and not ram and not use_cases
    
    if is_short_vague:
        questions = [
            f"What is your target budget for this {category}?",
            "What is your primary use case (e.g. Coding, Gaming, Everyday, or Office)?",
            "Do you have a specific RAM requirement (e.g. 16GB RAM)?"
        ]
        
        chips = [
            "Under ₹50,000",
            "Under ₹70,000",
            "For Coding & ML",
            "For Gaming",
            "At least 16GB RAM"
        ] if category == "Laptops" else [
            "Under ₹30,000",
            "Under ₹60,000",
            "Great Camera",
            "High Battery Life",
            "Flagship Performance"
        ]
        
        return True, questions, chips
        
    return False, [], []

def process_chat_message(
    message: str,
    conversation_id: Optional[str] = None,
    context_product_id: Optional[int] = None,
    user_id: str = "default_user"
) -> Dict[str, Any]:
    """Processes a user chat message through NLP, intent recognition, RAG retrieval, and refinement."""
    
    conv_id, state = get_or_create_conversation(conversation_id)
    
    # 1. Entity Extraction on latest message
    current_extracted = extract_entities(message)
    
    # 2. Merge with accumulated conversation state
    merged_constraints = merge_constraints(state["accumulated_constraints"], current_extracted)
    state["accumulated_constraints"] = merged_constraints
    
    # 3. Classify Intent
    intent = classify_intent(message, current_extracted, context_product_id)
    
    # 4. Context product check
    context_product = None
    if context_product_id:
        context_product = get_product_by_id(context_product_id)
        
    # 5. Check if Refinement is needed
    refinement_needed, questions, chips = check_refinement_need(message, merged_constraints, intent)
    
    # 6. Retrieve RAG candidates
    # If comparison, retrieve specifically requested products
    if intent == INTENT_COMPARE:
        products, _ = retrieve_grounded_context(message, limit=4)
        if len(products) < 2 and state["last_product_ids"]:
            from backend.database.db import get_products_by_ids
            products = get_products_by_ids(state["last_product_ids"][:2])
    else:
        # Build search query considering accumulated constraints
        query_parts = [message]
        if merged_constraints.get("category") and merged_constraints["category"].lower() not in message.lower():
            query_parts.append(merged_constraints["category"])
        if merged_constraints.get("use_cases"):
            query_parts.extend(merged_constraints["use_cases"])
            
        combined_search_query = " ".join(query_parts)
        products, _ = retrieve_grounded_context(combined_search_query, limit=5)
        
    # Record last product IDs in conversation
    state["last_product_ids"] = [p["id"] for p in products]
    
    # 7. Generate Grounded Response
    if refinement_needed:
        cat = merged_constraints.get("category", "device")
        reply = (
            f"I'd love to help you find the perfect **{cat}**! To give you the most tailored recommendations, "
            f"could you tell me:\n\n"
            f"1. **Budget**: {questions[0]}\n"
            f"2. **Primary Use**: {questions[1]}\n"
            f"3. **Memory**: {questions[2]}\n\n"
            f"You can also click any of the suggested filters below or tell me in your own words."
        )
    else:
        reply = generate_grounded_response(
            query=message,
            intent=intent,
            products=products,
            constraints=merged_constraints,
            context_product=context_product
        )
        
    # Log search for analytics
    log_search(
        query=message,
        category=merged_constraints.get("category"),
        budget=merged_constraints.get("budget"),
        intent=intent,
        results_count=len(products)
    )
    
    # Update conversation history
    state["history"].append({"role": "user", "content": message})
    state["history"].append({"role": "assistant", "content": reply})
    
    return {
        "reply": reply,
        "intent": intent,
        "extracted_constraints": merged_constraints,
        "recommended_products": products,
        "refinement_needed": refinement_needed,
        "refinement_questions": questions,
        "suggested_chips": chips,
        "conversation_id": conv_id
    }
