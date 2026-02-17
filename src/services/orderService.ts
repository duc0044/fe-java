import api from '../api/axiosInstance';

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  createdAt: string;
  createdBy?: string;
}

export const orderService = {
  // Order Management
  getOrders: async (params?: { page?: number, size?: number, status?: string }) => {
    return api.get('/api/orders', { params });
  },
  getOrderById: async (id: number) => {
    return api.get(`/api/orders/${id}`);
  },
  createOrder: async (orderData: Partial<Order>) => {
    return api.post('/api/orders', orderData);
  },
  updateOrder: async (id: number, orderData: Partial<Order>) => {
    return api.put(`/api/orders/${id}`, orderData);
  },
  deleteOrder: async (id: number) => {
    return api.delete(`/api/orders/${id}`);
  },
  approveOrder: async (id: number) => {
    return api.post(`/api/orders/${id}/approve`);
  },

  // Report Management
  getReports: async (params?: { page?: number, size?: number, type?: string }) => {
    return api.get('/api/orders/reports', { params });
  },
  getReportById: async (id: number) => {
    return api.get(`/api/orders/reports/${id}`);
  },
  createReport: async (reportData: Partial<Report>) => {
    return api.post('/api/orders/reports', reportData);
  },
  updateReport: async (id: number, reportData: Partial<Report>) => {
    return api.put(`/api/orders/reports/${id}`, reportData);
  },
  deleteReport: async (id: number) => {
    return api.delete(`/api/orders/reports/${id}`);
  },
  exportReport: async (id: number) => {
    return api.get(`/api/orders/reports/${id}/export`, {
      responseType: 'blob'
    });
  }
};
