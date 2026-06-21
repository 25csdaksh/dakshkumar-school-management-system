import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { BookOpen, Calendar, User } from 'lucide-react';

export const Homework = ({ studentId }) => {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHomework = async () => {
      try {
        const data = await studentService.getStudentHomework(studentId);
        setHomework(data);
      } catch (err) {
        setError('Failed to fetch homework logs.');
      } finally {
        setLoading(false);
      }
    };
    loadHomework();
  }, [studentId]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Course Homework Assignments</h2>
        <p style={{ color: 'var(--text-muted)' }}>Overview of current homework tasks, exercises, and due dates.</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', height: '40vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Retrieving homework sheets...</h4>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {homework.length === 0 ? (
            <div className="glass-panel text-center" style={{ gridColumn: '1 / -1', padding: '40px', color: 'var(--text-muted)' }}>
              No homework assignments logged. You are all caught up!
            </div>
          ) : (
            homework.map((hw) => (
              <div key={hw._id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-primary">{hw.subjectName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem' }}>{hw.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', flexGrow: 1 }}>{hw.description}</p>
                
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <User size={14} />
                  <span>Assigned by: <strong>{hw.teacherName}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Homework;
