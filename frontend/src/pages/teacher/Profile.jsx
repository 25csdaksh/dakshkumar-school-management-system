import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Phone, MapPin, Mail, Award, Key, Save, Edit2, ShieldAlert, BookOpen } from 'lucide-react';
import { getProfilePictureUrl } from '../../services/api.js';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || user?.teacherInfo?.address || '');
  const [qualification, setQualification] = useState(user?.teacherInfo?.qualification || '');
  const [gender, setGender] = useState(user?.teacherInfo?.gender || '');
  const [bloodGroup, setBloodGroup] = useState(user?.teacherInfo?.bloodGroup || '');
  const [password, setPassword] = useState('');
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
      formData.append('phone', phone);
      formData.append('address', address);
      if (password) {
        formData.append('password', password);
      }
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }
      
      formData.append('teacherInfo', JSON.stringify({
        qualification,
        address,
        gender,
        bloodGroup
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
          <h2>Faculty Profile Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your personal details, academic qualifications, and credentials.</p>
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
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{user?.name}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              Faculty / {user?.teacherInfo?.designation || 'Lecturer'}
            </span>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Joining Date: <strong>{user?.teacherInfo?.joiningDate ? new Date(user?.teacherInfo?.joiningDate).toLocaleDateString() : 'N/A'}</strong></span>
              <span>Salary Grade: <strong>${user?.teacherInfo?.salary || '0'} / Mo</strong></span>
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

          {/* Right Column: Faculty credentials */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <BookOpen size={18} color="var(--secondary)" />
              <span>Academic Credentials</span>
            </h4>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Qualifications</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="form-control" 
                  value={qualification} 
                  onChange={(e) => setQualification(e.target.value)} 
                  placeholder="e.g. Master of Sciences, Ph.D."
                  required
                />
              ) : (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <strong>{qualification || 'Not Provided'}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gender</label>
                {isEditing ? (
                  <select 
                    className="form-control" 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.9rem', textAlign: 'center' }}>
                    <span>{gender || 'Not Provided'}</span>
                  </div>
                )}
              </div>

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
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subjects & Courses Assigned</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {user?.teacherInfo?.subjects && user?.teacherInfo?.subjects.length > 0 ? (
                  user.teacherInfo.subjects.map((sub, idx) => (
                    <span key={idx} className="badge badge-primary">{sub.name || 'Subject'}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No courses assigned yet.</span>
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
              setPhone(user?.phone || '');
              setAddress(user?.address || user?.teacherInfo?.address || '');
              setQualification(user?.teacherInfo?.qualification || '');
              setGender(user?.teacherInfo?.gender || '');
              setBloodGroup(user?.teacherInfo?.bloodGroup || '');
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
