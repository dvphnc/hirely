
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/context/auth-context';

export const useUserManagement = () => {
  const queryClient = useQueryClient();

  // Set a specific user to a regular user role
  const setUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
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

  // Set the specified user to regular role
  const setSpecificUserAsRegular = useCallback(async () => {
    try {
      const targetUserId = '17ae5ffe-39f5-44ca-96f1-56963d1c762d';
      
      // First check if this user's profile exists and what their current role is
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error("Failed to check user profile:", profileError);
        return;
      }

      // If user doesn't exist or is not already a regular user, update the role
      if (!profileData || profileData.role !== 'user') {
        await setUserRole.mutateAsync({ 
          userId: targetUserId, 
          role: 'user' 
        });
      }
    } catch (error) {
      console.error("Failed to set specific user role:", error);
    }
  }, [setUserRole]);

  return {
    setUserRole,
    setSpecificUserAsRegular
  };
};
