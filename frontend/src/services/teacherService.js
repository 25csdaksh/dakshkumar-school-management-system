import { apiCall } from './api.js';

export const teacherService = {
  // Leaves
  applyLeave: async (leaveData) => {
    return await apiCall('/teacher/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  },
  getMyLeaves: async () => {
    return await apiCall('/teacher/leaves');
  },
  getAllLeaves: async () => {
    return await apiCall('/teacher/leaves/admin');
  },
  reviewLeave: async (id, reviewData) => {
    return await apiCall(`/teacher/leaves/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData)
    });
  },

  // Salary
  getSalary: async () => {
    return await apiCall('/teacher/salary');
  }
};

export default teacherService;
