import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Plus, Trash2, Edit, UserPlus, X } from 'lucide-react';
import { getProfilePictureUrl } from '../../services/api.js';

export const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [salary, setSalary] = useState('');
  const [subjects, setSubjects] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await studentService.getUsersByRole('teacher');
      setTeachers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch teachers.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTeacherId(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setQualification('');
    setSalary('');
    setSubjects('');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleOpenEditModal = (teacher) => {
    setEditingTeacherId(teacher._id);
    setName(teacher.name);
    setEmail(teacher.email);
    setPassword('********'); // Placeholder
    setPhone(teacher.phone || '');
    setQualification(teacher.teacherInfo?.qualification || '');
    setSalary(teacher.teacherInfo?.salary || '');
    setSubjects(teacher.teacherInfo?.subjects?.join(', ') || '');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const subjectList = subjects.split(',').map(s => s.trim()).filter(s => s !== '');

    const payload = {
      name,
      email,
      phone,
      teacherInfo: {
        qualification,
        salary: Number(salary) || 0,
        subjects: subjectList
      }
    };

    try {
      if (editingTeacherId) {
        // Edit flow
        await studentService.updateTeacher(editingTeacherId, payload);
        setSuccess('Teacher details updated successfully.');
      } else {
        // Add flow
        payload.password = password;
        payload.role = 'teacher';
        await studentService.createUser(payload);
        setSuccess('Teacher registered successfully.');
      }
      setShowModal(false);
      fetchTeachers();
    } catch (err) {
      setError(err.message || 'Failed to register teacher.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this teacher?')) return;
    try {
      await studentService.deleteUser(id);
      setTeachers(teachers.filter(t => t._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete teacher.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Faculty & Staff</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage teachers, profiles, qualifications, and salaries.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add Faculty</span>
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
          <h4>Loading faculty records...</h4>
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Qualification</th>
                <th>Assigned Subjects</th>
                <th>Email / Contact</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center" style={{ color: 'var(--text-muted)' }}>
                    No teachers registered.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td>
                      <img 
                        src={getProfilePictureUrl(teacher.profilePicture)} 
                        alt={teacher.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                        onError={(e) => { e.target.src = getProfilePictureUrl(); }}
                      />
                    </td>
                    <td><strong style={{ color: 'var(--text-main)' }}>{teacher.name}</strong></td>
                    <td>{teacher.teacherInfo?.qualification || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {teacher.teacherInfo?.subjects?.map((sub, idx) => (
                          <span key={idx} className="badge badge-primary">{sub}</span>
                        )) || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{teacher.email}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{teacher.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td>${teacher.teacherInfo?.salary || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
                          onClick={() => handleOpenEditModal(teacher)}
                          title="Edit Teacher"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                          onClick={() => handleDelete(teacher._id)}
                          title="Delete Faculty Account"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Registration/Edit Modal Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <UserPlus size={20} color="var(--primary)" />
              <span>{editingTeacherId ? 'Modify Faculty Details' : 'Register Faculty Member'}</span>
            </h3>

            <form onSubmit={handleRegister}>
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
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={!!editingTeacherId}
                    required={!editingTeacherId} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={qualification} 
                    onChange={(e) => setQualification(e.target.value)} 
                    placeholder="e.g. Master of Math"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Salary ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={salary} 
                    onChange={(e) => setSalary(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subjects (Comma Separated)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={subjects} 
                  onChange={(e) => setSubjects(e.target.value)} 
                  placeholder="Mathematics, Physics, Geometry"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                {editingTeacherId ? 'Save Changes' : 'Register Faculty Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
