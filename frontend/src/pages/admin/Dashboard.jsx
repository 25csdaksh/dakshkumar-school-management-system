import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Megaphone, 
  DollarSign, 
  TrendingUp, 
  PlusCircle, 
  Clock 
} from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await studentService.getDashboardStats();
        setStats(data);
        const noticeData = await studentService.getNotices();
        setNotices(noticeData.slice(0, 3)); // Only top 3 announcements
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Loading Admin Panel Analytics...</h3>
      </div>
    );
  }

  const financials = stats?.financials || { totalInvoiced: 0, totalCollected: 0, totalPending: 0 };
  const collectionRate = financials.totalInvoiced > 0 
    ? Math.round((financials.totalCollected / financials.totalInvoiced) * 100) 
    : 0;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>System Insights</h2>
        <p style={{ color: 'var(--text-muted)' }}>Overview of student registry, teaching staff, and school operations.</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper primary">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.studentCount || 0}</div>
            <div className="stat-label">Registered Students</div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper secondary">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.teacherCount || 0}</div>
            <div className="stat-label">Faculty Members</div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper success">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.classCount || 0}</div>
            <div className="stat-label">Active Classes</div>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper warning">
            <Megaphone size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.noticeCount || 0}</div>
            <div className="stat-label">Announcements</div>
          </div>
        </div>
      </div>

      {/* Main Charts & Updates Grid */}
      <div className="dashboard-grid-2">
        
        {/* Collection Rates / Graph Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <DollarSign size={20} color="var(--primary)" />
            <span>Financial Collections</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Invoiced</span>
              <h4 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginTop: '4px' }}>${financials.totalInvoiced}</h4>
            </div>
            <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Collected</span>
              <h4 style={{ fontSize: '1.4rem', color: 'var(--success)', marginTop: '4px' }}>${financials.totalCollected}</h4>
            </div>
          </div>

          {/* Premium CSS Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'between', fontSize: '0.85rem' }}>
              <span>Collection Progress</span>
              <strong>{collectionRate}%</strong>
            </div>
            <div style={{ background: 'var(--border-color)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ 
                background: 'linear-gradient(to right, var(--primary), var(--secondary))', 
                width: `${collectionRate}%`, 
                height: '100%',
                borderRadius: '6px',
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }}></div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Pending Balance to be collected: ${financials.totalPending}
            </span>
          </div>
        </div>

        {/* Notices Board Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Megaphone size={20} color="var(--warning)" />
            <span>Recent Announcements</span>
          </h3>

          {notices.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px', textAlign: 'center' }}>
              No notices published yet.
            </div>
          ) : (
            <div className="notice-list">
              {notices.map((notice) => (
                <div key={notice._id} className="notice-card" style={{ background: 'var(--bg-app)', borderLeft: '4px solid var(--primary)', padding: '16px' }}>
                  <div className="notice-header">
                    <span className="notice-title" style={{ fontWeight: '600', fontSize: '0.95rem' }}>{notice.title}</span>
                    <span className="notice-meta">{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="notice-content" style={{ fontSize: '0.85rem', marginTop: '6px', color: 'var(--text-muted)' }}>{notice.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
