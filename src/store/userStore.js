import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useUserStore = create((set) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    console.log('[userStore] fetchUser started...');
    set({ loading: true });
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('[userStore] Session data:', { session, sessionError });

      if (session?.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        console.log('[userStore] Profile data:', { userProfile, profileError });

        if (userProfile) {
          const userData = { ...session.user, role: userProfile.role, originalRole: userProfile.role };
          console.log('[userStore] Setting user:', userData);
          set({ user: userData, loading: false });
        } else {
          console.log('[userStore] No profile found, setting user to null.');
          set({ user: null, loading: false });
        }
      } else {
        console.log('[userStore] No session, setting user to null.');
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('[userStore] Error in fetchUser:', error);
      set({ user: null, loading: false });
    }
  },
  setUserRole: (role) => set((state) => ({ user: { ...state.user, role } })),
}));

export default useUserStore;
