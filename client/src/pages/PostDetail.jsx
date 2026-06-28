import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import CommentSection from '../components/CommentSection';
import Loading from '../components/Loading';

const PostDetail = ({ postId, user, navigate }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/posts/${postId}`);
      setPost(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve blog post details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post permanently? All related comments will also be deleted.')) {
      return;
    }
    
    try {
      await apiRequest(`/posts/${postId}`, {
        method: 'DELETE'
      });
      navigate('home');
    } catch (err) {
      alert(err.message || 'Failed to delete post.');
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="alert alert-danger text-center my-4">{error}</div>;
  if (!post) return <div className="text-center my-4">Post not found.</div>;

  const isAuthor = user && user.id === post.author_id;

  return (
    <div className="post-detail-container">
      <button 
        className="btn btn-secondary btn-sm mb-3"
        onClick={() => navigate('home')}
      >
        ← Back to Feed
      </button>

      <article className="card mb-3">
        <header className="post-detail-header">
          <h1 className="post-detail-title">{post.title}</h1>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <span style={{
              fontSize: '0.8rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              fontWeight: '600',
              background: post.category === 'Academics' ? 'rgba(99, 102, 241, 0.2)' :
                          post.category === 'Facilities' ? 'rgba(236, 72, 153, 0.2)' :
                          post.category === 'Mess & Canteen' ? 'rgba(245, 158, 11, 0.2)' :
                          post.category === 'Hostel' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
              color: post.category === 'Academics' ? '#818cf8' :
                     post.category === 'Facilities' ? '#f472b6' :
                     post.category === 'Mess & Canteen' ? '#fbbf24' :
                     post.category === 'Hostel' ? '#34d399' : 'var(--text-muted)',
              border: '1px solid currentColor'
            }}>
              {post.category}
            </span>
            <span style={{
              fontSize: '0.8rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              fontWeight: '500',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)'
            }}>
              Department: {post.department}
            </span>
            {post.rating > 0 && (
              <span style={{ fontSize: '0.9rem', color: '#fbbf24', display: 'flex', alignItems: 'center' }}>
                {'★'.repeat(post.rating)}{'☆'.repeat(5 - post.rating)}
              </span>
            )}
          </div>
          
          <div className="post-detail-meta">
            <div className="post-detail-info">
              <div className="post-author-avatar" style={{ background: post.is_anonymous ? 'var(--bg-input)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                {post.is_anonymous ? '👤' : post.author_username[0]}
              </div>
              <div className="post-author-details">
                <span className="post-author-name">
                  {post.is_anonymous ? 'Anonymous Student' : `@${post.author_username}`}
                </span>
                <span className="post-date">
                  Submitted on {new Date(post.created_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            
            {isAuthor && (
              <div className="post-controls">
                <button 
                  onClick={() => navigate('edit', { postId: post.id })} 
                  className="btn btn-secondary btn-sm"
                >
                  Edit Feedback
                </button>
                <button 
                  onClick={handleDelete} 
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="post-detail-content">
          {post.content}
        </div>
      </article>

      <CommentSection 
        postId={post.id} 
        currentUser={user} 
        postAuthorId={post.author_id} 
      />
    </div>
  );
};

export default PostDetail;
