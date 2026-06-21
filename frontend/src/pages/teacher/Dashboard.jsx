import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { BookOpen, Megaphone, Calendar } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classes = await studentService.getTeacherClasses();
        setAssignedClasses(classes);
        const noticeData = await studentService.getNotices();
        setNotices(noticeData.filter(n => n.targetAudience === 'All' || n.targetAudience === 'Teachers'));
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Loading Teacher Workspace...</h3>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Welcome back, {user?.name}!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Here is a summary of your assigned classes and active bulletins.</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="dashboard-grid-2">
        {/* Classes Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BookOpen size={20} color="var(--primary)" />
            <span>My Assigned Classes</span>
          </h3>

          {assignedClasses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You are not assigned to any classes as class teacher or subject teacher.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assignedClasses.map((c) => (
                <div key={c._id} style={{ 
                  padding: '16px', 
                  background: 'var(--bg-app)', 
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem' }}>{c.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Subjects: {c.subjects.filter(s => s.teacher === user?._id || s.teacher?._id === user?._id).map(s => s.name).join(', ')}
                    </span>
                  </div>
                  <span className="badge badge-primary">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notices Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Megaphone size={20} color="var(--warning)" />
            <span>Staff Bulletins</span>
          </h3>

          {notices.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No announcements matching your profile.</p>
          ) : (
            <div className="notice-list">
              {notices.map((n) => (
                <div key={n._id} className="notice-card" style={{ background: 'var(--bg-app)', padding: '16px', borderLeft: '4px solid var(--warning)' }}>
                  <div className="notice-header">
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{n.title}</span>
                    <span className="notice-meta">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="notice-content" style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-muted)' }}>{n.content}</p>
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
