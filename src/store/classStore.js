import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useClassStore = create((set, get) => ({
  classes: [],
  loading: false,
  error: null,

  fetchClasses: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('classes').select('*');
    if (error) {
      set({ error, loading: false });
    } else {
      set({ classes: data, loading: false });
    }
  },

  addClass: async (newClass) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('classes').insert([newClass]).select();
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        classes: [...state.classes, data[0]],
        loading: false,
      }));
    }
  },

  updateClass: async (id, updatedClass) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('classes').update(updatedClass).eq('id', id).select();
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        classes: state.classes.map((cls) => (cls.id === id ? data[0] : cls)),
        loading: false,
      }));
    }
  },

  deleteClass: async (id) => {
    set({ loading: true, error: null });
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        classes: state.classes.filter((cls) => cls.id !== id),
        loading: false,
      }));
    }
  },
}));

export default useClassStore;
