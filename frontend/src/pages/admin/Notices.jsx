import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Plus, Megaphone, Trash2, X } from 'lucide-react';

export const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('All');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const data = await studentService.getNotices();
      setNotices(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch notice board entries.');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await studentService.createNotice({ title, content, targetAudience });
      setSuccess('Notice posted successfully.');
      setShowModal(false);
      setTitle('');
      setContent('');
      setTargetAudience('All');
      fetchNotices();
    } catch (err) {
      setError(err.message || 'Failed to post notice.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await studentService.deleteNotice(id);
      setNotices(notices.filter(n => n._id !== id));
      setSuccess('Notice deleted.');
    } catch (err) {
      setError(err.message || 'Failed to delete notice.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>School Notice Board</h2>
          <p style={{ color: 'var(--text-muted)' }}>Publish bulletins, reminders, and alerts to teachers, students, and parents.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>New Notice</span>
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', height: '40vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Loading notices...</h4>
        </div>
      ) : (
        <div className="notice-list">
          {notices.length === 0 ? (
            <div className="glass-panel text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
              Notice board is empty. Click New Notice to broadcast.
            </div>
          ) : (
            notices.map((n) => (
              <div key={n._id} className="glass-panel notice-card" style={{ padding: '24px' }}>
                <div className="notice-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{n.title}</h3>
                    <span className="badge badge-primary">To: {n.targetAudience}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="notice-meta">{new Date(n.createdAt).toLocaleString()}</span>
                    <button 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                      onClick={() => handleDelete(n._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="notice-content" style={{ marginTop: '12px', fontSize: '0.95rem', lineHeight: '1.6' }}>{n.content}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Posted by: {n.createdBy?.name || 'Administrator'}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Posting Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Megaphone size={20} color="var(--primary)" />
              <span>Broadcast Announcement</span>
            </h3>

            <form onSubmit={handlePost}>
              <div className="form-group">
                <label className="form-label">Notice Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select 
                  className="form-control" 
                  value={targetAudience} 
                  onChange={(e) => setTargetAudience(e.target.value)}
                  required
                >
                  <option value="All">All Roles</option>
                  <option value="Teachers">Teachers Only</option>
                  <option value="Students">Students Only</option>
                  <option value="Parents">Parents Only</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message Content</label>
                <textarea 
                  className="form-control" 
                  rows="5"
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                Post Notice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
