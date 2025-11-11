import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useAttendanceStore = create((set, get) => ({
  attendanceRecords: [],
  loading: false,
  error: null,

  fetchAttendance: async (filters = {}) => {
    set({ loading: true, error: null });
    let query = supabase.from('attendance').select('*');

    if (filters.student_id) {
      query = query.eq('student_id', filters.student_id);
    }
    if (filters.date) {
      query = query.eq('date', filters.date);
    }
    // Add more filters as needed (e.g., by class_id)

    const { data, error } = await query;
    if (error) {
      set({ error, loading: false });
    } else {
      set({ attendanceRecords: data, loading: false });
    }
  },

  markAttendance: async (newRecord) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('attendance').insert([newRecord]).select();
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        attendanceRecords: [...state.attendanceRecords, data[0]],
        loading: false,
      }));
    }
  },

  updateAttendance: async (id, updatedRecord) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('attendance').update(updatedRecord).eq('id', id).select();
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        attendanceRecords: state.attendanceRecords.map((record) => (record.id === id ? data[0] : record)),
        loading: false,
      }));
    }
  },

  deleteAttendance: async (id) => {
    set({ loading: true, error: null });
    const { error } = await supabase.from('attendance').delete().eq('id', id);
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        attendanceRecords: state.attendanceRecords.filter((record) => record.id !== id),
        loading: false,
      }));
    }
  },
}));

export default useAttendanceStore;
