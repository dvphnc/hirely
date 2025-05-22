
import React, { createContext, useContext, useState, useEffect } from 'react';
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

// Helper function to clean up auth state in localStorage
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
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

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Fetch user permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id);

      if (permissionsError) throw permissionsError;

      let userPermissions = permissionsData as UserPermission[] || [];
      
      // Check if we need to create default permissions
      if (userPermissions.length === 0) {
        // Create default permissions for a new user
        const defaultPermissions = MANAGED_TABLES.map(table => ({
          user_id: user.id,
          table_name: table.name,
          can_add: true,
          can_edit: true,
          can_delete: true
        }));
        
        // If there are tables without permissions, create default ones
        if (defaultPermissions.length > 0) {
          const { error: insertError } = await supabase
            .from('user_permissions')
            .insert(defaultPermissions);
            
          if (!insertError) {
            // Re-fetch permissions after creating defaults
            const { data: refreshedPermissions } = await supabase
              .from('user_permissions')
              .select('*')
              .eq('user_id', user.id);
              
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
  };

  useEffect(() => {
    // Set up auth state listener FIRST to prevent missing any auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state change event:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Don't make immediate supabase calls in the callback to prevent deadlocks
        if (newSession?.user) {
          // Defer loading user data to prevent potential deadlocks
          setTimeout(() => {
            fetchUserData();
          }, 0);
        } else if (!newSession) {
          // Clear profile and permissions when session is gone
          setProfile(null);
          setPermissions([]);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        setIsLoading(false);
        
        if (existingSession?.user) {
          // Ensure access token is valid by refreshing session
          try {
            await supabase.auth.refreshSession();
            // Fetch user data after ensuring we have a valid session
            await fetchUserData();
          } catch (error) {
            console.error('Error refreshing session:', error);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
      }
    };
    
    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Clean up existing auth state to prevent conflicts
      cleanupAuthState();
      
      // Attempt to sign out globally before signing in
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Global sign out failed, continuing with login');
      }
      
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
        // Fetch user profile to check if blocked
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          toast({
            variant: "destructive",
            title: "Error fetching profile",
            description: profileError.message,
          });
          return false;
        }

        // Handle blocked users
        if (profileData.role === 'blocked') {
          // Sign out the user immediately
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Account blocked",
            description: "Your account has been blocked. Please contact an administrator.",
          });
          return false;
        }

        setProfile(profileData as UserProfile);
        
        // Fetch user permissions
        const { data: permissionsData } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', data.user.id);
        
        let userPermissions = permissionsData as UserPermission[] || [];
        
        // If no permissions exist, create default permissions
        if (!userPermissions || userPermissions.length === 0) {
          // Create default permissions for all managed tables
          const defaultPermissions = MANAGED_TABLES.map(table => ({
            user_id: data.user.id,
            table_name: table.name,
            can_add: true,
            can_edit: true,
            can_delete: true
          }));
          
          if (defaultPermissions.length > 0) {
            await supabase.from('user_permissions').insert(defaultPermissions);
            
            // Re-fetch permissions after creating defaults
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
      // Clean up existing auth state first
      cleanupAuthState();
      
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
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear state
      setProfile(null);
      setPermissions([]);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      
      // Force a page refresh after logout for a clean state
      window.location.href = '/signin';
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
  
  // Admins have all permissions regardless of checkbox settings
  if (isAdmin) {
    return { canAdd: true, canEdit: true, canDelete: true };
  }
  
  // For regular users, check their specific permissions based on checkbox settings
  const tablePermissions = permissions.find(p => 
    p.table_name.toLowerCase() === tableName.toLowerCase()
  );
  
  // If 'user' role, strictly enforce permissions based on checkbox settings
  if (profile?.role === 'user') {
    // If no permissions found or permissions are unchecked, deny all actions
    return {
      canAdd: tablePermissions?.can_add || false,
      canEdit: tablePermissions?.can_edit || false,
      canDelete: tablePermissions?.can_delete || false
    };
  }
  
  // Default fallback - deny all if no matching permissions found
  return {
    canAdd: false,
    canEdit: false,
    canDelete: false
  };
};
