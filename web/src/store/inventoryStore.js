import { create } from 'zustand';
import api from '../services/api';

export const useInventoryStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/inventory');
      set({ items: res.data, error: null });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (id, data) => {
    try {
      const res = await api.put(`/inventory/${id}`, data);
      set((state) => ({
        items: state.items.map((i) => i.id === id ? res.data : i),
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.error || err.message });
      throw err;
    }
  },

  deleteItem: async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    } catch (err) {
      set({ error: err.response?.data?.error || err.message });
    }
  },
}));
