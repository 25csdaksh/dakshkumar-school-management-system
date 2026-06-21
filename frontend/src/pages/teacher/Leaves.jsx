import React, { useState, useEffect } from 'react';
import teacherService from '../../services/teacherService.js';
import { CalendarDays, FileText, CheckCircle, Clock } from 'lucide-react';

export const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Apply Leave form states
  const [newLeave, setNewLeave] = useState({ type: 'Casual', startDate: '', endDate: '', reason: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const data = await teacherService.getMyLeaves();
      setLeaves(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve leave logs');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      await teacherService.applyLeave(newLeave);
      setMessage('Leave application submitted successfully!');
      setNewLeave({ type: 'Casual', startDate: '', endDate: '', reason: '' });
      loadLeaves();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center mt-4"><h3>Loading Leaves Portal...</h3></div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Leave Application Center</h2>
        <p style={{ color: 'var(--text-muted)' }}>Apply for casual or medical leave and review historical logs.</p>
      </div>

      {message && <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}
      {error && <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Application Form */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--primary)" />
            <span>Apply For Leave</span>
          </h3>

          <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select 
                className="form-control"
                value={newLeave.type}
                onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
              >
                <option value="Casual">Casual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Maternity">Maternity Leave</option>
                <option value="Paternity">Paternity Leave</option>
                <option value="Loss of Pay">Loss of Pay (LOP)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input 
                type="date" 
                className="form-control"
                value={newLeave.startDate}
                onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input 
                type="date" 
                className="form-control"
                value={newLeave.endDate}
                onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Leave</label>
              <textarea 
                rows="3" 
                placeholder="Brief reason explaining leave requirements..."
                className="form-control"
                value={newLeave.reason}
                onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </form>
        </div>

        {/* Historical requests list */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={20} color="var(--secondary)" />
            <span>Leave Request History</span>
          </h3>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center" style={{ color: 'var(--text-muted)' }}>
                      No leave requests filed yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td><strong>{leave.type}</strong></td>
                      <td>
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td>{leave.reason}</td>
                      <td>
                        {leave.status === 'Approved' && <span className="badge badge-success">Approved</span>}
                        {leave.status === 'Pending' && <span className="badge badge-warning">Pending</span>}
                        {leave.status === 'Rejected' && <span className="badge badge-danger">Rejected</span>}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {leave.comments || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Leaves;
