import { apiCall } from './api.js';

export const feeService = {
  createInvoice: async (invoiceData) => {
    return await apiCall('/admin/fees', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  },

  getInvoices: async () => {
    return await apiCall('/admin/fees');
  },

  recordPayment: async (invoiceId, paymentData) => {
    return await apiCall(`/admin/fees/${invoiceId}/pay`, {
      method: 'PUT',
      body: JSON.stringify(paymentData)
    });
  },

  // Categories
  getCategories: async () => {
    return await apiCall('/admin/fees/categories');
  },

  createCategory: async (categoryData) => {
    return await apiCall('/admin/fees/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  deleteCategory: async (id) => {
    return await apiCall(`/admin/fees/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // Payments
  createRazorpayOrder: async (orderData) => {
    return await apiCall('/admin/fees/payments/order', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  verifyRazorpayPayment: async (paymentData) => {
    return await apiCall('/admin/fees/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  getReceipt: async (id) => {
    return await apiCall(`/admin/fees/payments/receipt/${id}`);
  },

  sendReminder: async (id) => {
    return await apiCall(`/admin/fees/reminders/${id}`, {
      method: 'POST'
    });
  }
};

export default feeService;
