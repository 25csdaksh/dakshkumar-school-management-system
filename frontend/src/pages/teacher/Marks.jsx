import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { Award, Save, Edit } from 'lucide-react';

export const Marks = () => {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [section, setSection] = useState('A');
  const [subjectName, setSubjectName] = useState('');
  const [examName, setExamName] = useState('Midterm Exam');

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // studentId -> { marksObtained: 0, maxMarks: 100, remarks: '' }
  const [savedStatus, setSavedStatus] = useState({}); // studentId -> boolean

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classData = await studentService.getTeacherClasses();
        setClasses(classData);
        if (classData.length > 0) {
          setClassId(classData[0]._id);
          // Set initial subject
          if (classData[0].subjects.length > 0) {
            setSubjectName(classData[0].subjects[0].name);
          }
        }
      } catch (err) {
        setError('Failed to fetch class lists.');
      }
    };
    fetchClasses();
  }, []);

  // Update subject list dropdown when class changes
  const handleClassChange = (e) => {
    const selectedId = e.target.value;
    setClassId(selectedId);
    const selectedClass = classes.find(c => c._id === selectedId);
    if (selectedClass && selectedClass.subjects.length > 0) {
      setSubjectName(selectedClass.subjects[0].name);
    } else {
      setSubjectName('');
    }
  };

  const handleFetchStudents = async (e) => {
    e.preventDefault();
    if (!classId || !subjectName) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const studentData = await studentService.getStudentsByClass(classId, section);
      setStudents(studentData);

      // Fetch pre-existing grades for this class, subject, and exam
      const preGrades = await studentService.getGradesByClass(classId, subjectName, examName);

      const initialMarks = {};
      const status = {};

      studentData.forEach(student => {
        // Check if grade already exists
        const existing = preGrades.find(g => g.student?._id === student._id || g.student === student._id);
        if (existing) {
          initialMarks[student._id] = {
            marksObtained: existing.marksObtained,
            maxMarks: existing.maxMarks,
            remarks: existing.remarks || ''
          };
          status[student._id] = true; // Mark as saved already
        } else {
          initialMarks[student._id] = {
            marksObtained: 0,
            maxMarks: 100,
            remarks: ''
          };
          status[student._id] = false;
        }
      });

      setMarks(initialMarks);
      setSavedStatus(status);
    } catch (err) {
      setError('Failed to fetch class rosters or grades.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
    setSavedStatus(prev => ({
      ...prev,
      [studentId]: false // reset saved state since it has unsaved changes
    }));
  };

  const handleSaveStudentMark = async (studentId) => {
    setError('');
    setSuccess('');
    
    const payload = {
      studentId,
      classId,
      subjectName,
      examName,
      marksObtained: Number(marks[studentId].marksObtained),
      maxMarks: Number(marks[studentId].maxMarks),
      remarks: marks[studentId].remarks
    };

    try {
      await studentService.addOrUpdateGrade(payload);
      setSavedStatus(prev => ({
        ...prev,
        [studentId]: true
      }));
    } catch (err) {
      setError(`Failed to save mark for student: ${err.message}`);
    }
  };

  const currentClass = classes.find(c => c._id === classId);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2>Academic Grading & Marks</h2>
        <p style={{ color: 'var(--text-muted)' }}>Input midterm exam grades, quizzes, and class results.</p>
      </div>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <form onSubmit={handleFetchStudents} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Grade Class</label>
            <select 
              className="form-control" 
              value={classId} 
              onChange={handleClassChange}
              required
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Section</label>
            <select 
              className="form-control" 
              value={section} 
              onChange={(e) => setSection(e.target.value)}
              required
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject</label>
            <select 
              className="form-control" 
              value={subjectName} 
              onChange={(e) => setSubjectName(e.target.value)}
              required
            >
              <option value="">Select Subject</option>
              {currentClass?.subjects.map((s, idx) => (
                <option key={idx} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Exam Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={examName} 
              onChange={(e) => setExamName(e.target.value)} 
              placeholder="e.g. Midterm Exam"
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Load Grading Roster
          </button>
        </form>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', height: '30vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Retrieving class grades...</h4>
        </div>
      ) : students.length > 0 ? (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Marks Obtained</th>
                <th>Max Marks</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.studentInfo?.rollNumber || '-'}</td>
                  <td><strong style={{ color: 'var(--text-main)' }}>{student.name}</strong></td>
                  <td>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ width: '90px', padding: '6px 10px' }}
                      value={marks[student._id]?.marksObtained || 0}
                      onChange={(e) => handleMarkChange(student._id, 'marksObtained', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ width: '90px', padding: '6px 10px' }}
                      value={marks[student._id]?.maxMarks || 100}
                      onChange={(e) => handleMarkChange(student._id, 'maxMarks', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ padding: '6px 10px' }}
                      placeholder="e.g. Good progress"
                      value={marks[student._id]?.remarks || ''}
                      onChange={(e) => handleMarkChange(student._id, 'remarks', e.target.value)}
                    />
                  </td>
                  <td>
                    <button 
                      className={`btn ${savedStatus[student._id] ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleSaveStudentMark(student._id)}
                    >
                      <Save size={14} />
                      <span>{savedStatus[student._id] ? 'Saved' : 'Save'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
          No roster retrieved. Please pick class parameters and click Load Grading Roster.
        </div>
      )}
    </div>
  );
};

export default Marks;
