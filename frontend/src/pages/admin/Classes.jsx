import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Plus, BookOpen, Edit, Trash2, X } from 'lucide-react';

export const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Class Form states
  const [editingClassId, setEditingClassId] = useState(null);
  const [className, setClassName] = useState('');
  const [classTeacher, setClassTeacher] = useState('');
  const [sectionsStr, setSectionsStr] = useState('A, B');

  // Subject Form states
  const [targetClassId, setTargetClassId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectTeacher, setSubjectTeacher] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const classData = await studentService.getClasses();
      setClasses(classData);
      
      const teacherData = await studentService.getUsersByRole('teacher');
      setTeachers(teacherData);
      
      if (classData.length > 0) {
        setTargetClassId(classData[0]._id);
      }
      if (teacherData.length > 0) {
        setClassTeacher(teacherData[0]._id);
        setSubjectTeacher(teacherData[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch class configurations.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingClassId(null);
    setClassName('');
    setSectionsStr('A, B');
    if (teachers.length > 0) setClassTeacher(teachers[0]._id);
    setError('');
    setSuccess('');
    setShowClassModal(true);
  };

  const handleOpenEditModal = (cls) => {
    setEditingClassId(cls._id);
    setClassName(cls.name);
    setSectionsStr(cls.sections.join(', '));
    setClassTeacher(cls.classTeacher?._id || cls.classTeacher || '');
    setError('');
    setSuccess('');
    setShowClassModal(true);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const sections = sectionsStr.split(',').map(s => s.trim()).filter(s => s !== '');
    
    try {
      if (editingClassId) {
        // Edit flow
        await studentService.updateClass(editingClassId, {
          name: className,
          sections,
          classTeacher: classTeacher || undefined
        });
        setSuccess(`Class "${className}" updated successfully.`);
      } else {
        // Add flow
        await studentService.createClass({
          name: className,
          sections,
          classTeacher: classTeacher || undefined
        });
        setSuccess(`Class "${className}" created successfully.`);
      }
      setShowClassModal(false);
      setClassName('');
      setSectionsStr('A, B');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to process class.');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to remove this class cohort?')) return;
    try {
      await studentService.deleteClass(id);
      setSuccess('Class deleted successfully.');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete class.');
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await studentService.addSubjectToClass(targetClassId, {
        subjectName,
        teacherId: subjectTeacher
      });
      setSuccess(`Subject "${subjectName}" added successfully.`);
      setShowSubjectModal(false);
      setSubjectName('');
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to assign subject.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Class Room & Subject Configurations</h2>
          <p style={{ color: 'var(--text-muted)' }}>Create class structures, assign class teachers, and set curriculum topics.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setShowSubjectModal(true)}>
            <Plus size={18} />
            <span>Add Subject</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            <span>New Class</span>
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
          <h4>Loading class configurations...</h4>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {classes.length === 0 ? (
            <div className="glass-panel text-center" style={{ gridColumn: '1 / -1', padding: '40px', color: 'var(--text-muted)' }}>
              No classes configured. Click New Class to setup.
            </div>
          ) : (
            classes.map((c) => (
              <div key={c._id} className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>{c.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Class Teacher: <strong>{c.classTeacher?.name || 'Unassigned'}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {c.sections.map((sec, idx) => (
                      <span key={idx} className="badge badge-primary">Sec {sec}</span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={14} />
                    <span>Subjects & Instructors</span>
                  </h4>
                  {c.subjects.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No subjects assigned.
                    </p>
                  ) : (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {c.subjects.map((sub, idx) => (
                        <li key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          fontSize: '0.85rem', 
                          padding: '6px 10px',
                          background: 'var(--bg-app)',
                          borderRadius: '6px'
                        }}>
                          <span>{sub.name}</span>
                          <strong style={{ color: 'var(--primary)' }}>{sub.teacher?.name || 'Unassigned'}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Edit & Delete Class Actions */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => handleOpenEditModal(c)}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => handleDeleteClass(c._id)}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Class Modal */}
      {showClassModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowClassModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '20px' }}>{editingClassId ? 'Modify Class Settings' : 'Setup New Class'}</h3>

            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label className="form-label">Class Name</label>
                <select 
                  className="form-control" 
                  value={className} 
                  onChange={(e) => setClassName(e.target.value)}
                  required
                >
                  <option value="">-- Select Grade --</option>
                  {Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sections (Comma Separated)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={sectionsStr} 
                  onChange={(e) => setSectionsStr(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class Teacher</label>
                <select 
                  className="form-control" 
                  value={classTeacher} 
                  onChange={(e) => setClassTeacher(e.target.value)}
                >
                  <option value="">Select Teacher (Optional)</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                {editingClassId ? 'Save Changes' : 'Create Class'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowSubjectModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '20px' }}>Assign Subject & Teacher</h3>

            <form onSubmit={handleAddSubject}>
              <div className="form-group">
                <label className="form-label">Select Target Class</label>
                <select 
                  className="form-control" 
                  value={targetClassId} 
                  onChange={(e) => setTargetClassId(e.target.value)}
                  required
                >
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={subjectName} 
                  onChange={(e) => setSubjectName(e.target.value)} 
                  placeholder="e.g. Chemistry"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Teacher</label>
                <select 
                  className="form-control" 
                  value={subjectTeacher} 
                  onChange={(e) => setSubjectTeacher(e.target.value)}
                  required
                >
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                Assign Subject
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
