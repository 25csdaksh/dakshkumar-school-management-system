import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Calendar } from 'lucide-react';

export const Attendance = ({ studentId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const data = await studentService.getStudentAttendance(studentId);
        setRecords(data);
      } catch (err) {
        setError('Failed to fetch attendance logs.');
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [studentId]);

  const total = records.length;
  const present = records.filter(r => r.status === 'Present').length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 100;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Daily Attendance Log</h2>
        <p style={{ color: 'var(--text-muted)' }}>Chronological record of daily class presence.</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', height: '40vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Retrieving attendance logs...</h4>
        </div>
      ) : (
        <div>
          {/* Summary Banner */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '24px' }}>
            <div className="text-center">
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{total}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Classes Logged</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', height: '40px' }}></div>
            <div className="text-center">
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{present}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Days Present</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', height: '40px' }}></div>
            <div className="text-center">
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{pct}%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Overall Attendance Rate</div>
            </div>
          </div>

          <div className="glass-panel table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Logged Date</th>
                  <th>Status</th>
                  <th>Assigned Class</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center" style={{ color: 'var(--text-muted)', padding: '24px' }}>
                      No attendance logged yet.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color="var(--primary)" />
                          <span>{new Date(r.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          r.status === 'Present' ? 'badge-success' : 
                          r.status === 'Late' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{r.classId?.name || 'Class Room'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
