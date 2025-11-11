import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useStudentStore = create((set, get) => ({
  students: [],
  loading: false,
  error: null,

  fetchStudents: async (filters = {}) => {
    set({ loading: true, error: null });
    let query = supabase.from('students').select('*');

    if (filters.class_id) {
      query = query.eq('class_id', filters.class_id);
    }
    // Add more filters as needed

    const { data, error } = await query;
    if (error) {
      set({ error, loading: false });
    } else {
      set({ students: data, loading: false });
    }
  },

  addStudent: async (newStudent) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('students').insert([newStudent]).select();
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        students: [...state.students, data[0]],
        loading: false,
      }));
    }
  },

  updateStudent: async (id, updatedStudent) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('students').update(updatedStudent).eq('id', id).select();
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        students: state.students.map((student) => (student.id === id ? data[0] : student)),
        loading: false,
      }));
    }
  },

  deleteStudent: async (id) => {
    set({ loading: true, error: null });
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        students: state.students.filter((student) => student.id !== id),
        loading: false,
      }));
    }
  },
}));

export default useStudentStore;
