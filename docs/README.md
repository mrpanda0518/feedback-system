# RSR Feedback System

A premium **Engineering College Feedback System** built with a FastAPI backend (Python, SQLite) and a React frontend (Vite, vanilla CSS). It allows students to submit reviews about college facilities, academics, hostels, canteen, and placements, with an option to post anonymously. Faculty members can register and provide highlighted official responses.

---

## Folder Structure

```
blog-platform/
├── backend/
│   ├── main.py            # FastAPI main application and endpoints
│   ├── database.py        # SQLite connection and migration runner
│   ├── auth.py            # JWT and bcrypt authentication utilities
│   ├── blog.db            # SQLite database file
│   └── requirements.txt   # Python dependency list
├── client/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI elements (Navbar, CommentSection)
│   │   ├── pages/         # View components (Home, Register, CreateEditPost)
│   │   ├── utils/         # API request utilities
│   │   ├── App.jsx        # SPA Router
│   │   └── index.css      # Core Design System (glassmorphism theme)
│   ├── package.json       # React dependency list
│   └── vite.config.js     # Vite compilation config
└── docs/
    └── README.md          # Project Documentation
```

---

## Features

1. **Dual Role Authentication**:
   - **Students**: Can submit feedbacks, optionally toggle anonymity, and leave comments.
   - **Faculty**: Can sign up using the verification passcode (`FACULTY123`). Faculty replies are highlighted in green with a custom "Faculty" badge.
2. **Detailed Feedback Submission**:
   - Custom categorizations: *Academics, Facilities, Library, Hostel, Mess & Canteen, Placements, and General*.
   - Department filters: *CSE, ECE, EEE, ME, CE, IT*.
   - Satisfaction level stars (1-5 ratings).
   - Dynamic anonymity control to protect student identities.
3. **Analytics Dashboard**:
   - Integrated dashboard with statistical summaries showing total feedback volume and average satisfaction ratings.
   - Visual progress bar charts showing feedback distributions by category and department.

---

## Database Schema (SQLite)

- **`users` Table**:
  - `id` (INTEGER, Primary Key)
  - `username` (TEXT, Unique)
  - `email` (TEXT, Unique)
  - `password_hash` (TEXT)
  - `role` (TEXT, default 'student')
  - `created_at` (TIMESTAMP)

- **`posts` (Feedbacks) Table**:
  - `id` (INTEGER, Primary Key)
  - `title` (TEXT)
  - `content` (TEXT)
  - `author_id` (INTEGER, Foreign Key referencing `users`)
  - `category` (TEXT)
  - `department` (TEXT)
  - `rating` (INTEGER)
  - `is_anonymous` (INTEGER)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- **`comments` Table**:
  - `id` (INTEGER, Primary Key)
  - `post_id` (INTEGER, Foreign Key referencing `posts`)
  - `author_id` (INTEGER, Foreign Key referencing `users`)
  - `content` (TEXT)
  - `created_at` (TIMESTAMP)

---

## Quick Start Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server using Uvicorn:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Open the browser and visit `http://localhost:5173/`.
