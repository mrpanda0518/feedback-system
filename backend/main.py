import re
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from database import init_db, get_db
from auth import hash_password, verify_password, create_access_token, get_current_user

# Initialize database tables
init_db()

app = FastAPI(title="Blog Platform with Comments API", version="1.0.0")

# Configure CORS so our React frontend can make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development we allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class UserRegisterSchema(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "student"

class UserLoginSchema(BaseModel):
    identifier: str  # Can be username or email
    password: str

class PostCreateSchema(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    content: str = Field(..., min_length=5)
    category: Optional[str] = "General"
    department: Optional[str] = "General"
    rating: Optional[int] = 0
    is_anonymous: Optional[bool] = False

class CommentCreateSchema(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


# --- Root Route ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the RSR Feedback API! Visit /docs for Swagger interactive documentation."}


# --- Authentication Endpoints ---

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegisterSchema, db = Depends(get_db)):
    cursor = db.cursor()
    
    # Clean username formatting
    username = user_data.username.strip().lower()
    email = user_data.email.strip().lower()
    role = user_data.role.strip().lower() if user_data.role else "student"
    
    # Check if username or email exists
    cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
    if cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered."
        )
    
    # Insert new user
    hashed = hash_password(user_data.password)
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
            (username, email, hashed, role)
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during registration: {str(e)}"
        )
        
    return {"message": "User registered successfully."}


@app.post("/api/auth/login")
def login(login_data: UserLoginSchema, db = Depends(get_db)):
    cursor = db.cursor()
    identifier = login_data.identifier.strip().lower()
    
    # Find user by username or email
    cursor.execute("SELECT * FROM users WHERE username = ? OR email = ?", (identifier, identifier))
    user = cursor.fetchone()
    
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password."
        )
    
    # Create JWT
    token = create_access_token(data={"sub": str(user["id"]), "username": user["username"]})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }


@app.get("/api/auth/me")
def get_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "created_at": current_user["created_at"]
    }


# --- Blog Post Endpoints ---

@app.get("/api/posts")
def get_posts(db = Depends(get_db)):
    cursor = db.cursor()
    query = """
        SELECT p.id, p.title, p.content, p.author_id, p.created_at, p.updated_at,
               p.category, p.department, p.rating, p.is_anonymous,
               u.username as author_username,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
        FROM posts p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
    """
    cursor.execute(query)
    posts = cursor.fetchall()
    
    # Anonymize author username if is_anonymous is True
    result = []
    for post in posts:
        post_dict = dict(post)
        if post_dict["is_anonymous"] == 1:
            post_dict["author_username"] = "Anonymous Student"
        result.append(post_dict)
    return result


@app.get("/api/posts/{post_id}")
def get_post(post_id: int, db = Depends(get_db)):
    cursor = db.cursor()
    query = """
        SELECT p.id, p.title, p.content, p.author_id, p.created_at, p.updated_at,
               p.category, p.department, p.rating, p.is_anonymous,
               u.username as author_username
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.id = ?
    """
    cursor.execute(query, (post_id,))
    post = cursor.fetchone()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found."
        )
    
    post_dict = dict(post)
    if post_dict["is_anonymous"] == 1:
        post_dict["author_username"] = "Anonymous Student"
    return post_dict


@app.post("/api/posts", status_code=status.HTTP_201_CREATED)
def create_post(post_data: PostCreateSchema, current_user = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute(
            """INSERT INTO posts (title, content, author_id, category, department, rating, is_anonymous) 
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                post_data.title, 
                post_data.content, 
                current_user["id"],
                post_data.category or "General",
                post_data.department or "General",
                post_data.rating or 0,
                1 if post_data.is_anonymous else 0
            )
        )
        db.commit()
        post_id = cursor.lastrowid
        
        # Fetch the newly created post
        cursor.execute("""
            SELECT p.id, p.title, p.content, p.author_id, p.created_at, p.updated_at,
                   p.category, p.department, p.rating, p.is_anonymous,
                   u.username as author_username, 0 as comments_count
            FROM posts p
            JOIN users u ON p.author_id = u.id
            WHERE p.id = ?
        """, (post_id,))
        post = cursor.fetchone()
        post_dict = dict(post)
        if post_dict["is_anonymous"] == 1:
            post_dict["author_username"] = "Anonymous Student"
        return post_dict
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create feedback: {str(e)}"
        )


@app.put("/api/posts/{post_id}")
def update_post(post_id: int, post_data: PostCreateSchema, current_user = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor()
    
    # Find existing post
    cursor.execute("SELECT * FROM posts WHERE id = ?", (post_id,))
    post = cursor.fetchone()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found."
        )
        
    # Check authorization
    if post["author_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to edit this feedback."
        )
        
    try:
        cursor.execute(
            """UPDATE posts SET title = ?, content = ?, category = ?, department = ?, rating = ?, is_anonymous = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?""",
            (
                post_data.title, 
                post_data.content, 
                post_data.category or "General",
                post_data.department or "General",
                post_data.rating or 0,
                1 if post_data.is_anonymous else 0,
                post_id
            )
        )
        db.commit()
        
        # Fetch updated post
        cursor.execute("""
            SELECT p.id, p.title, p.content, p.author_id, p.created_at, p.updated_at,
                   p.category, p.department, p.rating, p.is_anonymous,
                   u.username as author_username
            FROM posts p
            JOIN users u ON p.author_id = u.id
            WHERE p.id = ?
        """, (post_id,))
        post = cursor.fetchone()
        post_dict = dict(post)
        if post_dict["is_anonymous"] == 1:
            post_dict["author_username"] = "Anonymous Student"
        return post_dict
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update feedback: {str(e)}"
        )


@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor()
    
    # Find existing post
    cursor.execute("SELECT * FROM posts WHERE id = ?", (post_id,))
    post = cursor.fetchone()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found."
        )
        
    # Check authorization
    if post["author_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this feedback."
        )
        
    try:
        cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        db.commit()
        return {"message": "Feedback deleted successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete feedback: {str(e)}"
        )


# --- Comment Endpoints ---

@app.get("/api/posts/{post_id}/comments")
def get_comments(post_id: int, db = Depends(get_db)):
    cursor = db.cursor()
    # Verify post exists
    cursor.execute("SELECT id FROM posts WHERE id = ?", (post_id,))
    if not cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found."
        )
        
    query = """
        SELECT c.id, c.post_id, c.author_id, c.content, c.created_at,
               u.username as author_username, u.role as author_role
        FROM comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    """
    cursor.execute(query, (post_id,))
    comments = cursor.fetchall()
    return comments


@app.post("/api/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED)
def create_comment(post_id: int, comment_data: CommentCreateSchema, current_user = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor()
    # Verify post exists
    cursor.execute("SELECT id FROM posts WHERE id = ?", (post_id,))
    if not cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found."
        )
        
    try:
        cursor.execute(
            "INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)",
            (post_id, current_user["id"], comment_data.content)
        )
        db.commit()
        comment_id = cursor.lastrowid
        
        # Fetch newly created comment
        cursor.execute("""
            SELECT c.id, c.post_id, c.author_id, c.content, c.created_at,
                   u.username as author_username, u.role as author_role
            FROM comments c
            JOIN users u ON c.author_id = u.id
            WHERE c.id = ?
        """, (comment_id,))
        return cursor.fetchone()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit comment: {str(e)}"
        )


@app.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.cursor()
    
    # Find comment
    cursor.execute("SELECT * FROM comments WHERE id = ?", (comment_id,))
    comment = cursor.fetchone()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found."
        )
        
    # Find post of this comment
    cursor.execute("SELECT author_id FROM posts WHERE id = ?", (comment["post_id"],))
    post = cursor.fetchone()
    post_author_id = post["author_id"] if post else None
    
    # Authorized if current user is comment author OR post author OR current user is faculty
    if comment["author_id"] != current_user["id"] and post_author_id != current_user["id"] and current_user["role"] != "faculty":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this comment."
        )
        
    try:
        cursor.execute("DELETE FROM comments WHERE id = ?", (comment_id,))
        db.commit()
        return {"message": "Comment deleted successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete comment: {str(e)}"
        )


# --- Analytics Endpoint ---

@app.get("/api/analytics")
def get_analytics(db = Depends(get_db)):
    cursor = db.cursor()
    
    # 1. Total feedback
    cursor.execute("SELECT COUNT(*) as count FROM posts")
    total_feedback = cursor.fetchone()["count"]
    
    # 2. Avg rating overall
    cursor.execute("SELECT AVG(rating) as avg_rating FROM posts WHERE rating > 0")
    row = cursor.fetchone()
    avg_rating = round(row["avg_rating"], 2) if row and row["avg_rating"] is not None else 0
    
    # 3. Feedbacks count and avg rating by category
    cursor.execute("""
        SELECT category, COUNT(*) as count, AVG(rating) as avg_rating 
        FROM posts 
        GROUP BY category
    """)
    categories_data = cursor.fetchall()
    categories = []
    for cat in categories_data:
        categories.append({
            "category": cat["category"],
            "count": cat["count"],
            "avg_rating": round(cat["avg_rating"], 2) if cat["avg_rating"] is not None else 0
        })
        
    # 4. Feedbacks count and avg rating by department
    cursor.execute("""
        SELECT department, COUNT(*) as count, AVG(rating) as avg_rating 
        FROM posts 
        GROUP BY department
    """)
    departments_data = cursor.fetchall()
    departments = []
    for dept in departments_data:
        departments.append({
            "department": dept["department"],
            "count": dept["count"],
            "avg_rating": round(dept["avg_rating"], 2) if dept["avg_rating"] is not None else 0
        })
        
    return {
        "total_feedback": total_feedback,
        "avg_rating": avg_rating,
        "categories": categories,
        "departments": departments
    }
