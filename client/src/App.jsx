import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CreateEditPost from './pages/CreateEditPost';
import Login from './pages/Login';
import Register from './pages/Register';
import { getAuthUser, clearAuth, apiRequest } from './utils/api';

function App() {
  const [user, setUser] = useState(getAuthUser());
  const [route, setRoute] = useState({ name: 'home', params: {} });

  useEffect(() => {
    // Validate current session against the server on launch
    const validateSession = async () => {
      if (user) {
        try {
          const freshUser = await apiRequest('/auth/me');
          setUser(freshUser);
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          handleLogout();
        }
      }
    };
    validateSession();
  }, []);

  const navigate = (routeName, params = {}) => {
    setRoute({ name: routeName, params });
    // Smooth scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    navigate('home');
  };

  // Simple SPA Routing Switch
  const renderPage = () => {
    switch (route.name) {
      case 'home':
        return <Home navigate={navigate} user={user} />;
      case 'detail':
        return <PostDetail postId={route.params.postId} user={user} navigate={navigate} />;
      case 'create':
        return <CreateEditPost user={user} navigate={navigate} />;
      case 'edit':
        return <CreateEditPost postId={route.params.postId} user={user} navigate={navigate} />;
      case 'login':
        return <Login navigate={navigate} onLoginSuccess={setUser} />;
      case 'register':
        return <Register navigate={navigate} />;
      default:
        return <Home navigate={navigate} user={user} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        user={user} 
        navigate={navigate} 
        currentRouteName={route.name} 
        onLogout={handleLogout} 
      />
      
      <main className="main-content">
        {renderPage()}
      </main>

      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem 1.5rem', 
        fontSize: '0.9rem', 
        color: 'var(--text-dim)',
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto'
      }}>
        <p>© 2026 RSR Feedback. Built with Python (FastAPI), SQLite, and React.</p>
      </footer>
    </div>
  );
}

export default App;
