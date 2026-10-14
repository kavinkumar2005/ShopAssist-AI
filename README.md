# ShopAssist AI — Intelligent AI-Powered E-Commerce Platform

ShopAssist AI is a modern, production-grade conversational e-commerce web application that enables shoppers to find, evaluate, and compare products using natural language understanding instead of rigid keywords and multi-checkbox filters.

Inspired by the conversational experiences of Amazon AI, ChatGPT, and Perplexity, ShopAssist AI combines **Sentence Transformers**, **FAISS Vector Search**, an **NLP Query Parser**, and a **Grounded RAG Pipeline** with an anti-hallucination guarantee.

---

## 🚀 Key Highlights & NLP Features

1. **Natural Language Query Understanding**:
   - Query: *"I need a laptop under ₹60,000 for coding, machine learning, and gaming with at least 16GB RAM."*
   - Automatically extracts:
     - `Category: Laptops`
     - `Budget: ₹60,000`
     - `RAM: 16GB`
     - `Use Cases: Coding, Machine Learning, Gaming`
     - `Hardware: Dedicated GPU, high-performance CPU`
2. **FAISS Dense Vector Search**:
   - Generates 384-dimensional dense semantic representations using `sentence-transformers/all-MiniLM-L6-v2`.
   - Uses `faiss.IndexFlatIP` (Inner Product on unit-normalized vectors) for fast cosine similarity nearest-neighbor retrieval.
3. **Intent Recognition**:
   - `Search Product`
   - `Compare Products` (e.g. *"Compare HP Victus and Lenovo LOQ"*)
   - `Ask Product Question` (e.g. *"Is this laptop suitable for ML?"*)
   - `Recommendation Request` (e.g. *"Best laptop under 60000 for ML"*)
   - `Budget-Based Search` (e.g. *"phones under 30000"*)
   - `Feature-Based Search` (e.g. *"144Hz OLED display"*)
   - `Requirement Refinement` (handles vague inputs like *"I need a laptop"*)
4. **Typo Tolerance & Fuzzy Search**:
   - Levenshtein-based matching corrects brand typos: `"Lenevo"` ➔ `"Lenovo"`, `"Aser"` ➔ `"Acer"`.
5. **Synonym Search & Query Expansion**:
   - `"notebook"` ➔ `"laptop"`, `"phone"` ➔ `"smartphone"`, `"earbuds"` ➔ `"headphones"`.
   - Expands domain phrases (e.g. `"gaming laptop"` ➔ `"RTX"`, `"high refresh rate"`, `"discrete GPU"`).
6. **Hybrid Search**:
   - Combines Vector Cosine Similarity (45%) + Keyword/BM25 token overlap (35%) + Spec alignment score (20%) while respecting hard constraints.
7. **Grounded RAG (No Hallucination)**:
   - All recommendations, pros/cons, and technical explanations are strictly grounded in retrieved product specifications.
8. **Requirement Refinement**:
   - When a query is underspecified, the assistant prompts the user for missing criteria with 1-click suggested chips.

---

## 📦 Realistic 50-Product Dataset

The platform comes pre-seeded with 50 realistic products with authentic specifications and Indian Rupee (₹) pricing across 7 categories:
1. **Laptops (15 items)**: HP Victus 15, Lenovo LOQ 15, Acer Nitro V 15, ASUS TUF Gaming A15, Dell Inspiron 15, MacBook Air M2, MacBook Pro 14 M3, Lenovo IdeaPad Slim 3, ASUS Vivobook 15 OLED, Dell G15 5530, Acer Aspire 5, ASUS Zenbook 14 OLED, Lenovo ThinkPad E14, Acer Predator Helios Neo 16, HP Envy x360.
2. **Smartphones (10 items)**: iPhone 15, Galaxy S24, OnePlus 12, Google Pixel 8, Nothing Phone (2), Xiaomi 14, Realme GT 6T, Galaxy A55, Poco X6 Pro, Moto Edge 50 Pro.
3. **Headphones (5 items)**: Sony WH-1000XM5, Bose QuietComfort 45, Apple AirPods Max, Sennheiser Momentum 4, JBL Live 660NC.
4. **Smart Watches (5 items)**: Apple Watch Series 9, Galaxy Watch 6, Garmin Forerunner 265, OnePlus Watch 2, Amazfit GTR 4.
5. **Cameras (5 items)**: Sony Alpha A7 IV, Canon EOS R6 Mark II, Fujifilm X-T5, Nikon Z6 II, Panasonic Lumix S5 II.
6. **Tablets (5 items)**: Apple iPad Air M2, Galaxy Tab S9, Xiaomi Pad 6, OnePlus Pad 2, iPad 10th Gen.
7. **Gaming Accessories (5 items)**: Razer DeathAdder V3 Pro, Logitech G Pro X Superlight 2, Corsair K70 RGB PRO, SteelSeries Arctis Nova 7, Sony DualSense Edge.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (Glassmorphic dark aesthetic)
- **Icons**: Lucide React
- **Animations**: Framer Motion & CSS keyframe transitions
- **Routing**: React Router v7
- **HTTP**: Axios

### Backend
- **Framework**: Python 3.13 + FastAPI
- **Server**: Uvicorn (ASGI)
- **Vector Search**: FAISS (`faiss-cpu`)
- **Embeddings**: Sentence Transformers (`all-MiniLM-L6-v2`)
- **Database**: SQLite (`shopassist.db`)
- **Data Validation**: Pydantic v2

---

## 📁 Project Structure

```
├── backend/
│   ├── api/
│   │   ├── routes_products.py       # Products CRUD & catalog filtering
│   │   ├── routes_search.py         # Keyword, semantic, and hybrid search
│   │   ├── routes_chat.py           # Conversational assistant & RAG flow
│   │   ├── routes_recommend.py      # Recommendations & vector similarity
│   │   ├── routes_compare.py        # Spec matrix & AI comparison verdict
│   │   ├── routes_analytics.py      # Search logs & dashboard telemetry
│   │   └── routes_preferences.py    # User profile & shopping preferences
│   ├── database/
│   │   ├── db.py                    # SQLite connection & CRUD operations
│   │   ├── models.py                # Pydantic schemas & data models
│   │   ├── schema.sql               # Database schema definition
│   │   └── seed_data.py             # 50 products across 7 categories
│   ├── nlp/
│   │   ├── entity_extractor.py      # Regex & NLP entity extraction
│   │   ├── intent_classifier.py     # 7 intent recognition classes
│   │   ├── query_expander.py        # Synonym mapping & term expansion
│   │   ├── fuzzy_matcher.py         # Typo tolerance & brand matching
│   │   └── hybrid_search.py         # Multi-signal hybrid search scoring
│   ├── rag/
│   │   ├── embeddings.py            # SentenceTransformers & FAISS FlatIP
│   │   ├── retriever.py             # Hard constraint candidate retrieval
│   │   ├── generator.py             # Factual grounded response synthesizer
│   │   └── conversation.py          # Multi-turn state & requirement refinement
│   ├── main.py                      # FastAPI app & lifespan initialization
│   ├── requirements.txt             # Python backend dependencies
│   └── test_backend.py              # Automated backend test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Sticky nav with compare counter & search
│   │   │   ├── Footer.jsx           # Architectural overview & category links
│   │   │   ├── ProductCard.jsx      # Interactive card with specs & compare
│   │   │   ├── ComparisonDrawer.jsx # Sticky multi-product dock
│   │   │   ├── ChatMessage.jsx      # ChatGPT-style bubble with product cards
│   │   │   ├── RefinementChips.jsx  # 1-click interactive follow-up pills
│   │   │   ├── SpecBadge.jsx        # Colored specification badges
│   │   │   └── AnalyticsCard.jsx    # Metric tile component
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Hero, sample queries, features, stats
│   │   │   ├── ChatPage.jsx         # Full conversational AI shopping assistant
│   │   │   ├── CatalogPage.jsx      # Hybrid search & sidebar filters
│   │   │   ├── ProductDetailPage.jsx# Spec sheet, interactive Q&A, similar items
│   │   │   ├── ComparisonPage.jsx   # Side-by-side spec table & AI verdict
│   │   │   ├── UserDashboard.jsx    # Preferences manager & personalized feed
│   │   │   └── AdminDashboard.jsx   # Product manager & search analytics
│   │   ├── context/
│   │   │   ├── ComparisonContext.jsx# Global compare drawer state
│   │   │   └── UserContext.jsx      # Saved preferences & search history
│   │   ├── services/
│   │   │   └── api.js               # Centralized Axios client
│   │   ├── App.jsx                  # React Router setup
│   │   ├── main.jsx                 # Entrypoint
│   │   └── index.css                # Tailwind directives & glassmorphic styles
│   ├── package.json
│   └── vite.config.js
│
├── run_app.py                       # Unified runner for frontend & backend
├── run_shopassist.bat               # 1-click Windows batch launcher
├── README.md                        # Documentation
└── DEPLOYMENT.md                    # Production deployment guide
```

---

## 🛠️ Getting Started

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ & npm

### Quick Start (Both Servers with One Command)
Run:
```bash
python run_app.py
```
Or double-click `run_shopassist.bat` on Windows!

The application will be accessible at:
- **Frontend Web UI**: `http://localhost:5173`
- **FastAPI Interactive Docs**: `http://localhost:8000/docs`

---

### Manual Launch

#### 1. Backend Server
```bash
cd backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Development Server
```bash
cd frontend
npm run dev
```

---

## 🧪 Running Automated Tests

Run the backend verification suite to validate the database, NLP extraction, intent classification, FAISS vector search, hybrid search, RAG grounding, and comparison:

```bash
python backend/test_backend.py
```

Expected output:
```
=========================================
  RUNNING BACKEND TEST SUITE
=========================================
✓ Database has 50 products across 7 categories
✓ Q1 extracted successfully: Category=Laptops, Budget=60000, RAM=16, Uses=['Coding', 'Machine Learning', 'Gaming']
✓ Q2 extracted successfully: Brand=Dell, Category=Laptops, Budget=70000, RAM=16
✓ Fuzzy matching corrected 'Lenevo' -> 'Lenovo' and 'Aser' -> 'Acer'
✓ All 5 intent types classified accurately
✓ FAISS Vector search returned top 5 nearest neighbors
✓ Hybrid search top recommendation: HP Victus 15 Gaming Laptop (₹58,990, 16GB RAM)
✓ Vague query properly flagged for refinement with 5 suggested chips
✓ Follow-up refined multi-turn conversation into grounded recommendations
✓ Comparison generated verdict and pros/cons successfully
✓ Analytics retrieved metrics with 50 products and 7 categories
=========================================
  ALL BACKEND TESTS PASSED SUCCESSFULLY!
=========================================
```

---

## 🌐 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/products` | GET / POST | List products with query filters or add a new product |
| `/products/{id}` | GET / PUT / DELETE | Get, update, or remove a product |
| `/search` | POST / GET | Multi-signal hybrid search (keyword + vector + constraints) |
| `/chat` | POST | Conversational assistant with requirement refinement & RAG |
| `/recommend` | GET | Recommendations based on criteria with explanations |
| `/similar/{id}` | GET | Nearest neighbor vector discovery for a given product |
| `/compare` | POST | Side-by-side spec matrix, pros/cons, and AI verdict |
| `/preferences` | GET / POST | User shopping preferences and search history |
| `/analytics` | GET | Search trend analytics, popular categories, and metrics |

---

## 🛡️ Anti-Hallucination Guarantee

In contrast to unconstrained LLMs, ShopAssist AI enforces strict factual constraints:
1. **Spec Quotation**: Every feature mentioned in the assistant's recommendations is explicitly checked against the product dictionary.
2. **Context-Restricted Q&A**: When answering questions like *"Is this laptop good for Machine Learning?"*, the system checks actual GPU availability (`RTX`), RAM capacity (`16GB`), and CPU cores.
3. **No Fabricated Inventory**: Products are only surfaced if they exist in the SQLite database and pass vector/attribute filters.
