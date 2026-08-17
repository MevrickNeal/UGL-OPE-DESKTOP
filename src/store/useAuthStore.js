import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  loading: true,
  error: null,

  fetchProfile: async (userId) => {
    if (!userId) {
      set({ profile: null, isAdmin: false });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        set({ profile: data, isAdmin: data.role === 'admin' });
      } else {
        set({ profile: { id: userId, role: 'inspector' }, isAdmin: false });
      }
    } catch (err) {
      console.warn('Profile fetch warning:', err);
      set({ profile: { id: userId, role: 'inspector' }, isAdmin: false });
    }
  },

  initAuth: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      const currentUser = session?.user || null;
      set({ session, user: currentUser, loading: false });

      if (currentUser) {
        await get().fetchProfile(currentUser.id);
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        const newUser = session?.user || null;
        set({ session, user: newUser, loading: false });
        if (newUser) {
          await get().fetchProfile(newUser.id);
        } else {
          set({ profile: null, isAdmin: false });
        }
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
      set({ loading: false, error: err.message });
    }
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set({ session: data.session, user: data.user });
    if (data.user) {
      await get().fetchProfile(data.user.id);
    }
    return { success: true };
  },

  signUp: async (email, password, fullName = '') => {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
    set({ session: data.session, user: data.user });
    if (data.user) {
      await get().fetchProfile(data.user.id);
    }
    return { success: true, session: data.session };
  },

  signOut: async () => {
    set({ error: null });
    const { error } = await supabase.auth.signOut();
    if (error) {
      set({ error: error.message });
    } else {
      set({ user: null, session: null, profile: null, isAdmin: false });
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
