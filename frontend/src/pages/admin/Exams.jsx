import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Plus, Award, Calendar, X } from 'lucide-react';

export const Exams = () => {
  const [exams, setExams] = useState([
    { id: 1, name: 'Midterm Exam 2026', className: 'Grade 10', term: 'Term 1', startDate: '2026-06-19' },
    { id: 2, name: 'Final Semester Finals', className: 'Grade 12', term: 'Term 2', startDate: '2026-06-26' }
  ]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [startDate, setStartDate] = useState('');

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
  }, []);

  const handleAddExam = (e) => {
    e.preventDefault();
    const targetClass = classes.find(c => c._id === classId);
    const newExam = {
      id: Date.now(),
      name,
      className: targetClass ? targetClass.name : 'Unknown Class',
      term,
      startDate
    };

    setExams([...exams, newExam]);
    setShowModal(false);
    setName('');
    setStartDate('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Examination schedules</h2>
          <p style={{ color: 'var(--text-muted)' }}>Setup term tests, final examinations, and schedule timelines.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>New Exam Schedule</span>
        </button>
      </div>

      <div className="glass-panel table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Exam Name</th>
              <th>Target Class</th>
              <th>Academic Term</th>
              <th>Start Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((ex) => (
              <tr key={ex.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="var(--primary)" />
                    <strong style={{ color: 'var(--text-main)' }}>{ex.name}</strong>
                  </div>
                </td>
                <td>{ex.className}</td>
                <td><span className="badge badge-primary">{ex.term}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    <span>{ex.startDate}</span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-success">Scheduled</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Exam Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '20px' }}>Add Exam Schedule</h3>

            <form onSubmit={handleAddExam}>
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
                Schedule Exam
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
