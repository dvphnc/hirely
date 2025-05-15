
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
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
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

  // No longer needed - Removing this function as requested
  const setSpecificUserAsRegular = useCallback(async () => {
    // This function is intentionally left empty
    // The functionality to set a specific user as regular has been removed
  }, []);

  return {
    userEmails,
    isLoadingEmails,
    setUserRole,
    setSpecificUserAsRegular // Keeping the function reference to avoid breaking code
  };
};
