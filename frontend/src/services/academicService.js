import { apiCall } from './api.js';

export const academicService = {
  // Academic Years
  getYears: async () => {
    return await apiCall('/academic/years');
  },
  createYear: async (yearData) => {
    return await apiCall('/academic/years', {
      method: 'POST',
      body: JSON.stringify(yearData)
    });
  },
  updateYear: async (id, yearData) => {
    return await apiCall(`/academic/years/${id}`, {
      method: 'PUT',
      body: JSON.stringify(yearData)
    });
  },
  setActiveYear: async (id) => {
    return await apiCall(`/academic/years/${id}/active`, {
      method: 'PUT'
    });
  },

  // Timetable
  getTimetable: async (classId, section) => {
    const sectionParam = section ? `?section=${section}` : '';
    return await apiCall(`/academic/timetable/${classId}${sectionParam}`);
  },
  saveTimetable: async (timetableData) => {
    return await apiCall('/academic/timetable', {
      method: 'POST',
      body: JSON.stringify(timetableData)
    });
  },
  saveBulkTimetable: async (bulkData) => {
    return await apiCall('/academic/timetable/bulk', {
      method: 'POST',
      body: JSON.stringify(bulkData)
    });
  },

  // Exams
  getExams: async () => {
    return await apiCall('/academic/exams');
  },
  createExam: async (examData) => {
    return await apiCall('/academic/exams', {
      method: 'POST',
      body: JSON.stringify(examData)
    });
  },
  updateExam: async (id, examData) => {
    return await apiCall(`/academic/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData)
    });
  },
  deleteExam: async (id) => {
    return await apiCall(`/academic/exams/${id}`, {
      method: 'DELETE'
    });
  },

  // Homework
  getHomework: async (classId, section) => {
    let query = '';
    if (classId) query += `?classId=${classId}`;
    if (section) query += `${classId ? '&' : '?'}section=${section}`;
    return await apiCall(`/academic/homework${query}`);
  },
  createHomework: async (hwData) => {
    return await apiCall('/academic/homework', {
      method: 'POST',
      body: JSON.stringify(hwData)
    });
  },
  updateHomework: async (id, hwData) => {
    return await apiCall(`/academic/homework/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hwData)
    });
  },
  deleteHomework: async (id) => {
    return await apiCall(`/academic/homework/${id}`, {
      method: 'DELETE'
    });
  },

  // Promotion
  promoteStudents: async (promotionData) => {
    return await apiCall('/academic/promote', {
      method: 'POST',
      body: JSON.stringify(promotionData)
    });
  },

  // Certificates
  getCertificates: async () => {
    return await apiCall('/academic/certificates');
  },
  issueCertificate: async (certData) => {
    return await apiCall('/academic/certificates/issue', {
      method: 'POST',
      body: JSON.stringify(certData)
    });
  }
};

export default academicService;
