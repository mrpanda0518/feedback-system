import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import Loading from '../components/Loading';

const CreateEditPost = ({ postId, user, navigate }) => {
  const isEditMode = !!postId;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [department, setDepartment] = useState('General');
  const [rating, setRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('login');
      return;
    }

    if (isEditMode) {
      fetchPostForEdit();
    }
  }, [postId, user]);

  const fetchPostForEdit = async () => {
    setLoading(true);
    try {
      const post = await apiRequest(`/posts/${postId}`);
      if (post.author_id !== user.id) {
        alert('You are not authorized to edit this post.');
        navigate('home');
        return;
      }
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category || 'General');
      setDepartment(post.department || 'General');
      setRating(post.rating || 0);
      setIsAnonymous(!!post.is_anonymous);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve post data for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      if (isEditMode) {
        await apiRequest(`/posts/${postId}`, {
          method: 'PUT',
          body: { 
            title: title.trim(), 
            content: content.trim(),
            category,
            department,
            rating,
            is_anonymous: isAnonymous
          }
        });
        navigate('detail', { postId });
      } else {
        const newPost = await apiRequest('/posts', {
          method: 'POST',
          body: { 
            title: title.trim(), 
            content: content.trim(),
            category,
            department,
            rating,
            is_anonymous: isAnonymous
          }
        });
        navigate('detail', { postId: newPost.id });
      }
    } catch (err) {
      setError(err.message || 'An error occurred during submission.');
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        className="btn btn-secondary btn-sm mb-3"
        onClick={() => isEditMode ? navigate('detail', { postId }) : navigate('home')}
      >
        Cancel
      </button>

      <div className="card">
        <h2 className="mb-3">{isEditMode ? 'Edit Feedback' : 'Submit Feedback'}</h2>
        
        {error && <div className="alert alert-danger mb-3">{error}</div>}
 
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="post-title">Feedback Title / Subject</label>
            <input
              type="text"
              id="post-title"
              className="form-control"
              placeholder="e.g. Broken laboratory computers, Outdated syllabus, Canteen quality"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              maxLength={150}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="post-category">Category</label>
            <select
              id="post-category"
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
            >
              <option value="Academics">Academics</option>
              <option value="Facilities">Facilities & Infrastructure</option>
              <option value="Library">Library</option>
              <option value="Hostel">Hostel & Accommodation</option>
              <option value="Mess & Canteen">Mess & Canteen</option>
              <option value="Placements">Placements</option>
              <option value="General">General / Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="post-dept">Target Department</label>
            <select
              id="post-dept"
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={submitting}
            >
              <option value="General">General / All Departments</option>
              <option value="CSE">Computer Science & Engineering (CSE)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="EEE">Electrical & Electronics (EEE)</option>
              <option value="ME">Mechanical Engineering (ME)</option>
              <option value="CE">Civil Engineering (CE)</option>
              <option value="IT">Information Technology (IT)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Rating / Satisfaction Level (Optional)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    color: star <= rating ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                    transition: 'transform 0.1s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ★
                </button>
              ))}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                {rating > 0 ? `${rating} of 5 Stars` : 'No rating selected'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="post-content">Feedback Details / Description</label>
            <textarea
              id="post-content"
              className="form-control"
              placeholder="Provide a detailed description of your feedback, suggestion, or complaint..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              style={{ minHeight: '200px' }}
              required
            ></textarea>
          </div>

          <div className="form-group mb-3" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="post-anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={submitting}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="post-anonymous" style={{ color: 'var(--text-main)', cursor: 'pointer', userSelect: 'none' }}>
              Submit Anonymously (Your username will not be displayed)
            </label>
          </div>
 
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update Feedback' : 'Publish Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditPost;
