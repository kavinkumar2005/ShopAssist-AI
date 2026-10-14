CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    ram TEXT NOT NULL,
    storage TEXT NOT NULL,
    processor TEXT NOT NULL,
    battery TEXT NOT NULL,
    display TEXT NOT NULL,
    rating REAL NOT NULL,
    reviews_count INTEGER NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    features TEXT NOT NULL, -- JSON array of strings
    use_cases TEXT NOT NULL, -- JSON array of strings
    stock_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS search_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    category TEXT,
    extracted_budget INTEGER,
    intent TEXT,
    results_count INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    preferred_categories TEXT, -- JSON array
    preferred_brands TEXT, -- JSON array
    min_budget INTEGER DEFAULT 0,
    max_budget INTEGER DEFAULT 200000,
    preferred_use_cases TEXT, -- JSON array
    search_history TEXT, -- JSON array
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comparisons_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_ids TEXT NOT NULL, -- JSON array of product IDs
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
