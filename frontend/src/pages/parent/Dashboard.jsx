import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import StudentDashboard from '../student/Dashboard.jsx';
import { Users, GraduationCap } from 'lucide-react';

export const Dashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const childrenList = await studentService.getParentChildren();
        setChildren(childrenList);
        if (childrenList.length > 0) {
          setSelectedChildId(childrenList[0]._id);
        }
      } catch (err) {
        setError('Failed to fetch linked children accounts.');
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Syncing Parents Panel...</h3>
      </div>
    );
  }

  const selectedChild = children.find(c => c._id === selectedChildId);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Parents Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Overview of linked children registries and grades reports.</p>
        </div>
        
        {children.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Select Child:</span>
            <select 
              className="form-control" 
              style={{ width: '200px' }}
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
            >
              {children.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {children.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
          No student profiles are currently linked to your parent email. Please request the school admin to assign your email address in their Student Info profiles.
        </div>
      ) : (
        /* Reuse the Student Dashboard directly but with the child studentId passed! */
        <StudentDashboard studentId={selectedChildId} />
      )}
    </div>
  );
};

export default Dashboard;
