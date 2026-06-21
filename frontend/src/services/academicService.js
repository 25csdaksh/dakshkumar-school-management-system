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
