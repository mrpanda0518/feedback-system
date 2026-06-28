import React, { useState } from 'react';
import { apiRequest } from '../utils/api';

const Register = ({ navigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) return;
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (role === 'faculty' && passcode !== 'FACULTY123') {
        setError('Invalid Faculty verification passcode. Use FACULTY123 for demo.');
        setLoading(false);
        return;
      }
      await apiRequest('/auth/register', {
        method: 'POST',
        body: { username: username.trim(), email: email.trim(), password, role }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Try a different username/email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join the developer blogging community today</p>
        </div>

        {error && <div className="alert alert-danger mb-3">{error}</div>}
        {success && (
          <div className="alert alert-success mb-3">
            Registration successful! Redirecting you to login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="e.g. janesmith"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="e.g. jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label" htmlFor="password">Password (min 6 characters)</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label" htmlFor="role">Register As</label>
            <select
              id="role"
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading || success}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty Member</option>
            </select>
          </div>

          {role === 'faculty' && (
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="passcode">Faculty Verification Passcode</label>
              <input
                type="password"
                id="passcode"
                className="form-control"
                placeholder="Enter FACULTY123"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={loading || success}
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading || success}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <a 
            href="#" 
            className="auth-link"
            onClick={(e) => {
              e.preventDefault();
              navigate('login');
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
