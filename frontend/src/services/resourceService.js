import { apiCall } from './api.js';

export const resourceService = {
  // Library
  getBooks: async () => {
    return await apiCall('/resources/library');
  },
  createBook: async (bookData) => {
    return await apiCall('/resources/library', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
  },
  issueBook: async (issueData) => {
    return await apiCall('/resources/library/issue', {
      method: 'POST',
      body: JSON.stringify(issueData)
    });
  },
  returnBook: async (returnData) => {
    return await apiCall('/resources/library/return', {
      method: 'POST',
      body: JSON.stringify(returnData)
    });
  },

  // Hostel
  getHostels: async () => {
    return await apiCall('/resources/hostel');
  },
  createHostel: async (hostelData) => {
    return await apiCall('/resources/hostel', {
      method: 'POST',
      body: JSON.stringify(hostelData)
    });
  },
  allocateBed: async (hostelId, roomId, allocationData) => {
    return await apiCall(`/resources/hostel/${hostelId}/room/${roomId}/allocate`, {
      method: 'PUT',
      body: JSON.stringify(allocationData)
    });
  },
  deallocateBed: async (hostelId, roomId, deallocationData) => {
    return await apiCall(`/resources/hostel/${hostelId}/room/${roomId}/deallocate`, {
      method: 'PUT',
      body: JSON.stringify(deallocationData)
    });
  },

  // Inventory
  getInventory: async () => {
    return await apiCall('/resources/inventory');
  },
  createInventoryItem: async (itemData) => {
    return await apiCall('/resources/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  },
  updateInventoryItem: async (itemId, itemData) => {
    return await apiCall(`/resources/inventory/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  },
  deleteInventoryItem: async (itemId) => {
    return await apiCall(`/resources/inventory/${itemId}`, {
      method: 'DELETE'
    });
  },

  // Transport
  getVehicles: async () => {
    return await apiCall('/resources/transport');
  },
  createVehicle: async (vehicleData) => {
    return await apiCall('/resources/transport', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  },
  deleteVehicle: async (id) => {
    return await apiCall(`/resources/transport/${id}`, {
      method: 'DELETE'
    });
  },
  assignVehicleToStudent: async (assignmentData) => {
    return await apiCall('/resources/transport/assign', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  }
};

export default resourceService;
