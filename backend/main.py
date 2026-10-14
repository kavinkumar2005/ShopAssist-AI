from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from backend.database.db import init_db, get_all_products
from backend.rag.embeddings import build_or_load_index
from backend.api import (
    routes_products,
    routes_search,
    routes_chat,
    routes_recommend,
    routes_compare,
    routes_preferences,
    routes_analytics
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and tables
    print("[Startup] Initializing SQLite database...")
    init_db()
    products = get_all_products()
    print(f"[Startup] Found {len(products)} products in catalog.")
    
    # Initialize FAISS Index and Embeddings
    print("[Startup] Initializing FAISS Vector Index...")
    try:
        build_or_load_index(products)
        print("[Startup] FAISS Vector Index ready.")
    except Exception as e:
        print(f"[Startup Warning] Could not build FAISS index: {e}")
        
    yield
    print("[Shutdown] Cleaning up ShopAssist AI backend...")

app = FastAPI(
    title="ShopAssist AI - Smart E-Commerce Assistant API",
    description="Conversational shopping assistant powered by NLP, FAISS Vector Search, and Grounded RAG.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(routes_products.router)
app.include_router(routes_search.router)
app.include_router(routes_chat.router)
app.include_router(routes_recommend.router)
app.include_router(routes_compare.router)
app.include_router(routes_preferences.router)
app.include_router(routes_analytics.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "ShopAssist AI",
        "version": "1.0.0",
        "endpoints": [
            "/products", "/search", "/chat", "/recommend",
            "/compare", "/similar/{product_id}", "/preferences", "/analytics"
        ]
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
