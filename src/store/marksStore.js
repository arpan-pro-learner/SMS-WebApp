import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useMarksStore = create((set, get) => ({
  marksRecords: [],
  loading: false,
  error: null,

  fetchMarks: async (filters = {}) => {
    set({ loading: true, error: null });
    let query = supabase.from('marks').select('*');

    if (filters.student_id) {
      query = query.eq('student_id', filters.student_id);
    }
    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }
    // Add more filters as needed (e.g., by class_id)

    const { data, error } = await query;
    if (error) {
      set({ error, loading: false });
    } else {
      set({ marksRecords: data, loading: false });
    }
  },

  addMark: async (newMark) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('marks').insert([newMark]).select();
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        marksRecords: [...state.marksRecords, data[0]],
        loading: false,
      }));
    }
  },

  updateMark: async (id, updatedMark) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('marks').update(updatedMark).eq('id', id).select();
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        marksRecords: state.marksRecords.map((record) => (record.id === id ? data[0] : record)),
        loading: false,
      }));
    }
  },

  deleteMark: async (id) => {
    set({ loading: true, error: null });
    const { error } = await supabase.from('marks').delete().eq('id', id);
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        marksRecords: state.marksRecords.filter((record) => record.id !== id),
        loading: false,
      }));
    }
  },
}));

export default useMarksStore;
