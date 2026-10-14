from typing import List, Dict, Any, Tuple
from backend.nlp.hybrid_search import hybrid_search
from backend.nlp.entity_extractor import extract_entities

def retrieve_grounded_context(query: str, limit: int = 5) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Retrieves top matching products strictly matching constraints to serve as grounded RAG context."""
    products, constraints = hybrid_search(query=query, limit=limit)
    return products, constraints
