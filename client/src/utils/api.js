const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('blog_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('blog_token', token);
  } else {
    localStorage.removeItem('blog_token');
  }
};

export const getAuthUser = () => {
  const user = localStorage.getItem('blog_user');
  return user ? JSON.parse(user) : null;
};

export const setAuthUser = (user) => {
  if (user) {
    localStorage.setItem('blog_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('blog_user');
  }
};

export const clearAuth = () => {
  localStorage.removeItem('blog_token');
  localStorage.removeItem('blog_user');
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  let body = options.body;
  if (body && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });
  
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { detail: 'An error occurred on the server.' };
    }
    const errorMessage = errorData.detail || `Request failed with status ${response.status}`;
    const error = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    error.status = response.status;
    throw error;
  }
  
  // Return null for 204 No Content
  if (response.status === 204) return null;
  
  try {
    return await response.json();
  } catch (e) {
    return null;
  }
};
