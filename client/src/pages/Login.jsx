import React, { useState } from 'react';
import { apiRequest, setAuthToken, setAuthUser } from '../utils/api';

const Login = ({ navigate, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { identifier: identifier.trim(), password }
      });
      
      // Save tokens and session
      setAuthToken(data.access_token);
      setAuthUser(data.user);
      
      // Callback to update parent state
      onLoginSuccess(data.user);
      
      navigate('home');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to publish posts and write comments</p>
        </div>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username-email">Username or Email</label>
            <input
              type="text"
              id="username-email"
              className="form-control"
              placeholder="e.g. dev_user or user@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <a 
            href="#" 
            className="auth-link"
            onClick={(e) => {
              e.preventDefault();
              navigate('register');
            }}
          >
            Create an Account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
