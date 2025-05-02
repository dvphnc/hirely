
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobHistoryFormValues, JobHistoryWithDetails } from "../types/JobHistoryTypes";

export const useJobHistoryMutations = (employeeEmpno: string | null | undefined) => {
  const queryClient = useQueryClient();

  const createJobHistoryMutation = useMutation({
    mutationFn: async (newJobHistory: JobHistoryFormValues) => {
      const jobHistoryToInsert = {
        empno: newJobHistory.empno,
        jobcode: newJobHistory.jobcode,
        deptcode: newJobHistory.deptcode,
        effdate: newJobHistory.effdate,
        salary: newJobHistory.salary,
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
      const jobHistoryToUpdate = {
        empno: jobHistory.empno,
        jobcode: jobHistory.jobcode,
        deptcode: jobHistory.deptcode,
        effdate: jobHistory.effdate,
        salary: jobHistory.salary,
      };
      
      const { data, error } = await supabase
        .from("jobhistory")
        .update(jobHistoryToUpdate)
        .eq("empno", jobHistory.empno)
        .eq("jobcode", jobHistory.jobcode)
        .eq("effdate", jobHistory.effdate)
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
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
