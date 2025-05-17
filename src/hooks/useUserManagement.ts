
import { useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/context/auth-context';

export const useUserManagement = () => {
  const queryClient = useQueryClient();

  // Fetch actual emails from auth.users table using edge function
  const { data: userEmails, isLoading: isLoadingEmails } = useQuery({
    queryKey: ['user-emails'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-user-emails');
      
      if (error) {
        console.error('Error fetching user emails:', error);
        throw error;
      }
      
      return data as Record<string, string>;
    },
  });

  // Set a specific user to a regular user role
  const setUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const currentUser = await supabase.auth.getUser();
      const currentUserId = currentUser.data.user?.id;
      
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role, 
          updated_at: new Date().toISOString(), 
          updated_by: currentUserId 
        })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, role };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User role updated to ${data.role}`);
    },
    onError: (error: any) => {
      toast.error(`Error updating role: ${error.message}`);
      console.error("Error updating role:", error);
    },
  });

  // Delete a user completely (only available to admins)
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Error deleting user: ${error.message}`);
      console.error("Error deleting user:", error);
    },
  });

  return {
    userEmails,
    isLoadingEmails,
    setUserRole,
    deleteUser,
  };
};
