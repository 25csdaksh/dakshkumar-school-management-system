import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { studentService } from '../../services/studentService.js';
import { User, Phone, MapPin, Mail, Award, Key, Save, Edit2, ShieldAlert, GraduationCap } from 'lucide-react';
import { getProfilePictureUrl } from '../../services/api.js';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [children, setChildren] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [password, setPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || '');

  // Fetch children accounts on load
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const list = await studentService.getParentChildren();
        setChildren(list);
      } catch (err) {
        console.error('Failed to load linked children accounts', err);
      } finally {
        setChildrenLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('address', address);
      if (password) {
        formData.append('password', password);
      }
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Parent Profile Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure your contact details and review your registered student child accounts.</p>
        </div>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--danger)' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--success)' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Header Card */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={getProfilePictureUrl(previewUrl)} 
              alt="Profile" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            />
            {isEditing && (
              <label style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: 'var(--primary)',
                color: 'white',
                padding: '6px',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Edit2 size={14} />
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          <div style={{ flexGrow: 1 }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>{user?.name}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Registered Parent User
            </span>
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Linked Children Accounts: <strong>{children.length}</strong>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Left Panel: Contact Profile */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <User size={18} color="var(--primary)" />
              <span>Personal Details</span>
            </h4>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                />
              ) : (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <span>{name}</span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <Phone size={16} />
                  <span>{phone || 'Not Provided'}</span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Home Address</label>
              {isEditing ? (
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Enter complete residential address"
                  required
                  style={{ resize: 'none' }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.9rem', minHeight: '80px' }}>
                  <MapPin size={16} style={{ marginTop: '3px' }} />
                  <span>{address || 'Not Provided'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Linked Children Accounts */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <GraduationCap size={18} color="var(--secondary)" />
              <span>Linked Children Profiles</span>
            </h4>

            {childrenLoading ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Searching database...</span>
            ) : children.length === 0 ? (
              <div style={{ background: 'var(--warning-glow)', color: 'var(--warning)', padding: '16px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid var(--warning)' }}>
                No students are currently linked to your email address: <strong>{user?.email}</strong>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {children.map((child) => (
                  <div 
                    key={child._id} 
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)', 
                      background: 'var(--bg-app)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700'
                    }}>
                      {child.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{child.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Grade: {child.studentInfo?.classId?.name || 'Class'} | Roll: {child.studentInfo?.rollNumber}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Change password area (only in edit mode) */}
        {isEditing && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <Key size={18} color="var(--primary)" />
              <span>Change Account Password (Optional)</span>
            </h4>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>
        )}

        {/* Save/Cancel Action panel */}
        {isEditing && (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => {
              setIsEditing(false);
              setName(user?.name || '');
              setPhone(user?.phone || '');
              setAddress(user?.address || '');
              setSelectedFile(null);
              setPreviewUrl(user?.profilePicture || '');
            }} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Saving Records...' : 'Save Profile'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
