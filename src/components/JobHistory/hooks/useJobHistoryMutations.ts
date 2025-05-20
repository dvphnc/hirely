
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobHistoryFormValues, JobHistoryWithDetails } from "../types/JobHistoryTypes";
import { usePermission } from "@/context/auth-context";
import { updateAuditTrail } from "@/utils/auditTrail";

export const useJobHistoryMutations = (employeeEmpno: string | null | undefined) => {
  const queryClient = useQueryClient();
  const { canAdd, canEdit, canDelete } = usePermission('jobhistory');

  const createJobHistoryMutation = useMutation({
    mutationFn: async (newJobHistory: JobHistoryFormValues) => {
      // Check permissions before allowing the action
      if (!canAdd) {
        throw new Error("You don't have permission to add job history records");
      }

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const jobHistoryToInsert = {
        empno: newJobHistory.empno,
        jobcode: newJobHistory.jobcode,
        deptcode: newJobHistory.deptcode,
        effdate: newJobHistory.effdate,
        salary: newJobHistory.salary,
        status: 'added',
        updated_by: userId,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("jobhistory")
        .insert(jobHistoryToInsert)
        .select();
      
      if (error) throw new Error(error.message);
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobHistory", employeeEmpno] });
      toast.success("Job history entry added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding job history: ${error.message}`);
    },
  });

  const updateJobHistoryMutation = useMutation({
    mutationFn: async (jobHistory: JobHistoryFormValues) => {
      // Check permissions before allowing the action
      if (!canEdit) {
        throw new Error("You don't have permission to edit job history records");
      }
      
      await updateAuditTrail(
        "jobhistory", 
        `${jobHistory.empno}-${jobHistory.jobcode}-${jobHistory.effdate}`, 
        "combined_id",
        {
          empno: jobHistory.empno,
          jobcode: jobHistory.jobcode,
          deptcode: jobHistory.deptcode,
          effdate: jobHistory.effdate,
          salary: jobHistory.salary,
          status: 'edited'
        }
      );
      
      const { data, error } = await supabase
        .from("jobhistory")
        .select()
        .eq("empno", jobHistory.empno)
        .eq("jobcode", jobHistory.jobcode)
        .eq("effdate", jobHistory.effdate)
        .single();
      
      if (error) throw new Error(error.message);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobHistory", employeeEmpno] });
      toast.success("Job history updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating job history: ${error.message}`);
    },
  });

  const deleteJobHistoryMutation = useMutation({
    mutationFn: async (jobHistory: JobHistoryWithDetails) => {
      // Check permissions before allowing the action
      if (!canDelete) {
        throw new Error("You don't have permission to delete job history records");
      }
      
      const { error } = await supabase
        .from("jobhistory")
        .delete()
        .eq("empno", jobHistory.empno)
        .eq("jobcode", jobHistory.jobcode)
        .eq("effdate", jobHistory.effdate);
      
      if (error) throw new Error(error.message);
      return { success: true };
    },
    onMutate: async (jobHistoryToDelete) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["jobHistory", employeeEmpno] });
      
      // Snapshot the previous value
      const previousJobHistory = queryClient.getQueryData(["jobHistory", employeeEmpno]);
      
      // Optimistically update to the new value
      if (previousJobHistory) {
        queryClient.setQueryData(
          ["jobHistory", employeeEmpno],
          (old: JobHistoryWithDetails[] | undefined) => 
            old ? old.filter(
              item => !(
                item.empno === jobHistoryToDelete.empno && 
                item.jobcode === jobHistoryToDelete.jobcode && 
                item.effdate === jobHistoryToDelete.effdate
              )
            ) : []
        );
      }
      
      return { previousJobHistory };
    },
    onSuccess: () => {
      toast.success("Job history deleted successfully");
    },
    onError: (error, _, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJobHistory) {
        queryClient.setQueryData(["jobHistory", employeeEmpno], context.previousJobHistory);
      }
      toast.error(`Error deleting job history: ${error.message}`);
    },
    onSettled: () => {
      // Always make sure to refresh the data but with a very short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["jobHistory", employeeEmpno] });
      }, 50);
    },
  });

  return {
    createJobHistoryMutation,
    updateJobHistoryMutation,
    deleteJobHistoryMutation
  };
};
