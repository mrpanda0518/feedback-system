import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import Loading from './Loading';

const CommentSection = ({ postId, currentUser, postAuthorId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/posts/${postId}/comments`);
      setComments(data);
    } catch (err) {
      console.error(err);
      setError('Could not load comments.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const comment = await apiRequest(`/posts/${postId}/comments`, {
        method: 'POST',
        body: { content: newComment.trim() }
      });
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      setError(err.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await apiRequest(`/comments/${commentId}`, {
        method: 'DELETE'
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.message || 'Failed to delete comment.');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="comments-section">
      <h3 className="comments-section-title">
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        Comments ({comments.length})
      </h3>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      {currentUser ? (
        <form onSubmit={handleSubmit} className="comment-form mb-3">
          <div className="form-group">
            <textarea
              className="form-control"
              placeholder="Join the discussion... write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              maxLength={1000}
              required
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary btn-sm"
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="card mb-3 text-center" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Please log in to participate in the comments section.
          </p>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="empty-state">
          <p>No comments yet. Be the first to start the conversation!</p>
        </div>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => {
            const isCommentOwner = currentUser && comment.author_id === currentUser.id;
            const isPostOwner = currentUser && postAuthorId === currentUser.id;
            const isFacultyUser = currentUser && currentUser.role === 'faculty';
            const canDelete = isCommentOwner || isPostOwner || isFacultyUser;
            const isFacultyReply = comment.author_role === 'faculty';

            return (
              <div 
                key={comment.id} 
                className="card comment-card"
                style={isFacultyReply ? {
                  borderLeft: '4px solid var(--color-success)',
                  background: 'rgba(16, 185, 129, 0.04)'
                } : {}}
              >
                <div className="comment-avatar" style={isFacultyReply ? {
                  background: 'var(--color-success)',
                  color: 'white',
                  borderColor: 'var(--color-success)'
                } : {}}>
                  {isFacultyReply ? '🎓' : comment.author_username[0]}
                </div>
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-username">
                      @{comment.author_username}
                      {isFacultyReply && (
                        <span style={{
                          fontSize: '0.7rem',
                          background: 'var(--color-success)',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          marginLeft: '8px',
                          fontWeight: '700',
                          textTransform: 'uppercase'
                        }}>
                          Faculty
                        </span>
                      )}
                    </span>
                    <span className="comment-time">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                  
                  {canDelete && (
                    <div className="comment-actions">
                      <button 
                        onClick={() => handleDelete(comment.id)} 
                        className="btn btn-text btn-danger btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
