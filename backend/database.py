import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "blog.db")

def dict_factory(cursor, row):
    """Convert SQLite row to a standard dictionary."""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db_connection():
    """Establish a connection to the SQLite database with dict output and foreign keys enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Create tables if they don't already exist and update schema if needed."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 2. Posts Table (Feedbacks)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        category TEXT DEFAULT 'General',
        department TEXT DEFAULT 'General',
        rating INTEGER DEFAULT 0,
        is_anonymous INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    );
    """)
    
    # 3. Comments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    );
    """)
    
    # Run migrations for existing databases to add new columns if they are missing
    # SQLite does not support ADD COLUMN IF NOT EXISTS directly, so we check table info
    cursor.execute("PRAGMA table_info(users);")
    user_columns = [col["name"] for col in cursor.fetchall()]
    if "role" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';")
        
    cursor.execute("PRAGMA table_info(posts);")
    post_columns = [col["name"] for col in cursor.fetchall()]
    if "category" not in post_columns:
        cursor.execute("ALTER TABLE posts ADD COLUMN category TEXT DEFAULT 'General';")
    if "department" not in post_columns:
        cursor.execute("ALTER TABLE posts ADD COLUMN department TEXT DEFAULT 'General';")
    if "rating" not in post_columns:
        cursor.execute("ALTER TABLE posts ADD COLUMN rating INTEGER DEFAULT 0;")
    if "is_anonymous" not in post_columns:
        cursor.execute("ALTER TABLE posts ADD COLUMN is_anonymous INTEGER DEFAULT 0;")
        
    conn.commit()
    conn.close()
    print("Database initialized and migrated successfully.")

# Expose a generator for FastAPI dependency injection
def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()
