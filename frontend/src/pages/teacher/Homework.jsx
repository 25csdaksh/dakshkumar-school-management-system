import React, { useState } from 'react';
import { BookOpen, Plus, Calendar } from 'lucide-react';

export const Homework = () => {
  const [homeworkList, setHomeworkList] = useState([
    { id: 1, title: 'Calculus Assignment 4', className: 'Grade 12', subject: 'Calculus', dueDate: '2026-06-25', status: 'Active' },
    { id: 2, title: 'Algebra Equations Practice', className: 'Grade 10', subject: 'Mathematics', dueDate: '2026-06-22', status: 'Active' }
  ]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Assignments & Resources</h2>
          <p style={{ color: 'var(--text-muted)' }}>Publish homework logs, course syllabus, and resources for students.</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert('New assignment upload is simulated in this workspace version!')}>
          <Plus size={18} />
          <span>Post Assignment</span>
        </button>
      </div>

      <div className="glass-panel table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Assignment Title</th>
              <th>Class Room</th>
              <th>Subject Course</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {homeworkList.map((hw) => (
              <tr key={hw.id}>
                <td><strong style={{ color: 'var(--text-main)' }}>{hw.title}</strong></td>
                <td>{hw.className}</td>
                <td><span className="badge badge-primary">{hw.subject}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    <span>{hw.dueDate}</span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-success">{hw.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Homework;
