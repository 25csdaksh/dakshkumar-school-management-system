import React, { useState, useEffect } from 'react';
import teacherService from '../../services/teacherService.js';
import { CalendarDays, ShieldCheck, Check, X } from 'lucide-react';

export const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const data = await teacherService.getAllLeaves();
      setLeaves(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve leave logs');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      setMessage('');
      setError('');
      await teacherService.reviewLeave(id, { status, comments });
      setMessage(`Leave request marked as ${status}`);
      setReviewingId(null);
      setComments('');
      loadLeaves();
    } catch (err) {
      setError(err.message || 'Failed to save review outcome');
    }
  };

  if (loading) return <div className="text-center mt-4"><h3>Loading Leaves Review Console...</h3></div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Faculty Leaves Manager</h2>
        <p style={{ color: 'var(--text-muted)' }}>Review and authorize pending leave requests submitted by teaching staff.</p>
      </div>

      {message && <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}
      {error && <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarDays size={20} color="var(--primary)" />
          <span>Faculty Leave Application Registry</span>
        </h3>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Approver Review</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ color: 'var(--text-muted)' }}>
                    No faculty leaves listed in the system database.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <strong>{leave.applicant?.name || 'Faculty Member'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {leave.applicant?.email}
                      </div>
                    </td>
                    <td>{leave.type}</td>
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
                      {leave.status === 'Pending' ? (
                        reviewingId === leave._id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '240px' }}>
                            <input 
                              type="text" 
                              placeholder="Review comments..." 
                              className="form-control"
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }} onClick={() => handleReview(leave._id, 'Approved')}>
                                Approve
                              </button>
                              <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }} onClick={() => handleReview(leave._id, 'Rejected')}>
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button className="btn btn-secondary" onClick={() => { setReviewingId(leave._id); setComments(''); }}>
                            Review Request
                          </button>
                        )
                      ) : (
                        <div style={{ fontSize: '0.85rem' }}>
                          <strong>Reviewed by:</strong> {leave.approvedBy?.name || 'System Administrator'}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            "{leave.comments || 'No comment'}"
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaves;
