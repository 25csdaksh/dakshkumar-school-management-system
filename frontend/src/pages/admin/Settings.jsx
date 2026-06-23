import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiCall, getProfilePictureUrl } from '../../services/api.js';
import { Save, Camera, Moon, Sun, Printer, Mail, Phone, X, Shield, History } from 'lucide-react';

export const Settings = () => {
  const { user, updateProfile, theme, toggleTheme } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.profilePicture || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ID Card State
  const [showIdCard, setShowIdCard] = useState(false);

  // Security Audit Logs
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchLogs = async () => {
        try {
          const data = await apiCall('/admin/activity-logs');
          setLogs(data);
        } catch (err) {
          console.error('Failed to retrieve audit logs', err);
        } finally {
          setLoadingLogs(false);
        }
      };
      fetchLogs();
    }
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
 
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    if (password) {
      formData.append('password', password);
    }
    if (file) {
      formData.append('profilePicture', file);
    }

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully.');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate ID Card SVG Barcode
  const BarcodeSVG = () => (
    <svg width="200" height="40" viewBox="0 0 200 40" style={{ display: 'block', margin: '0 auto', color: 'var(--text-main)' }}>
      <rect x="10" y="5" width="2" height="30" fill="currentColor" />
      <rect x="15" y="5" width="4" height="30" fill="currentColor" />
      <rect x="22" y="5" width="1" height="30" fill="currentColor" />
      <rect x="25" y="5" width="3" height="30" fill="currentColor" />
      <rect x="30" y="5" width="1" height="30" fill="currentColor" />
      <rect x="34" y="5" width="4" height="30" fill="currentColor" />
      <rect x="40" y="5" width="2" height="30" fill="currentColor" />
      <rect x="44" y="5" width="2" height="30" fill="currentColor" />
      <rect x="50" y="5" width="1" height="30" fill="currentColor" />
      <rect x="55" y="5" width="4" height="30" fill="currentColor" />
      <rect x="62" y="5" width="1" height="30" fill="currentColor" />
      <rect x="65" y="5" width="3" height="30" fill="currentColor" />
      <rect x="70" y="5" width="1" height="30" fill="currentColor" />
      <rect x="74" y="5" width="4" height="30" fill="currentColor" />
      <rect x="80" y="5" width="2" height="30" fill="currentColor" />
      <rect x="85" y="5" width="3" height="30" fill="currentColor" />
      <rect x="90" y="5" width="1" height="30" fill="currentColor" />
      <rect x="94" y="5" width="4" height="30" fill="currentColor" />
      <rect x="100" y="5" width="2" height="30" fill="currentColor" />
      <rect x="105" y="5" width="4" height="30" fill="currentColor" />
      <rect x="112" y="5" width="1" height="30" fill="currentColor" />
      <rect x="115" y="5" width="3" height="30" fill="currentColor" />
      <rect x="120" y="5" width="1" height="30" fill="currentColor" />
      <rect x="124" y="5" width="4" height="30" fill="currentColor" />
      <rect x="130" y="5" width="2" height="30" fill="currentColor" />
      <rect x="134" y="5" width="2" height="30" fill="currentColor" />
      <rect x="140" y="5" width="1" height="30" fill="currentColor" />
      <rect x="145" y="5" width="4" height="30" fill="currentColor" />
      <rect x="152" y="5" width="1" height="30" fill="currentColor" />
      <rect x="155" y="5" width="3" height="30" fill="currentColor" />
      <rect x="160" y="5" width="2" height="30" fill="currentColor" />
      <rect x="165" y="5" width="4" height="30" fill="currentColor" />
      <rect x="172" y="5" width="2" height="30" fill="currentColor" />
      <rect x="178" y="5" width="1" height="30" fill="currentColor" />
      <rect x="182" y="5" width="3" height="30" fill="currentColor" />
      <rect x="188" y="5" width="2" height="30" fill="currentColor" />
    </svg>
  );

  return (
    <div>
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide all page content except the printable ID card wrapper */
          body > #root {
            display: none !important;
          }
          #print-id-card-stage {
            display: block !important;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white !important;
            z-index: 99999;
          }
        }
      `}</style>

      <div style={{ marginBottom: '32px' }}>
        <h2>System & Profile Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Configure login details, dashboard themes, and upload avatar profiles.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Left Side Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Theme Preferences */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Interface Theme</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Choose how you want the School ERP Dashboard to look on your device.
            </p>

            <button className="btn btn-secondary w-full" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span>Switch to {theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          {/* ID Card Generator Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Digital ID Badge</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Generate a high-resolution print-optimized identification badge.
            </p>
            <button className="btn btn-primary w-full" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))' }} onClick={() => setShowIdCard(true)}>
              <Shield size={18} />
              <span>Generate ID Card</span>
            </button>
          </div>
        </div>

        {/* Right Card: Profile Form */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Edit Personal Profiles</h3>

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

          <form onSubmit={handleSubmit}>
            {/* Profile image with camera upload overlay */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <img 
                  src={getProfilePictureUrl(preview)} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                />
                <label htmlFor="file-input" style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--primary)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  <Camera size={16} />
                </label>
                <input 
                  type="file" 
                  id="file-input" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept="image/*" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Phone Contact</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Change Password (Optional)</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Leave blank to keep current"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
              <Save size={18} />
              <span>{loading ? 'Saving details...' : 'Save Settings'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* ID Card Modal (Rendered on UI) */}
      {showIdCard && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)' }}>
            
            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="print-hidden">
              <h4 style={{ margin: 0 }}>Identity Badge Preview</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handlePrint} className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  <Printer size={14} /> Print Card
                </button>
                <button onClick={() => setShowIdCard(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Render ID Card Card Layout */}
            <div id="print-id-card-stage" style={{ background: 'white' }}>
              <div style={{
                width: '320px',
                height: '480px',
                border: '2px solid #1e293b',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#f8fafc',
                color: '#0f172a',
                fontFamily: 'sans-serif',
                display: 'flex',
                flexDirection: 'column',
                margin: '0 auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                {/* Header Strip */}
                <div style={{
                  background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                  padding: '20px 16px',
                  color: 'white',
                  textAlign: 'center',
                  borderBottom: '4px solid #f59e0b'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.5px', color: '#fff' }}>DAKSHKUMAR ACADEMY</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.7rem', opacity: '0.9', letterSpacing: '1px', textTransform: 'uppercase', color: '#fff' }}>School ERP Network</p>
                </div>

                {/* Body Details */}
                <div style={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px 20px',
                  justifyContent: 'space-between'
                }}>
                  {/* Photo Profile */}
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={getProfilePictureUrl(user?.profilePicture)} 
                      alt={user?.name} 
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #1e3a8a',
                        background: '#e2e8f0'
                      }}
                    />
                  </div>

                  {/* Name and Designation */}
                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <h2 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: '700', color: '#1e3a8a' }}>{user?.name?.toUpperCase()}</h2>
                    <span style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>{user?.role}</span>
                  </div>

                  {/* Detailed specs */}
                  <div style={{ width: '100%', margin: '16px 0', fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                      <strong>ID Card No:</strong>
                      <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>DK-2026-{user?._id?.slice(-5).toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                      <strong>Email:</strong>
                      <span>{user?.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                      <strong>Phone:</strong>
                      <span>{user?.phone || 'Not Registered'}</span>
                    </div>
                  </div>

                  {/* Barcode SVG */}
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    <BarcodeSVG />
                    <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace', display: 'block', marginTop: '2px' }}>
                      {user?._id?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Footer warning */}
                <div style={{
                  background: '#1e293b',
                  color: '#94a3b8',
                  fontSize: '0.6rem',
                  padding: '8px 12px',
                  textAlign: 'center',
                  lineHeight: '1.3'
                }}>
                  If found, please return to Dakshkumar Academy, Main Campus. ID is non-transferable.
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Security Audit Activity Logs (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="glass-panel" style={{ padding: '32px', marginTop: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: 'var(--primary)' }} />
            Security Audit Activity Logs (MongoDB)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Real-time tracking of login actions, failed attempts, and public sign-ups stored on Atlas.
          </p>

          {loadingLogs ? (
            <div style={{ display: 'flex', padding: '24px', justifyContent: 'center' }}>
              <span>Loading audit logs from MongoDB...</span>
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Email Address</th>
                    <th>Action / Status</th>
                    <th>IP Address</th>
                    <th>User Agent / Device</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center" style={{ padding: '16px', color: 'var(--text-muted)' }}>
                        No logs captured yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id}>
                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                        <td><strong>{log.email}</strong></td>
                        <td>
                          <span className={`badge ${
                            log.action === 'Login Success' ? 'badge-success' : 
                            log.action === 'Signup' ? 'badge-primary' : 'badge-danger'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace' }}>{log.ipAddress || '127.0.0.1'}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.userAgent}>
                          {log.userAgent || 'Unknown System'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;
