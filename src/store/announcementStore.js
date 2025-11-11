import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  loading: false,
  error: null,

  fetchAnnouncements: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) {
      set({ error, loading: false });
    } else {
      set({ announcements: data, loading: false });
    }
  },

  addAnnouncement: async (newAnnouncement) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('announcements').insert([newAnnouncement]).select();
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        announcements: [data[0], ...state.announcements],
        loading: false,
      }));
    }
  },

  updateAnnouncement: async (id, updatedAnnouncement) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from('announcements').update(updatedAnnouncement).eq('id', id).select();
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        announcements: state.announcements.map((ann) => (ann.id === id ? data[0] : ann)),
        loading: false,
      }));
    }
  },

  deleteAnnouncement: async (id) => {
    set({ loading: true, error: null });
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      set({ error, loading: false });
    } else {
      set((state) => ({
        announcements: state.announcements.filter((ann) => ann.id !== id),
        loading: false,
      }));
    }
  },
}));

export default useAnnouncementStore;
