import { apiCall } from './api.js';

export const aiService = {
  analyzeReport: async (studentId) => {
    return await apiCall('/ai/analyze-report', {
      method: 'POST',
      body: JSON.stringify({ studentId })
    });
  },

  checkConflicts: async (periods) => {
    return await apiCall('/ai/resolve-timetable', {
      method: 'POST',
      body: JSON.stringify({ periods })
    });
  }
};

export default aiService;
