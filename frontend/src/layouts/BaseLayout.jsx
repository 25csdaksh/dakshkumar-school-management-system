import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CheckSquare,
  CreditCard,
  Award,
  Megaphone,
  FileBarChart,
  BookOpen,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  FileText,
  Settings,
  Building,
  Package,
  Navigation
} from 'lucide-react';

export const BaseLayout = ({ children, menuItems }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'dashboard': return <LayoutDashboard size={20} />;
      case 'students': return <GraduationCap size={20} />;
      case 'teachers': return <Users size={20} />;
      case 'classes': return <BookOpen size={20} />;
      case 'attendance': return <CheckSquare size={20} />;
      case 'fees': return <CreditCard size={20} />;
      case 'exams': return <Award size={20} />;
      case 'notices': return <Megaphone size={20} />;
      case 'reports': return <FileBarChart size={20} />;
      case 'homework': return <BookOpen size={20} />;
      case 'settings': return <Settings size={20} />;
      case 'library': return <BookOpen size={20} />;
      case 'hostel': return <Building size={20} />;
      case 'inventory': return <Package size={20} />;
      case 'bus-tracking': return <Navigation size={20} />;
      default: return <FileText size={20} />;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Hamburger toggle */}
      <button 
        className="theme-toggle" 
        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, display: 'none' }} // fallback custom trigger
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Layout */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        '@media (maxWidth: 768px)': {
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          position: 'fixed'
        }
      }}>
        <div className="sidebar-logo">
          <div style={{
            background: 'var(--primary)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>S</div>
          <span className="logo-text">EduSphere ERP</span>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                <Link to={item.path} onClick={() => setSidebarOpen(false)}>
                  {getIcon(item.icon)}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <button 
            className="btn btn-secondary w-full" 
            onClick={handleLogout}
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <header className="top-navbar">
          {/* Hamburger display on mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="theme-toggle" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'flex' }}
            >
              <Menu size={20} />
            </button>
            <div className="page-title">
              <h1>School ERP Portal</h1>
            </div>
          </div>

          <div className="nav-actions">
            {/* Theme Toggle Button */}
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Profile Avatar Summary */}
            <div className="user-profile-summary">
              <img 
                src={user?.profilePicture || 'http://localhost:5001/uploads/avatar.png'} 
                alt="Profile" 
                className="user-avatar"
              />
              <div className="user-details" style={{ display: 'none' }}>
                <span className="user-name">{user?.name || 'Loading...'}</span>
                <span className="user-role">{user?.role || ''}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
