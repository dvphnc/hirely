
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobHistoryWithDetails } from "./JobHistoryDialog";

export function useJobHistoryDeleteMutation(employeeEmpno: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobHistory: JobHistoryWithDetails) => {
      const { error } = await supabase
        .from("jobhistory")
        .delete()
        .eq("empno", jobHistory.empno)
        .eq("jobcode", jobHistory.jobcode)
        .eq("effdate", jobHistory.effdate);
      if (error) throw new Error(error.message);
      return { success: true, jobHistory };
    },
    onMutate: async (jobHistoryToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["jobHistory", employeeEmpno] });
      const previousJobHistory = queryClient.getQueryData(["jobHistory", employeeEmpno]);
      if (previousJobHistory) {
        queryClient.setQueryData(
          ["jobHistory", employeeEmpno],
          (old?: JobHistoryWithDetails[]) =>
            old
              ? old.filter(
                  item =>
                    !(
                      item.empno === jobHistoryToDelete.empno &&
                      item.jobcode === jobHistoryToDelete.jobcode &&
                      item.effdate === jobHistoryToDelete.effdate
                    )
                )
              : []
        );
      }
      return { previousJobHistory };
    },
    onSuccess: (_, __, context) => {
      toast.success("Job history deleted successfully");
    },
    onError: (error, _, context) => {
      if (context?.previousJobHistory) {
        queryClient.setQueryData(["jobHistory", employeeEmpno], context.previousJobHistory);
      }
      toast.error(`Error deleting job history: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["jobHistory", employeeEmpno] });
    },
  });
}
