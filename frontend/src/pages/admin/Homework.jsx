import React, { useState } from 'react';
import { BookOpen, Calendar, User } from 'lucide-react';

export const Homework = () => {
  const [homeworkList, setHomeworkList] = useState([
    { id: 1, title: 'Calculus Assignment 4', className: 'Grade 12', subject: 'Calculus', dueDate: '2026-06-25', teacher: 'John Doe' },
    { id: 2, title: 'Algebra Equations Practice', className: 'Grade 10', subject: 'Mathematics', dueDate: '2026-06-22', teacher: 'John Doe' },
    { id: 3, title: 'Mechanics Lab Report', className: 'Grade 10', subject: 'Physics', dueDate: '2026-06-24', teacher: 'Sarah Smith' }
  ]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Student Homework logs</h2>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and check homework tasks published by school instructors.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {homeworkList.map((hw) => (
          <div key={hw.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-primary">{hw.subject}</span>
              <span className="badge badge-success">{hw.className}</span>
            </div>
            
            <h3 style={{ fontSize: '1.1rem' }}>{hw.title}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
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
    </div>
  );
};

export default Homework;
