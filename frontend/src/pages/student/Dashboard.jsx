import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { 
  ClipboardList, 
  CreditCard, 
  Award, 
  Megaphone,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const Dashboard = ({ studentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const payload = await studentService.getStudentDashboard(studentId);
        setData(payload);
      } catch (err) {
        setError(err.message || 'Failed to fetch student dashboard records.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [studentId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Syncing Student Dashboard...</h3>
      </div>
    );
  }

  const { student, stats, grades, fees, notices } = data || {};
  const unpaidInvoices = fees?.filter(f => f.status !== 'Paid') || [];

  // Attendance ring constants
  const pct = stats?.attendancePercentage ?? 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Academic Portal</h2>
        <p style={{ color: 'var(--text-muted)' }}>Student profile: {student?.name} (Roll: {student?.studentInfo?.rollNumber || '-'})</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Main Student Hub Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        
        {/* Profile Details */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src={student?.profilePicture} 
            alt="Profile" 
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
          />
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>{student?.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Class: <strong>{student?.studentInfo?.classId?.name || 'Unassigned'}</strong>
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Roll Number: {student?.studentInfo?.rollNumber || '-'}</p>
          </div>
        </div>

        {/* Attendance progress ring */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="circle-progress-container">
            <svg width="100" height="100" className="circle-progress-svg">
              <circle cx="50" cy="50" r={radius} className="circle-progress-bg" strokeWidth="8" />
              <circle 
                cx="50" 
                cy="50" 
                r={radius} 
                className="circle-progress-fill" 
                strokeWidth="8" 
                strokeDashoffset={offset}
                stroke="var(--success)"
              />
            </svg>
            <div className="circle-progress-text" style={{ color: 'var(--success)' }}>{pct}%</div>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Class Attendance</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Present: {stats?.presentDays || 0} / {stats?.totalDays || 0} days
            </p>
          </div>
        </div>

        {/* Due fees reminder */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="stat-icon-wrapper danger">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: unpaidInvoices.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {unpaidInvoices.length} Due
            </div>
            <div className="stat-label">Pending Invoices</div>
          </div>
        </div>

      </div>

      <div className="dashboard-grid-2" style={{ marginTop: '24px' }}>
        
        {/* Grades summary */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Award size={20} color="var(--primary)" />
            <span>Latest Exam Grades</span>
          </h3>

          {grades?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No exam results logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {grades?.map((g) => {
                const percentage = Math.round((g.marksObtained / g.maxMarks) * 100);
                return (
                  <div key={g._id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'var(--bg-app)',
                    padding: '12px 16px',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{g.subjectName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{g.examName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.85rem' }}>{g.marksObtained}/{g.maxMarks}</span>
                      <span className={`badge ${
                        percentage >= 85 ? 'badge-success' : 
                        percentage >= 60 ? 'badge-primary' : 'badge-danger'
                      }`}>{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notices Board */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Megaphone size={20} color="var(--warning)" />
            <span>Notices Board</span>
          </h3>

          {notices?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notices published.</p>
          ) : (
            <div className="notice-list">
              {notices?.map((n) => (
                <div key={n._id} className="notice-card" style={{ background: 'var(--bg-app)', padding: '12px 16px', borderLeft: '4px solid var(--primary)' }}>
                  <div className="notice-header">
                    <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{n.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
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
