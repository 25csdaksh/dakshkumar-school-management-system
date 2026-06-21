import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import academicService from '../../services/academicService.js';
import { Plus, Award, Calendar, X, Edit, Trash } from 'lucide-react';

export const Exams = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [startDate, setStartDate] = useState('');

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await academicService.getExams();
      setExams(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch exam schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await studentService.getClasses();
        setClasses(data);
        if (data.length > 0) {
          setClassId(data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching classes', err);
      }
    };
    fetchClasses();
    loadExams();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      const payload = { name, classId, term, startDate };
      if (editingExamId) {
        await academicService.updateExam(editingExamId, payload);
        setMessage('Exam schedule updated successfully!');
      } else {
        await academicService.createExam(payload);
        setMessage('Exam schedule created successfully!');
      }
      setShowModal(false);
      setName('');
      setStartDate('');
      setEditingExamId(null);
      loadExams();
    } catch (err) {
      setError(err.message || 'Failed to save exam schedule');
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam schedule?')) return;
    try {
      setError('');
      setMessage('');
      await academicService.deleteExam(id);
      setMessage('Exam schedule deleted successfully.');
      loadExams();
    } catch (err) {
      setError(err.message || 'Failed to delete exam schedule');
    }
  };

  const openEditModal = (ex) => {
    setEditingExamId(ex._id);
    setName(ex.name);
    setClassId(ex.classId?._id || ex.classId);
    setTerm(ex.term);
    setStartDate(ex.startDate ? new Date(ex.startDate).toISOString().split('T')[0] : '');
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingExamId(null);
    setName('');
    if (classes.length > 0) setClassId(classes[0]._id);
    setTerm('Term 1');
    setStartDate('');
    setShowModal(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Examination schedules</h2>
          <p style={{ color: 'var(--text-muted)' }}>Setup term tests, final examinations, and schedule timelines.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>New Exam Schedule</span>
        </button>
      </div>

      {message && <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{message}</div>}
      {error && <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}><h3>Loading Exam Schedules...</h3></div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Target Class</th>
                <th>Academic Term</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ color: 'var(--text-muted)', padding: '24px' }}>
                    No exam schedules found. Click 'New Exam Schedule' to add one.
                  </td>
                </tr>
              ) : (
                exams.map((ex) => (
                  <tr key={ex._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={18} color="var(--primary)" />
                        <strong style={{ color: 'var(--text-main)' }}>{ex.name}</strong>
                      </div>
                    </td>
                    <td>{ex.classId?.name || 'Class Deleted'}</td>
                    <td><span className="badge badge-primary">{ex.term}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        <span>{ex.startDate ? new Date(ex.startDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">Scheduled</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', gap: '4px' }} onClick={() => openEditModal(ex)}>
                          <Edit size={14} /> Edit
                        </button>
                        <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteExam(ex._id)}>
                          <Trash size={14} />
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

      {/* Exam Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '20px' }}>{editingExamId ? 'Edit Exam Schedule' : 'Add Exam Schedule'}</h3>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Exam Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Midterm Exam"
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Target Class</label>
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
                  <label className="form-label">Academic Term</label>
                  <select 
                    className="form-control" 
                    value={term} 
                    onChange={(e) => setTerm(e.target.value)}
                    required
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Finals">Finals</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                {editingExamId ? 'Save Changes' : 'Schedule Exam'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
