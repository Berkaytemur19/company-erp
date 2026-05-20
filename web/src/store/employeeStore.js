import { create } from 'zustand';
import api from '../services/api';

export const useEmployeeStore = create((set) => ({
  employees: [],
  isLoading: false,
  error: null,

  fetchEmployees: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/employees');
      set({ employees: res.data, error: null });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateEmployee: async (id, data) => {
    try {
      const res = await api.put(`/employees/${id}`, data);
      set((state) => ({
        employees: state.employees.map((e) => e.id === id ? res.data : e),
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message });
      throw err;
    }
  },

  deleteEmployee: async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      set((state) => ({ employees: state.employees.filter((e) => e.id !== id) }));
    } catch (err) {
      set({ error: err.response?.data?.error || err.message });
    }
  },
}));
