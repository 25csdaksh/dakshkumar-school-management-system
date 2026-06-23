import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  // Load user and theme from localStorage on start
  useEffect(() => {
    const cachedUser = authService.getCurrentUser();
    let savedTheme = localStorage.getItem('theme') || 'light';
    if (cachedUser) {
      setUser(cachedUser);
      if (savedTheme === 'light') {
        if (cachedUser.role === 'parent') {
          savedTheme = 'parent-light';
        } else if (cachedUser.role === 'teacher') {
          savedTheme = 'teacher-light';
        } else if (cachedUser.role === 'student') {
          savedTheme = 'student-light';
        }
      }
    }
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data);
      let currentTheme = localStorage.getItem('theme') || 'light';
      if (currentTheme === 'light') {
        if (data.role === 'parent') {
          currentTheme = 'parent-light';
        } else if (data.role === 'teacher') {
          currentTheme = 'teacher-light';
        } else if (data.role === 'student') {
          currentTheme = 'student-light';
        }
      }
      setTheme(currentTheme);
      document.documentElement.setAttribute('data-theme', currentTheme);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData) => {
    setLoading(true);
    try {
      const data = await authService.register(registerData);
      setUser(data);
      let currentTheme = localStorage.getItem('theme') || 'light';
      if (currentTheme === 'light') {
        if (data.role === 'parent') {
          currentTheme = 'parent-light';
        } else if (data.role === 'teacher') {
          currentTheme = 'teacher-light';
        } else if (data.role === 'student') {
          currentTheme = 'student-light';
        }
      }
      setTheme(currentTheme);
      document.documentElement.setAttribute('data-theme', currentTheme);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    // Reset to default light theme on logout
    setTheme('light');
    document.documentElement.setAttribute('data-theme', 'light');
  };

  const updateProfile = async (formData) => {
    try {
      const data = await authService.updateProfile(formData);
      setUser(data);
      let currentTheme = localStorage.getItem('theme') || 'light';
      if (currentTheme === 'light') {
        if (data.role === 'parent') {
          currentTheme = 'parent-light';
        } else if (data.role === 'teacher') {
          currentTheme = 'teacher-light';
        } else if (data.role === 'student') {
          currentTheme = 'student-light';
        }
      }
      setTheme(currentTheme);
      document.documentElement.setAttribute('data-theme', currentTheme);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const toggleTheme = () => {
    const isDark = theme === 'dark';
    let nextTheme = 'light';
    if (isDark) {
      if (user && user.role === 'parent') {
        nextTheme = 'parent-light';
      } else if (user && user.role === 'teacher') {
        nextTheme = 'teacher-light';
      } else if (user && user.role === 'student') {
        nextTheme = 'student-light';
      } else {
        nextTheme = 'light';
      }
    } else {
      nextTheme = 'dark';
    }
    setTheme(nextTheme);
    localStorage.setItem('theme', (nextTheme === 'parent-light' || nextTheme === 'teacher-light' || nextTheme === 'student-light') ? 'light' : nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const value = {
    user,
    loading,
    theme,
    login,
    register,
    logout,
    updateProfile,
    toggleTheme
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
