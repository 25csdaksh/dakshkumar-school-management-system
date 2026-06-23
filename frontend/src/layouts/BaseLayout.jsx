import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/authService.js';
import { getProfilePictureUrl } from '../services/api.js';
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
  Navigation,
  Bell
} from 'lucide-react';

export const BaseLayout = ({ children, menuItems }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await authService.getNotifications();
        setNotifications(data);
        const lastRead = localStorage.getItem('lastReadNotifications') || 0;
        const newUnread = data.filter(n => new Date(n.createdAt).getTime() > Number(lastRead)).length;
        setUnreadCount(newUnread);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleToggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen) {
      setUnreadCount(0);
      localStorage.setItem('lastReadNotifications', Date.now().toString());
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHamburgerClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
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
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Layout */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <span className="logo-text">Shreejee Education</span>
          </div>
          <button 
            className="mobile-sidebar-close" 
            onClick={() => setSidebarOpen(false)}
            title="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-menu-wrapper" style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
          {(() => {
            const groupedMenu = {};
            menuItems.forEach((item) => {
              let cat = '';
              if (menuItems.length > 8) {
                const label = item.label.toLowerCase();
                if (label.includes('dashboard')) {
                  cat = 'Core Workspace';
                } else if (
                  label.includes('student') ||
                  label.includes('teacher') ||
                  label.includes('class') ||
                  label.includes('academic')
                ) {
                  cat = 'Core Modules';
                } else if (
                  label.includes('timetable') ||
                  label.includes('attendance') ||
                  label.includes('exam') ||
                  label.includes('result') ||
                  label.includes('homework')
                ) {
                  cat = 'Academic Hub';
                } else {
                  cat = 'System Admin';
                }
              } else {
                cat = 'Menu';
              }
              if (!groupedMenu[cat]) groupedMenu[cat] = [];
              groupedMenu[cat].push(item);
            });

            return Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category} className="menu-category-group" style={{ marginBottom: '16px' }}>
                {category !== 'Menu' && category !== 'Core Workspace' && (
                  <div className="menu-category-header" style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--sidebar-muted, var(--text-muted))',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    padding: '8px 16px 4px',
                    opacity: 0.8
                  }}>{category}</div>
                )}
                <ul className="sidebar-menu" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {items.map((item, index) => {
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
              </div>
            ));
          })()}
        </div>

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
              onClick={handleHamburgerClick}
              style={{ display: 'flex' }}
            >
              <Menu size={20} />
            </button>
            <div className="page-title">
              <h1>School ERP Portal</h1>
            </div>
          </div>

          <div className="nav-actions">
            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button className="theme-toggle" onClick={handleToggleNotifications} title="Notifications">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    background: 'var(--danger)',
                    borderRadius: '50%',
                    boxShadow: '0 0 4px var(--danger)'
                  }} />
                )}
              </button>

              {notificationsOpen && (
                <div className="glass-panel" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '12px',
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Announcements</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notifications.length} total</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No announcements at this time.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.map((n) => (
                        <div key={n._id} style={{
                          padding: '10px',
                          background: 'var(--bg-app)',
                          borderRadius: '8px',
                          borderLeft: '3px solid var(--primary)',
                          fontSize: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <strong style={{ color: 'var(--text-main)' }}>{n.title}</strong>
                          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>{n.content}</p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'flex-end', marginTop: '2px' }}>
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme !== 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Profile Avatar Summary */}
            <div className="user-profile-summary">
              <img 
                src={getProfilePictureUrl(user?.profilePicture)} 
                alt="Profile" 
                className="user-avatar"
              />
              <div className="user-details">
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
