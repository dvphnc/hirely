
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';

export type UserRole = 'admin' | 'user' | 'blocked';

export interface UserProfile {
  id: string;
  name: string | null;
  role: UserRole;
}

export interface TablePermission {
  table_name: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  userProfile: UserProfile | null;
  permissions: TablePermission[];
  refreshPermissions: () => Promise<void>;
  isAdmin: boolean;
  isBlocked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<TablePermission[]>([]);
  const { toast } = useToast();

  const isAdmin = userProfile?.role === 'admin';
  const isBlocked = userProfile?.role === 'blocked';

  // Fetch user profile and permissions
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      if (profile) {
        setUserProfile({
          id: profile.id,
          name: profile.name,
          role: profile.role as UserRole
        });
      }

      // Only fetch permissions if the user is not blocked
      if (profile.role !== 'blocked') {
        const { data: perms, error: permsError } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', userId);

        if (permsError) {
          console.error('Error fetching permissions:', permsError);
          return;
        }

        if (perms) {
          setPermissions(perms as TablePermission[]);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const refreshPermissions = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // When the auth state changes, update the user profile
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setPermissions([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        return false;
      }

      if (data.user) {
        // After login, fetch the user profile
        await fetchUserProfile(data.user.id);
        
        // Check if user is blocked before showing welcome message
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'blocked') {
          // If user is blocked, log them out and show message
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account blocked",
            description: "Your account has been blocked. Please contact an administrator.",
          });
          return false;
        }

        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${data.user.email}!`,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: error.message || "An unexpected error occurred.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message,
        });
        return false;
      }

      if (data.user) {
        // Fix: Use the correct format for sonner toast
        sonnerToast.success("Account created", {
          description: "Check your email for the confirmation link."
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign up error",
        description: error.message || "An unexpected error occurred.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      signup, 
      logout, 
      isLoading, 
      userProfile, 
      permissions, 
      refreshPermissions,
      isAdmin,
      isBlocked
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

// Helper hook for permissions
export const usePermissions = (tableName: string) => {
  const { permissions, isAdmin } = useAuth();
  
  // Admins always have full permissions
  if (isAdmin) {
    return {
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: true
    };
  }
  
  // Find permissions for this table
  const tablePermissions = permissions.find(p => p.table_name === tableName);
  
  return {
    canView: tablePermissions?.can_view ?? false,
    canAdd: tablePermissions?.can_add ?? false,
    canEdit: tablePermissions?.can_edit ?? false,
    canDelete: tablePermissions?.can_delete ?? false
  };
};
