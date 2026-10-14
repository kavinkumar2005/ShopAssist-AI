import os
import json
import numpy as np
from typing import List, Dict, Any, Tuple, Optional

INDEX_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "faiss_index")
INDEX_PATH = os.path.join(INDEX_DIR, "products.index")
META_PATH = os.path.join(INDEX_DIR, "index_meta.json")

_model = None
_faiss_index = None
_product_id_map: List[int] = []
_embeddings_cache: Dict[int, np.ndarray] = {}

def get_sentence_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Fast lightweight model (384-dim, ~80MB)
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            print(f"Warning loading SentenceTransformer: {e}")
            _model = None
    return _model

def product_to_embedding_text(p: Dict[str, Any]) -> str:
    """Creates a comprehensive text representation of a product for semantic indexing."""
    features_str = ", ".join(p.get("features", []))
    use_cases_str = ", ".join(p.get("use_cases", []))
    text = (
        f"{p['name']} by {p['brand']}. Category: {p['category']}. "
        f"Price: Rs {p['price']}. RAM: {p.get('ram', 'N/A')}, Storage: {p.get('storage', 'N/A')}, "
        f"Processor: {p.get('processor', 'N/A')}, Display: {p.get('display', 'N/A')}, "
        f"Battery: {p.get('battery', 'N/A')}. Features: {features_str}. "
        f"Recommended for: {use_cases_str}. Details: {p.get('description', '')}"
    )
    return text

def build_or_load_index(products: List[Dict[str, Any]], force_rebuild: bool = False):
    """Builds or loads the FAISS index for all products."""
    global _faiss_index, _product_id_map, _embeddings_cache
    os.makedirs(INDEX_DIR, exist_ok=True)
    
    import faiss
    
    model = get_sentence_model()
    _product_id_map = [p["id"] for p in products]
    
    texts = [product_to_embedding_text(p) for p in products]
    
    if model is not None:
        embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    else:
        # Fallback pseudo-embeddings using TF-IDF / random projection if model download fails
        from sklearn.feature_extraction.text import TfidfVectorizer
        tfidf = TfidfVectorizer(max_features=384)
        X = tfidf.fit_transform(texts).toarray()
        # pad to 384 dim if needed
        if X.shape[1] < 384:
            pad = np.zeros((X.shape[0], 384 - X.shape[1]))
            X = np.hstack([X, pad])
        norm = np.linalg.norm(X, axis=1, keepdims=True)
        norm[norm == 0] = 1.0
        embeddings = (X / norm).astype(np.float32)
        
    embeddings = np.ascontiguousarray(embeddings, dtype=np.float32)
    dim = embeddings.shape[1]
    
    # Store in memory cache
    for idx, pid in enumerate(_product_id_map):
        _embeddings_cache[pid] = embeddings[idx]
        
    # Build FAISS IndexFlatIP (cosine similarity on normalized vectors)
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    _faiss_index = index
    
    # Persist
    try:
        faiss.write_index(_faiss_index, INDEX_PATH)
        with open(META_PATH, "w", encoding="utf-8") as f:
            json.dump({"product_ids": _product_id_map}, f)
    except Exception as e:
        print(f"Failed to persist FAISS index: {e}")
        
    return _faiss_index

def search_vector_index(query_text: str, top_k: int = 15) -> List[Tuple[int, float]]:
    """Encodes query and returns top matching product IDs with cosine similarity scores."""
    global _faiss_index, _product_id_map
    
    if _faiss_index is None:
        from backend.database.db import get_all_products
        build_or_load_index(get_all_products())
        
    model = get_sentence_model()
    if model is not None:
        query_vec = model.encode([query_text], convert_to_numpy=True, normalize_embeddings=True)
    else:
        # Fallback vector
        if _embeddings_cache:
            dim = next(iter(_embeddings_cache.values())).shape[0]
        else:
            dim = 384
        query_vec = np.zeros((1, dim), dtype=np.float32)
        
    query_vec = np.ascontiguousarray(query_vec, dtype=np.float32)
    
    scores, indices = _faiss_index.search(query_vec, min(top_k, len(_product_id_map)))
    
    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx >= 0 and idx < len(_product_id_map):
            results.append((_product_id_map[idx], float(score)))
            
    return results

def get_product_embedding(product_id: int) -> Optional[np.ndarray]:
    """Retrieves embedding vector for a given product ID."""
    return _embeddings_cache.get(product_id)
