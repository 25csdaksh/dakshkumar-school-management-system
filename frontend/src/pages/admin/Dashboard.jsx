import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

      {/* Quick Actions Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <PlusCircle size={20} color="var(--primary)" />
          <span>Quick Actions</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <button 
            onClick={() => navigate('/admin/students')} 
            className="glass-panel-interactive" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px', 
              padding: '16px', 
              background: 'var(--bg-app)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--border-color)',
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '0.95rem',
              borderRadius: '12px'
            }}
          >
            <PlusCircle size={18} color="var(--primary)" />
            <span>Add Student</span>
          </button>
          
          <button 
            onClick={() => navigate('/admin/teachers')} 
            className="glass-panel-interactive" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px', 
              padding: '16px', 
              background: 'var(--bg-app)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--border-color)',
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '0.95rem',
              borderRadius: '12px'
            }}
          >
            <PlusCircle size={18} color="var(--secondary)" />
            <span>Add Teacher</span>
          </button>

          <button 
            onClick={() => navigate('/admin/classes')} 
            className="glass-panel-interactive" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px', 
              padding: '16px', 
              background: 'var(--bg-app)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--border-color)',
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '0.95rem',
              borderRadius: '12px'
            }}
          >
            <PlusCircle size={18} color="var(--success)" />
            <span>Add Class</span>
          </button>

          <button 
            onClick={() => navigate('/admin/notices')} 
            className="glass-panel-interactive" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px', 
              padding: '16px', 
              background: 'var(--bg-app)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--border-color)',
              cursor: 'pointer', 
              fontWeight: '600',
              fontSize: '0.95rem',
              borderRadius: '12px'
            }}
          >
            <PlusCircle size={18} color="var(--warning)" />
            <span>Add Notice</span>
          </button>
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

          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
            {/* Circular Donut Chart */}
            <div style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: `conic-gradient(var(--success) 0% ${collectionRate}%, var(--danger) ${collectionRate}% 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Collection</span>
                <strong style={{ fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: '700', marginTop: '2px' }}>{collectionRate}%</strong>
              </div>
            </div>

            {/* Legend / Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, minWidth: '180px' }}>
              <div style={{ borderLeft: '4px solid var(--success)', paddingLeft: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Completed (Collected)</div>
                <h4 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginTop: '4px' }}>
                  ${financials.totalCollected} 
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 'normal' }}>
                    ({collectionRate}%)
                  </span>
                </h4>
              </div>

              <div style={{ borderLeft: '4px solid var(--danger)', paddingLeft: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Pending (Outstanding)</div>
                <h4 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginTop: '4px' }}>
                  ${financials.totalPending} 
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 'normal' }}>
                    ({100 - collectionRate}%)
                  </span>
                </h4>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Overall Invoiced: <strong>${financials.totalInvoiced}</strong>
              </div>
            </div>
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
