import create from 'zustand';
import { supabase } from '../supabaseClient';

const useUserStore = create((set) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    set({ loading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (userProfile) {
        set({ user: { ...session.user, role: userProfile.role }, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } else {
      set({ user: null, loading: false });
    }
  },
  setUserRole: (role) => set((state) => ({ user: { ...state.user, role } })),
}));

export default useUserStore;
