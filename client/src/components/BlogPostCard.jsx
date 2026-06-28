import React from 'react';

const BlogPostCard = ({ post, navigate }) => {
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  const getExcerpt = (text) => {
    if (!text) return '';
    return text.length > 130 ? text.substring(0, 130) + '...' : text;
  };

  return (
    <article 
      className="card card-hover post-card"
      onClick={() => navigate('detail', { postId: post.id })}
      style={{ cursor: 'pointer' }}
    >
      <div className="post-meta" style={{ flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <span className="post-author" style={{ color: post.is_anonymous ? 'var(--text-dim)' : 'var(--color-secondary)' }}>
          {post.is_anonymous ? '👤 Anonymous' : `@${post.author_username}`}
        </span>
        <span>•</span>
        <span className="post-date">{formatDate(post.created_at)}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <span style={{
          fontSize: '0.75rem',
          padding: '0.15rem 0.5rem',
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
          fontSize: '0.75rem',
          padding: '0.15rem 0.5rem',
          borderRadius: '12px',
          fontWeight: '500',
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)'
        }}>
          Dept: {post.department}
        </span>
        {post.rating > 0 && (
          <span style={{ fontSize: '0.85rem', color: '#fbbf24', display: 'flex', alignItems: 'center' }}>
            {'★'.repeat(post.rating)}{'☆'.repeat(5 - post.rating)}
          </span>
        )}
      </div>
      
      <h3 className="post-title">{post.title}</h3>
      <p className="post-excerpt">{getExcerpt(post.content)}</p>
      
      <div className="post-footer">
        <span className="comments-badge">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {post.comments_count} {post.comments_count === 1 ? 'reply' : 'replies'}
        </span>
        
        <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
          Details →
        </span>
      </div>
    </article>
  );
};

export default BlogPostCard;
