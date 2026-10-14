from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    name: str
    brand: str
    category: str
    price: int
    ram: str
    storage: str
    processor: str
    battery: str
    display: str
    rating: float
    reviews_count: int
    description: str
    image_url: str
    features: List[str]
    use_cases: List[str]
    stock_status: str = "In Stock"

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

class ExtractedConstraints(BaseModel):
    category: Optional[str] = None
    brand: Optional[str] = None
    budget: Optional[int] = None
    min_budget: Optional[int] = None
    max_budget: Optional[int] = None
    ram: Optional[int] = None
    storage: Optional[str] = None
    processor: Optional[str] = None
    gaming_requirement: bool = False
    camera_requirement: bool = False
    battery_requirement: bool = False
    use_cases: List[str] = []
    raw_query: str = ""

class SearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    min_ram: Optional[int] = None
    use_case: Optional[str] = None
    sort_by: Optional[str] = "relevance" # relevance, price_asc, price_desc, rating
    mode: Optional[str] = "hybrid" # hybrid, keyword, semantic
    limit: int = 20

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context_product_id: Optional[int] = None
    user_id: Optional[str] = "default_user"

class ChatResponse(BaseModel):
    reply: str
    intent: str
    extracted_constraints: ExtractedConstraints
    recommended_products: List[Product] = []
    refinement_needed: bool = False
    refinement_questions: List[str] = []
    suggested_chips: List[str] = []
    conversation_id: str

class CompareRequest(BaseModel):
    product_ids: List[int]

class CompareResponse(BaseModel):
    products: List[Product]
    comparison_table: Dict[str, Dict[str, Any]]
    verdict: str
    pros_cons: Dict[int, Dict[str, List[str]]]
    winner_id: Optional[int] = None

class UserPreferences(BaseModel):
    user_id: str = "default_user"
    preferred_categories: List[str] = []
    preferred_brands: List[str] = []
    min_budget: int = 0
    max_budget: int = 200000
    preferred_use_cases: List[str] = []
    search_history: List[str] = []

class AnalyticsData(BaseModel):
    total_products: int
    categories_distribution: Dict[str, int]
    most_searched_categories: List[Dict[str, Any]]
    average_searched_budget: int
    most_compared_products: List[Dict[str, Any]]
    recommendation_success_rate: float
    recent_searches: List[Dict[str, Any]]
    popular_brands: List[Dict[str, Any]]
