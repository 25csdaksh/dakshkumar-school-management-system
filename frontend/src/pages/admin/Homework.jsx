import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import academicService from '../../services/academicService.js';
import { BookOpen, Calendar, User, Search, AlertCircle } from 'lucide-react';

export const Homework = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');
  const [homeworkList, setHomeworkList] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const clsData = await studentService.getClasses();
        setClasses(clsData);
        if (clsData.length > 0) {
          setSelectedClass(clsData[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch classes', err);
      }
    };
    fetchClasses();
  }, []);

  const handleShowHomework = async () => {
    if (!selectedClass) {
      setError('Please select a class standard first.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await academicService.getHomework(selectedClass, selectedSection);
      setHomeworkList(data);
      setHasQueried(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch homework logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Student Homework logs</h2>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and check homework tasks published by school instructors.</p>
      </div>

      {/* Filters bar */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
          <label className="form-label">Standard (Class)</label>
          <select 
            className="form-control"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Choose Class --</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0, flex: '1 1 150px' }}>
          <label className="form-label">Division (Section)</label>
          <select 
            className="form-control"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleShowHomework} style={{ height: '46px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={16} />
          <span>Show Homework</span>
        </button>
      </div>

      {error && <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}><h3>Fetching homework assignments...</h3></div>
      ) : !hasQueried ? (
        <div className="glass-panel text-center" style={{ padding: '48px', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No filters applied</h3>
          <p>Please select a Standard and Division and click the <strong>Show Homework</strong> button above.</p>
        </div>
      ) : homeworkList.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '48px', color: 'var(--text-muted)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No Homework Found</h3>
          <p>There are no homework logs registered for the selected class standard and section.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {homeworkList.map((hw) => (
            <div key={hw._id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">{hw.subject}</span>
                <span className="badge badge-success">{hw.className} ({hw.section})</span>
              </div>
              
              <h3 style={{ fontSize: '1.1rem', marginTop: '8px' }}>{hw.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flexGrow: 1 }}>{hw.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} />
                  <span>By: {hw.teacher}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  <span>Due: {hw.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Homework;
