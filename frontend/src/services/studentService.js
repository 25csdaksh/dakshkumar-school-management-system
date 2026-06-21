import { apiCall } from './api.js';

export const studentService = {
  // Student & Parent dashboards
  getStudentDashboard: async (studentId) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return await apiCall(`/student/dashboard${query}`);
  },

  getStudentAttendance: async (studentId) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return await apiCall(`/student/attendance${query}`);
  },

  getStudentGrades: async (studentId) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return await apiCall(`/student/grades${query}`);
  },

  getStudentFees: async (studentId) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return await apiCall(`/student/fees${query}`);
  },

  getStudentHomework: async (studentId) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return await apiCall(`/student/homework${query}`);
  },

  getParentChildren: async () => {
    return await apiCall('/parent/children');
  },

  // Teacher actions
  getTeacherClasses: async () => {
    return await apiCall('/teacher/classes');
  },

  getStudentsByClass: async (classId, section) => {
    const query = section ? `?section=${section}` : '';
    return await apiCall(`/teacher/classes/${classId}/students${query}`);
  },

  markAttendance: async (classId, section, date, attendanceData) => {
    return await apiCall('/teacher/attendance', {
      method: 'POST',
      body: JSON.stringify({ classId, section, date, attendanceData })
    });
  },

  getAttendanceRecord: async (classId, section, date) => {
    return await apiCall(`/teacher/classes/${classId}/attendance?section=${section}&date=${date}`);
  },

  addOrUpdateGrade: async (gradeData) => {
    return await apiCall('/teacher/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  },

  getGradesByClass: async (classId, subjectName, examName, section) => {
    const query = `?subjectName=${subjectName || ''}&examName=${examName || ''}&section=${section || ''}`;
    return await apiCall(`/teacher/classes/${classId}/grades${query}`);
  },

  // Admin general management
  getDashboardStats: async () => {
    return await apiCall('/admin/stats');
  },

  createUser: async (userData) => {
    return await apiCall('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getUsersByRole: async (role) => {
    const query = role ? `?role=${role}` : '';
    return await apiCall(`/admin/users${query}`);
  },

  deleteUser: async (userId) => {
    return await apiCall(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  createClass: async (classData) => {
    return await apiCall('/admin/classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });
  },

  getClasses: async () => {
    return await apiCall('/admin/classes');
  },

  getSubjects: async () => {
    return await apiCall('/admin/subjects');
  },

  getTeachers: async () => {
    return await apiCall('/admin/users?role=teacher');
  },

  addSubjectToClass: async (classId, subjectData) => {
    return await apiCall(`/admin/classes/${classId}/subjects`, {
      method: 'POST',
      body: JSON.stringify(subjectData)
    });
  },

  // Notice board
  createNotice: async (noticeData) => {
    return await apiCall('/admin/notices', {
      method: 'POST',
      body: JSON.stringify(noticeData)
    });
  },

  getNotices: async () => {
    return await apiCall('/admin/notices');
  },

  deleteNotice: async (noticeId) => {
    return await apiCall(`/admin/notices/${noticeId}`, {
      method: 'DELETE'
    });
  },

  // Edit / Update General Admin Methods
  updateStudent: async (id, studentData) => {
    return await apiCall(`/student/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  },

  updateTeacher: async (id, teacherData) => {
    return await apiCall(`/teacher/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData)
    });
  },

  updateClass: async (id, classData) => {
    return await apiCall(`/admin/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData)
    });
  },

  deleteClass: async (id) => {
    return await apiCall(`/admin/classes/${id}`, {
      method: 'DELETE'
    });
  }
};

export default studentService;
