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

  deleteItem: async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    } catch (err) {
      set({ error: err.response?.data?.error || err.message });
    }
  },
}));
