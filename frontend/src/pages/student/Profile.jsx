import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Phone, MapPin, Mail, Award, Key, Save, Edit2, ShieldAlert } from 'lucide-react';
import { getProfilePictureUrl } from '../../services/api.js';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || user?.studentInfo?.address || '');
  const [parentName, setParentName] = useState(user?.studentInfo?.parentName || '');
  const [parentPhone, setParentPhone] = useState(user?.studentInfo?.parentPhone || '');
  const [parentEmail, setParentEmail] = useState(user?.studentInfo?.parentEmail || '');
  const [bloodGroup, setBloodGroup] = useState(user?.studentInfo?.bloodGroup || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(user?.studentInfo?.aadhaarNumber || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || '');

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
      
      formData.append('studentInfo', JSON.stringify({
        parentName,
        parentPhone,
        parentEmail,
        bloodGroup,
        aadhaarNumber,
        address
      }));

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
          <h2>Student Profile Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your personal records, parents detail, and address settings.</p>
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
              style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
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
            {isEditing ? (
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  style={{ fontSize: '1.25rem', fontWeight: '700', padding: '6px 12px', width: '100%', maxWidth: '300px' }}
                />
              </div>
            ) : (
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{name}</h3>
            )}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              Student / Class Grade {user?.studentInfo?.classId?.name || 'Unassigned'}
            </span>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Roll Number: <strong>{user?.studentInfo?.rollNumber || 'N/A'}</strong></span>
              <span>Section: <strong>{user?.studentInfo?.section || 'A'}</strong></span>
              <span>Category: <strong style={{ textTransform: 'uppercase' }}>{user?.studentInfo?.category || 'OPEN'}</strong></span>
            </div>
          </div>
        </div>

        {/* Section Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Left Column: Personal details */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <User size={18} color="var(--primary)" />
              <span>Contact & Address Info</span>
            </h4>

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

          {/* Right Column: Family details & Identity */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <Award size={18} color="var(--secondary)" />
              <span>Parents Info & Medical Details</span>
            </h4>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Parent / Guardian Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="form-control" 
                  value={parentName} 
                  onChange={(e) => setParentName(e.target.value)} 
                  required
                />
              ) : (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <strong>{parentName || 'Not Provided'}</strong>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Parent Contact Number</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="form-control" 
                  value={parentPhone} 
                  onChange={(e) => setParentPhone(e.target.value)} 
                  required
                />
              ) : (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <span>{parentPhone || 'Not Provided'}</span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Parent Email Address</label>
              {isEditing ? (
                <input 
                  type="email" 
                  className="form-control" 
                  value={parentEmail} 
                  onChange={(e) => setParentEmail(e.target.value)} 
                  required
                />
              ) : (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <span>{parentEmail || 'Not Provided'}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Blood Group</label>
                {isEditing ? (
                  <select 
                    className="form-control" 
                    value={bloodGroup} 
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                ) : (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.9rem', textAlign: 'center' }}>
                    <strong>{bloodGroup || 'N/A'}</strong>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Aadhaar Number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="form-control" 
                    value={aadhaarNumber} 
                    onChange={(e) => setAadhaarNumber(e.target.value)} 
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                  />
                ) : (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.9rem', textAlign: 'center' }}>
                    <span>{aadhaarNumber || 'N/A'}</span>
                  </div>
                )}
              </div>
            </div>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Leave blank to keep current password"
                  style={{ flexGrow: 1 }}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '0 12px', height: '42px', minWidth: '70px', fontSize: '0.8rem' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
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
              setAddress(user?.address || user?.studentInfo?.address || '');
              setParentName(user?.studentInfo?.parentName || '');
              setParentPhone(user?.studentInfo?.parentPhone || '');
              setParentEmail(user?.studentInfo?.parentEmail || '');
              setBloodGroup(user?.studentInfo?.bloodGroup || '');
              setAadhaarNumber(user?.studentInfo?.aadhaarNumber || '');
              setSelectedFile(null);
              setPreviewUrl(user?.profilePicture || '');
              setPassword('');
              setShowPassword(false);
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
