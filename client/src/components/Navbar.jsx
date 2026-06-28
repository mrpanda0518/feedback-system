import React from 'react';

const Navbar = ({ user, navigate, currentRouteName, onLogout }) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <a 
          href="#" 
          className="navbar-logo" 
          onClick={(e) => {
            e.preventDefault();
            navigate('home');
          }}
        >
          RSR<span>Feedback</span>
        </a>
        
        <nav className="navbar-links">
          <a 
            href="#" 
            className={`navbar-link ${currentRouteName === 'home' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate('home');
            }}
          >
            Feedbacks
          </a>
          
          {user ? (
            <>
              <a 
                href="#" 
                className={`navbar-link ${currentRouteName === 'create' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('create');
                }}
              >
                Submit Feedback
              </a>
              <span className="user-tag">
                @{user.username} <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', marginLeft: '4px', padding: '1px 4px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>{user.role}</span>
              </span>
              <button onClick={onLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <a 
                href="#" 
                className={`navbar-link ${currentRouteName === 'login' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('login');
                }}
              >
                Login
              </a>
              <a 
                href="#" 
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('register');
                }}
              >
                Sign Up
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
