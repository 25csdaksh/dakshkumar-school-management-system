const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const headers = getHeaders();

  // If body is FormData (e.g. for file upload), let the browser set the boundary headers automatically
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle token expiration or unauthorized access
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

export const getProfilePictureUrl = (path) => {
  const backendUrl = API_URL.replace('/api', '');
  if (!path) return `${backendUrl}/uploads/avatar.png`;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  return `${backendUrl}${path}`;
};
