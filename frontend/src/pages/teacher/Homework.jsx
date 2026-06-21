import React, { useState, useEffect } from 'react';
import { academicService } from '../../services/academicService.js';
import { studentService } from '../../services/studentService.js';
import { BookOpen, Plus, Calendar, Edit2, Trash2, Save, X } from 'lucide-react';

export const Homework = () => {
  const [homeworkList, setHomeworkList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedHwId, setSelectedHwId] = useState('');

  // Form input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [section, setSection] = useState('A');
  const [dueDate, setDueDate] = useState('');

  // Fetch homework list, classes, and subjects on load
  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const hwData = await academicService.getHomework();
      setHomeworkList(hwData);
      
      const classData = await studentService.getClasses();
      setClasses(classData);
      if (classData.length > 0) setClassId(classData[0]._id);

      const subjectData = await studentService.getSubjects();
      setSubjects(subjectData);
      if (subjectData.length > 0) setSubjectId(subjectData[0]._id);
    } catch (err) {
      setError(err.message || 'Failed to retrieve assignments registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setTitle('');
    setDescription('');
    if (classes.length > 0) setClassId(classes[0]._id);
    if (subjects.length > 0) setSubjectId(subjects[0]._id);
    setSection('A');
    setDueDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (hw) => {
    setModalMode('edit');
    setSelectedHwId(hw._id);
    setTitle(hw.title);
    setDescription(hw.description);
    
    // Find classId matching hw.className
    const matchingClass = classes.find(c => c.name === hw.className);
    if (matchingClass) setClassId(matchingClass._id);
    
    // Find subjectId matching hw.subject
    const matchingSubject = subjects.find(s => s.name === hw.subject);
    if (matchingSubject) setSubjectId(matchingSubject._id);

    setSection(hw.section || 'A');
    setDueDate(hw.dueDate);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      title,
      description,
      classId,
      subjectId,
      section,
      dueDate
    };

    try {
      if (modalMode === 'create') {
        await academicService.createHomework(payload);
        setSuccess('Homework assignment published successfully!');
      } else {
        await academicService.updateHomework(selectedHwId, payload);
        setSuccess('Homework assignment updated successfully!');
      }
      setIsModalOpen(false);
      // Reload homework logs list
      const updatedList = await academicService.getHomework();
      setHomeworkList(updatedList);
    } catch (err) {
      setError(err.message || 'Failed to save homework assignment.');
    }
  };

  const handleDeleteHomework = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment from records?')) return;
    setError('');
    setSuccess('');
    try {
      await academicService.deleteHomework(id);
      setSuccess('Assignment deleted successfully!');
      setHomeworkList(homeworkList.filter(hw => hw._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to remove assignment.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Assignments & Coursework Logs</h2>
          <p style={{ color: 'var(--text-muted)' }}>Publish homework logs, course worksheets, and resources for students.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          <span>Post Assignment</span>
        </button>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Synchronizing Coursework logs...</h3>
        </div>
      ) : homeworkList.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '48px', color: 'var(--text-muted)' }}>
          No homework assignments have been posted yet. Click 'Post Assignment' above to publish one.
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Class Room</th>
                <th>Subject Course</th>
                <th>Section</th>
                <th>Due Date</th>
                <th>Assigned Teacher</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {homeworkList.map((hw) => (
                <tr key={hw._id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{hw.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{hw.description}</span>
                    </div>
                  </td>
                  <td>{hw.className}</td>
                  <td><span className="badge badge-primary">{hw.subject}</span></td>
                  <td><span className="badge badge-secondary">{hw.section || 'A'}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <Calendar size={14} />
                      <span>{hw.dueDate}</span>
                    </div>
                  </td>
                  <td>{hw.teacher}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => openEditModal(hw)}
                        title="Edit Assignment details"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteHomework(hw._id)}
                        title="Delete Assignment"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog for Post/Edit Homework */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '24px' }}>
              {modalMode === 'create' ? 'Publish New Assignment' : 'Modify Assignment details'}
            </h3>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assignment Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Chapter 4 Equations Homework"
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description / Instructions</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Provide details of exercises and resources..."
                  required 
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target Class</label>
                  <select 
                    className="form-control"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    required
                  >
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Subject</label>
                  <select 
                    className="form-control"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                  >
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Section Division</label>
                  <select 
                    className="form-control"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    required
                  >
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                    <option value="C">Division C</option>
                    <option value="D">Division D</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>{modalMode === 'create' ? 'Post Assignment' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homework;
