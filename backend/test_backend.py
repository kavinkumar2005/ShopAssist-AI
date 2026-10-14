import sys
import os

# Set UTF-8 encoding for standard outputs
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.db import (
    init_db, get_all_products, get_product_by_id,
    get_user_preferences, get_analytics_metrics
)
from backend.nlp.entity_extractor import extract_entities
from backend.nlp.intent_classifier import (
    classify_intent, INTENT_SEARCH, INTENT_COMPARE, INTENT_QUESTION,
    INTENT_RECOMMENDATION, INTENT_BUDGET, INTENT_FEATURE
)
from backend.nlp.fuzzy_matcher import correct_brand
from backend.nlp.hybrid_search import hybrid_search
from backend.rag.embeddings import build_or_load_index, search_vector_index
from backend.rag.conversation import process_chat_message
from backend.api.routes_compare import analyze_comparison

def test_database():
    print("\n--- 1. Testing Database & Seed Data ---")
    init_db()
    products = get_all_products()
    assert len(products) == 50, f"Expected 50 products, got {len(products)}"
    categories = set(p["category"] for p in products)
    assert len(categories) == 7, f"Expected 7 categories, got {len(categories)}"
    print(f"✓ Database has {len(products)} products across categories: {list(categories)}")

def test_nlp_extraction():
    print("\n--- 2. Testing NLP Entity Extraction ---")
    # Test case 1
    q1 = "I need a laptop under 60,000 for coding, machine learning, and gaming with at least 16GB RAM."
    e1 = extract_entities(q1)
    assert e1["category"] == "Laptops", f"Expected Laptops, got {e1['category']}"
    assert e1["budget"] == 60000, f"Expected 60000, got {e1['budget']}"
    assert e1["ram"] == 16, f"Expected 16, got {e1['ram']}"
    assert "Coding" in e1["use_cases"], "Expected Coding in use cases"
    assert "Machine Learning" in e1["use_cases"], "Expected Machine Learning in use cases"
    assert "Gaming" in e1["use_cases"], "Expected Gaming in use cases"
    print(f"✓ Q1 extracted successfully: Category={e1['category']}, Budget={e1['budget']}, RAM={e1['ram']}, Uses={e1['use_cases']}")

    # Test case 2
    q2 = "I need a Dell laptop under 70000 with 16GB RAM"
    e2 = extract_entities(q2)
    assert e2["brand"] == "Dell", f"Expected Dell, got {e2['brand']}"
    assert e2["category"] == "Laptops"
    assert e2["budget"] == 70000
    assert e2["ram"] == 16
    print(f"✓ Q2 extracted successfully: Brand={e2['brand']}, Category={e2['category']}, Budget={e2['budget']}, RAM={e2['ram']}")

    # Test case 3: Fuzzy Brand
    assert correct_brand("Lenevo") == "Lenovo", "Expected Lenovo for Lenevo"
    assert correct_brand("Aser") == "Acer", "Expected Acer for Aser"
    print("✓ Fuzzy matching corrected 'Lenevo' -> 'Lenovo' and 'Aser' -> 'Acer'")

def test_intent_classification():
    print("\n--- 3. Testing Intent Recognition ---")
    i1 = classify_intent("gaming laptop", {})
    assert i1 in [INTENT_SEARCH, INTENT_FEATURE]

    i2 = classify_intent("Compare HP Victus and Lenovo LOQ", {})
    assert i2 == INTENT_COMPARE, f"Expected Compare, got {i2}"

    i3 = classify_intent("Is this laptop suitable for ML?", {}, context_product_id=1)
    assert i3 == INTENT_QUESTION, f"Expected Question, got {i3}"

    i4 = classify_intent("Best laptop under 60000 for ML", {})
    assert i4 == INTENT_RECOMMENDATION, f"Expected Recommendation, got {i4}"

    i5 = classify_intent("phones under 30000", {"budget": 30000})
    assert i5 == INTENT_BUDGET, f"Expected Budget, got {i5}"
    print("✓ All 5 intent types classified accurately")

def test_vector_and_hybrid_search():
    print("\n--- 4. Testing FAISS Vector & Hybrid Search ---")
    products = get_all_products()
    build_or_load_index(products)
    
    vec_results = search_vector_index("laptop for coding and software engineering", top_k=5)
    assert len(vec_results) > 0, "Vector search should return results"
    print(f"✓ FAISS Vector search returned top {len(vec_results)} nearest neighbors")

    hybrid_results, extracted = hybrid_search(
        query="I need a laptop under 60000 for coding, machine learning, and gaming with at least 16GB RAM."
    )
    assert len(hybrid_results) > 0, "Hybrid search must return products"
    top_laptop = hybrid_results[0]
    assert top_laptop["price"] <= 60000, f"Expected price <= 60000, got {top_laptop['price']}"
    assert "16GB" in top_laptop["ram"], f"Expected 16GB RAM, got {top_laptop['ram']}"
    print(f"✓ Hybrid search top recommendation: {top_laptop['name']} (₹{top_laptop['price']:,}, {top_laptop['ram']} RAM)")

def test_conversational_rag_and_refinement():
    print("\n--- 5. Testing Conversational RAG & Requirement Refinement ---")
    # Vague query: should trigger refinement
    res1 = process_chat_message("I need a laptop")
    assert res1["refinement_needed"] is True, "Vague query should trigger refinement"
    assert len(res1["refinement_questions"]) > 0, "Refinement questions should be provided"
    assert len(res1["suggested_chips"]) > 0, "Suggested chips should be provided"
    print(f"✓ Vague query properly flagged for refinement with {len(res1['suggested_chips'])} suggested chips")

    # Follow-up in same conversation
    conv_id = res1["conversation_id"]
    res2 = process_chat_message(
        "My budget is 60000 for coding, machine learning and gaming with 16GB RAM",
        conversation_id=conv_id
    )
    assert res2["refinement_needed"] is False
    assert len(res2["recommended_products"]) > 0
    assert "HP Victus" in res2["reply"] or "Lenovo LOQ" in res2["reply"]
    print("✓ Follow-up refined multi-turn conversation into grounded recommendations")

def test_comparison():
    print("\n--- 6. Testing Product Comparison ---")
    p1 = get_product_by_id(1)
    p2 = get_product_by_id(2)
    analysis = analyze_comparison([p1, p2])
    assert analysis["winner_id"] is not None
    assert "Verdict" in analysis["verdict"]
    assert 1 in analysis["pros_cons"] and 2 in analysis["pros_cons"]
    print(f"✓ Comparison generated verdict and pros/cons successfully")

def test_analytics():
    print("\n--- 7. Testing Analytics ---")
    metrics = get_analytics_metrics()
    assert metrics["total_products"] == 50
    assert "Laptops" in metrics["categories_distribution"]
    assert len(metrics["most_searched_categories"]) > 0
    print(f"✓ Analytics retrieved metrics with {metrics['total_products']} products and {len(metrics['categories_distribution'])} categories")

if __name__ == "__main__":
    print("=========================================")
    print("  RUNNING BACKEND TEST SUITE")
    print("=========================================")
    test_database()
    test_nlp_extraction()
    test_intent_classification()
    test_vector_and_hybrid_search()
    test_conversational_rag_and_refinement()
    test_comparison()
    test_analytics()
    print("\n=========================================")
    print("  ALL BACKEND TESTS PASSED SUCCESSFULLY! ")
    print("=========================================")
