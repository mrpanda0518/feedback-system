import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import BlogPostCard from '../components/BlogPostCard';
import Loading from '../components/Loading';

const Home = ({ navigate, user }) => {
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'dashboard'
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const postsData = await apiRequest('/posts');
      setPosts(postsData);
      
      const analyticsData = await apiRequest('/analytics');
      setAnalytics(analyticsData);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve feedback data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesDept = selectedDept === 'All' || post.department === selectedDept;
    
    return matchesSearch && matchesCategory && matchesDept;
  });

  const handleScrollDown = () => {
    const target = document.getElementById('feedbacks-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      <section className="hero" style={{ padding: '2rem 1rem 3rem' }}>
        <h1 className="hero-title">RSR Engineering College</h1>
        <p className="hero-subtitle">
          Voice your feedback, track academic & facility reviews, and browse department responses.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {user ? (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('create')}
            >
              Submit New Feedback
            </button>
          ) : (
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('login')}
            >
              Sign In to Submit Feedback
            </button>
          )}
        </div>

        <div className="scroll-down-indicator" onClick={handleScrollDown}>
          <span style={{ fontSize: '0.8rem', fontWeight: '500', opacity: 0.8 }}>Scroll Down</span>
          <div className="mouse-icon">
            <div className="mouse-wheel"></div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div id="feedbacks-section" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.75rem'
      }}>
        <button
          onClick={() => setActiveTab('feed')}
          className={`btn ${activeTab === 'feed' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ borderRadius: '20px', padding: '0.5rem 1.5rem' }}
        >
          All Feedbacks
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ borderRadius: '20px', padding: '0.5rem 1.5rem' }}
        >
          Analytics & Insights
        </button>
      </div>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {loading ? (
        <Loading />
      ) : activeTab === 'feed' ? (
        <>
          {/* Filters Panel */}
          <div className="card mb-3" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: '1', minWidth: '250px' }} className="search-container mb-1">
                <span className="search-icon" style={{ top: '50%' }}>
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" x1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input 
                  type="text" 
                  className="form-control search-input" 
                  placeholder="Search feedbacks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Category</label>
                <select
                  className="form-control"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ minWidth: '150px', padding: '0.5rem' }}
                >
                  <option value="All">All Categories</option>
                  <option value="Academics">Academics</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Library">Library</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Mess & Canteen">Mess & Canteen</option>
                  <option value="Placements">Placements</option>
                  <option value="General">General / Other</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Department</label>
                <select
                  className="form-control"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  style={{ minWidth: '150px', padding: '0.5rem' }}
                >
                  <option value="All">All Departments</option>
                  <option value="General">General / All</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                  <option value="IT">IT</option>
                </select>
              </div>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">📝</div>
              <h3>No feedbacks found</h3>
              <p>
                Try clearing your search filters or submit a new feedback to get started!
              </p>
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map(post => (
                <BlogPostCard 
                  key={post.id} 
                  post={post} 
                  navigate={navigate} 
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Analytics Dashboard View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="card text-center" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
              <h3 style={{ color: 'var(--text-muted)' }}>Total Feedbacks</h3>
              <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--color-primary)' }}>
                {analytics?.total_feedback || 0}
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Submitted by students across all branches</p>
            </div>

            <div className="card text-center" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</div>
              <h3 style={{ color: 'var(--text-muted)' }}>Average Satisfaction</h3>
              <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#fbbf24' }}>
                {analytics?.avg_rating ? `${analytics.avg_rating} / 5` : 'N/A'}
              </h1>
              <div style={{ color: '#fbbf24', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                {analytics?.avg_rating ? '★'.repeat(Math.round(analytics.avg_rating)) + '☆'.repeat(5 - Math.round(analytics.avg_rating)) : ''}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Overall rated rating of campus metrics</p>
            </div>
          </div>

          {/* Breakdown Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {/* Category Breakdown */}
            <div className="card">
              <h3 className="mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Breakdown by Category
              </h3>
              {analytics?.categories && analytics.categories.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {analytics.categories.map((cat, idx) => {
                    const percentage = analytics.total_feedback > 0 ? (cat.count / analytics.total_feedback) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '500' }}>{cat.category}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{cat.count} feedbacks ({Math.round(percentage)}%)</span>
                        </div>
                        {/* Progress Bar Container */}
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '0.25rem' }}>
                          <div style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                          Rating: {cat.avg_rating > 0 ? `${cat.avg_rating} ★` : 'No rating'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No category data available.</p>
              )}
            </div>

            {/* Department Breakdown */}
            <div className="card">
              <h3 className="mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Breakdown by Department
              </h3>
              {analytics?.departments && analytics.departments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {analytics.departments.map((dept, idx) => {
                    const percentage = analytics.total_feedback > 0 ? (dept.count / analytics.total_feedback) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '500' }}>{dept.department}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{dept.count} feedbacks ({Math.round(percentage)}%)</span>
                        </div>
                        {/* Progress Bar Container */}
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '0.25rem' }}>
                          <div style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                          Rating: {dept.avg_rating > 0 ? `${dept.avg_rating} ★` : 'No rating'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No department data available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
