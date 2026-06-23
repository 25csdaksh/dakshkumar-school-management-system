import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Plus, Trash2, Edit, Contact, UserPlus, X, Upload } from 'lucide-react';
import { getProfilePictureUrl } from '../../services/api.js';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Form States
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classId, setClassId] = useState('');
  const [section, setSection] = useState('A');
  const [parentEmail, setParentEmail] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Import Excel States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importErrors, setImportErrors] = useState([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const studentData = await studentService.getUsersByRole('student');
      setStudents(studentData);
      const classData = await studentService.getClasses();
      setClasses(classData);
      if (classData.length > 0) {
        setClassId(classData[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStudentId(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRollNumber('');
    if (classes.length > 0) setClassId(classes[0]._id);
    setSection('A');
    setParentEmail('');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudentId(student._id);
    setName(student.name);
    setEmail(student.email);
    setPassword('********'); // Placeholder
    setPhone(student.phone || '');
    setRollNumber(student.studentInfo?.rollNumber || '');
    setClassId(student.studentInfo?.classId?._id || student.studentInfo?.classId || '');
    setSection(student.studentInfo?.section || 'A');
    setParentEmail(student.studentInfo?.parentEmail || '');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleOpenCard = (student) => {
    setSelectedStudent(student);
    setShowCardModal(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      email,
      phone,
      studentInfo: {
        rollNumber,
        classId,
        section,
        parentEmail
      }
    };

    try {
      if (editingStudentId) {
        // Edit flow
        await studentService.updateStudent(editingStudentId, payload);
        setSuccess('Student details updated successfully.');
      } else {
        // Add flow
        payload.password = password;
        payload.role = 'student';
        await studentService.createUser(payload);
        setSuccess('Student registered successfully.');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to process student request.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    try {
      await studentService.deleteUser(id);
      setStudents(students.filter(student => student._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete student.');
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;

    setImportLoading(true);
    setImportErrors([]);
    setImportSuccessMsg('');

    try {
      const result = await studentService.importStudents(importFile);
      
      if (result instanceof Blob) {
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_credentials.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        setImportSuccessMsg('Students imported successfully! Credentials sheet downloaded.');
      } else {
        setImportSuccessMsg(result.message || 'Import complete.');
      }
      
      fetchData(); // Refresh registry list
    } catch (err) {
      if (err.validationErrors && err.validationErrors.length > 0) {
        setImportErrors(err.validationErrors);
      } else {
        setImportErrors([err.message || 'Failed to import students. Please try again.']);
      }
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Student Registry</h2>
          <p style={{ color: 'var(--text-muted)' }}>Configure details, enrollments, and parent link profiles.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => {
            setImportFile(null);
            setImportErrors([]);
            setImportSuccessMsg('');
            setShowImportModal(true);
          }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} />
            <span>Import Excel</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        </div>
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
          <h4>Loading student records...</h4>
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Grade Class</th>
                <th>Email / Contact</th>
                <th>Parent Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center" style={{ color: 'var(--text-muted)' }}>
                    No students currently registered.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <img 
                        src={getProfilePictureUrl(student.profilePicture)} 
                        alt={student.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                        onError={(e) => { e.target.src = getProfilePictureUrl(); }}
                      />
                    </td>
                    <td><strong style={{ color: 'var(--text-main)' }}>{student.name}</strong></td>
                    <td>{student.studentInfo?.rollNumber || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="badge badge-primary">
                          {student.studentInfo?.classId?.name || 'Unassigned'}
                        </span>
                        {student.studentInfo?.section && (
                          <span className="badge badge-secondary">
                            Sec {student.studentInfo.section}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{student.email}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.phone || 'No phone'}</span>
                      </div>
                    </td>
                    <td>{student.studentInfo?.parentEmail || 'No parent email'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                          onClick={() => handleOpenCard(student)}
                          title="View Student ID Card"
                        >
                          <Contact size={18} />
                        </button>
                        <button 
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
                          onClick={() => handleOpenEditModal(student)}
                          title="Edit Student"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                          onClick={() => handleDelete(student._id)}
                          title="Delete Student"
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
              <span>{editingStudentId ? 'Modify Student Details' : 'Enroll New Student'}</span>
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
                    disabled={!!editingStudentId}
                    required={!editingStudentId} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={rollNumber} 
                    onChange={(e) => setRollNumber(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade Class</label>
                  <select 
                    className="form-control" 
                    value={classId} 
                    onChange={(e) => setClassId(e.target.value)}
                    required
                  >
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Division (Section)</label>
                  <select 
                    className="form-control" 
                    value={section} 
                    onChange={(e) => setSection(e.target.value)}
                    required
                  >
                    {(classes.find(c => c._id === classId)?.sections || ['A', 'B', 'C']).map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
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

              <div className="form-group">
                <label className="form-label">Parent Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={parentEmail} 
                  onChange={(e) => setParentEmail(e.target.value)} 
                  placeholder="parent@schoolerp.com"
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                {editingStudentId ? 'Save Changes' : 'Enroll Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ID Card Modal */}
      {showCardModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', padding: '0', overflow: 'hidden', borderRadius: '20px', border: '1px solid var(--primary-glow)' }}>
            
            {/* School ID Card Header */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', padding: '24px 20px', textAlignment: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', marginBottom: '8px' }}>
                S
              </div>
              <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem', letterSpacing: '1px' }}>Shreejee Education</h4>
              <span style={{ fontSize: '0.75rem', opacity: '0.8', textTransform: 'uppercase', marginTop: '2px' }}>Student Identity Card</span>
            </div>

            {/* Body */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px', background: 'var(--bg-card)' }}>
              <img 
                src={getProfilePictureUrl(selectedStudent.profilePicture)} 
                alt={selectedStudent.name} 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--border-color)', boxShadow: 'var(--shadow-md)', marginBottom: '16px' }}
                onError={(e) => { e.target.src = getProfilePictureUrl(); }}
              />

              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>{selectedStudent.name}</h3>
              <span className="badge badge-primary" style={{ marginBottom: '20px' }}>
                {(selectedStudent.studentInfo?.classId?.name || 'Grade Cohort') + (selectedStudent.studentInfo?.section ? ` - Sec ${selectedStudent.studentInfo.section}` : '')}
              </span>

              <div style={{ width: '100%', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Roll Number:</span>
                  <strong>{selectedStudent.studentInfo?.rollNumber || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email ID:</span>
                  <strong>{selectedStudent.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Contact No:</span>
                  <strong>{selectedStudent.phone || 'N/A'}</strong>
                </div>
              </div>

              {/* Mock Barcode */}
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: '0.6' }}>
                <div style={{ letterSpacing: '2px', fontFamily: 'monospace', fontSize: '1.3rem', color: 'var(--text-main)' }}>
                  ||||| | |||| | |||
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  ID: {selectedStudent._id.substring(0, 12).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px', background: 'var(--bg-app)', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }} onClick={() => setShowCardModal(false)}>
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <button className="modal-close" onClick={() => setShowImportModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Upload size={20} color="var(--primary)" />
              <span>Import Students from Excel</span>
            </h3>

            {/* Template Column details */}
            <div className="glass-panel" style={{
              background: 'var(--bg-app)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              marginBottom: '20px',
              border: '1px solid var(--border-color)'
            }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Excel Sheet Format Required:</strong>
              <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>
                Your spreadsheet must contain headers in the first row. The following columns are processed:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Student ID</strong> <span style={{ color: 'var(--danger)' }}>*</span> <span style={{ color: 'var(--text-muted)' }}>(Unique login ID, e.g. 2026001)</span></li>
                <li><strong>name</strong> <span style={{ color: 'var(--danger)' }}>*</span> <span style={{ color: 'var(--text-muted)' }}>(Student's full name)</span></li>
                <li><strong>class</strong> <span style={{ color: 'var(--danger)' }}>*</span> <span style={{ color: 'var(--text-muted)' }}>(e.g. 1, Grade 1)</span></li>
                <li><strong>section</strong> <span style={{ color: 'var(--text-muted)' }}>(Optional, e.g. 1 or A, will resolve 1 to A)</span></li>
                <li><strong>mobile no.</strong> <span style={{ color: 'var(--text-muted)' }}>(Optional contact)</span></li>
                <li><strong>emai ID</strong> <span style={{ color: 'var(--text-muted)' }}>(Optional parent email)</span></li>
                <li><strong>address</strong> <span style={{ color: 'var(--text-muted)' }}>(Optional residence)</span></li>
                <li><strong>GR NO</strong> <span style={{ color: 'var(--text-muted)' }}>(Optional fallback ID)</span></li>
              </ul>
            </div>

            <form onSubmit={handleImportSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Select Excel File (.xlsx / .csv)</label>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="form-control"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  required
                  style={{ padding: '8px' }}
                />
              </div>

              {/* Import success message */}
              {importSuccessMsg && (
                <div style={{
                  background: 'var(--success-glow)',
                  color: 'var(--success)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  border: '1px solid var(--success)',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>{importSuccessMsg}</div>
              )}

              {/* Import Validation Errors */}
              {importErrors.length > 0 && (
                <div style={{
                  background: 'var(--danger-glow)',
                  color: 'var(--danger)',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  border: '1px solid var(--danger)',
                  marginBottom: '20px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <strong style={{ display: 'block', fontSize: '0.85rem' }}>Import errors found:</strong>
                  {importErrors.map((err, idx) => (
                    <div key={idx} style={{ paddingLeft: '8px', borderLeft: '2px solid var(--danger)' }}>{err}</div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={importLoading || !importFile}
                style={{
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '10px'
                }}
              >
                {importLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Upload & Process</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
