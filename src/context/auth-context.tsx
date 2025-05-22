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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          setProfile(null);
          setPermissions([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (session?.user) {
        // Fetch user data after authentication
        fetchUserData();
      }
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
      setProfile(null);
      setPermissions([]);
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
  
  // Admins have all permissions
  if (isAdmin) {
    return { canAdd: true, canEdit: true, canDelete: true };
  }
  
  // Strictly enforce restrictions for 'user' role on specified restricted tables
  // regardless of checkbox settings in permissions
  if (profile?.role === 'user') {
    const restrictedTables = ['employee', 'jobhistory', 'job', 'department'];
    if (restrictedTables.includes(tableName.toLowerCase())) {
      console.log(`User with 'user' role denied permission for ${tableName} table`);
      return { canAdd: false, canEdit: false, canDelete: false };
    }
  }
  
  // For other tables or other user roles, check specific permissions
  const tablePermissions = permissions.find(p => 
    p.table_name.toLowerCase() === tableName.toLowerCase()
  );
  
  return {
    canAdd: tablePermissions?.can_add || false,
    canEdit: tablePermissions?.can_edit || false,
    canDelete: tablePermissions?.can_delete || false
  };
};
