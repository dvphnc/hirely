import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { MANAGED_TABLES } from '@/types/UserManagement';

interface UserPermission {
  table_name: string;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export type UserRole = 'admin' | 'user' | 'blocked';

interface UserProfile {
  id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  permissions: UserPermission[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  fetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const cleanupAuthState = () => {
  localStorage.removeItem('supabase.auth.token');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isAdmin = profile?.role === 'admin';

  // ✅ Fix: wrap in useCallback so it doesn't change on every render
  const fetchUserData = useCallback(async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData as UserProfile);
      }

      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', id);

      if (permissionsError) throw permissionsError;

      let userPermissions = permissionsData as UserPermission[] || [];

      if (userPermissions.length === 0) {
        const defaultPermissions = MANAGED_TABLES.map(table => ({
          user_id: id,
          table_name: table.name,
          can_add: true,
          can_edit: true,
          can_delete: true
        }));

        if (defaultPermissions.length > 0) {
          const { error: insertError } = await supabase
            .from('user_permissions')
            .insert(defaultPermissions);

          if (!insertError) {
            const { data: refreshedPermissions } = await supabase
              .from('user_permissions')
              .select('*')
              .eq('user_id', id);

            if (refreshedPermissions) {
              userPermissions = refreshedPermissions;
            }
          }
        }
      }

      setPermissions(userPermissions);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    }
  }, []); // ✅ empty deps — stable reference

  useEffect(() => {
    let isInitialized = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change event:', event, 'User:', newSession?.user?.email);

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // ✅ Pass userId directly to avoid stale closure
          setTimeout(() => {
            fetchUserData(newSession.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setPermissions([]);

          if (isInitialized && window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
            window.location.href = '/signin';
          }
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();

        console.log("Initial session check:", existingSession ? "Session exists" : "No session");

        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          await fetchUserData(existingSession.user.id);
        }

        isInitialized = true;
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      cleanupAuthState();

      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global sign out failed, continuing with login');
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({ variant: "destructive", title: "Login failed", description: error.message });
        return false;
      }

      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          toast({ variant: "destructive", title: "Error fetching profile", description: profileError.message });
          return false;
        }

        if (profileData.role === 'blocked') {
          await supabase.auth.signOut();
          toast({ variant: "destructive", title: "Account blocked", description: "Your account has been blocked. Please contact an administrator." });
          return false;
        }

        setProfile(profileData as UserProfile);

        const { data: permissionsData } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', data.user.id);

        let userPermissions = permissionsData as UserPermission[] || [];

        if (!userPermissions || userPermissions.length === 0) {
          const defaultPermissions = MANAGED_TABLES.map(table => ({
            user_id: data.user.id,
            table_name: table.name,
            can_add: true,
            can_edit: true,
            can_delete: true
          }));

          if (defaultPermissions.length > 0) {
            await supabase.from('user_permissions').insert(defaultPermissions);

            const { data: refreshedPermissions } = await supabase
              .from('user_permissions')
              .select('*')
              .eq('user_id', data.user.id);

            if (refreshedPermissions) {
              userPermissions = refreshedPermissions;
            }
          }
        }

        setPermissions(userPermissions);
        toast({ title: "Logged in successfully", description: `Welcome back, ${data.user.email}!` });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login error", description: error.message || "An unexpected error occurred." });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      cleanupAuthState();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (error) {
        toast({ variant: "destructive", title: "Sign up failed", description: error.message });
        return false;
      }

      if (data.user) {
        sonnerToast.success("Account created", { description: "Check your email for the confirmation link." });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign up error", description: error.message || "An unexpected error occurred." });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      setProfile(null);
      setPermissions([]);
      toast({ title: "Logged out", description: "You have been logged out successfully." });
      window.location.href = '/signin';
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error signing out", description: error.message || "An unexpected error occurred." });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      permissions,
      isAdmin,
      login,
      signup,
      logout,
      isLoading,
      fetchUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const usePermission = (tableName: string) => {
  const { permissions, isAdmin, profile } = useAuth();

  if (isAdmin) {
    return { canAdd: true, canEdit: true, canDelete: true };
  }

  const tablePermissions = permissions.find(p =>
    p.table_name.toLowerCase() === tableName.toLowerCase()
  );

  if (profile?.role === 'user') {
    return {
      canAdd: tablePermissions?.can_add || false,
      canEdit: tablePermissions?.can_edit || false,
      canDelete: tablePermissions?.can_delete || false
    };
  }

  return { canAdd: false, canEdit: false, canDelete: false };
};
