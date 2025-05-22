
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobHistoryFormValues } from "../../types/JobHistoryTypes";
import { usePermission } from "@/context/auth-context";
import { createAuditTrail } from "@/utils/auditTrail";

export const useUpdateJobHistory = (employeeEmpno: string | null | undefined) => {
  const queryClient = useQueryClient();
  const { canEdit } = usePermission('jobhistory');

  return useMutation({
    mutationFn: async (jobHistory: JobHistoryFormValues) => {
      // Check permissions before allowing the action
      if (!canEdit) {
        throw new Error("You don't have permission to edit job history records");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Also update the associated employee record to show activity
      if (jobHistory.empno) {
        console.log(`Updating employee ${jobHistory.empno} audit trail on job history update`);
        
        const { data: employeeData } = await supabase
          .from('employee')
          .update({ 
            status: 'edited', 
            updated_by: userId, 
            updated_at: new Date().toISOString() 
          } as any)
          .eq('empno', jobHistory.empno as any)
          .select();
          
        if (employeeData && employeeData[0]) {
          // Create audit trail for the employee update
          await createAuditTrail(employeeData[0], 'UPDATE', 'employee');
        }
        
        // Force a refresh of the employees query to show the updated status
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      }
      
      // Update the job history record
      const { data, error } = await supabase
        .from("jobhistory")
        .update({
          deptcode: jobHistory.deptcode,
          salary: jobHistory.salary,
          status: 'edited',
          updated_by: userId,
          updated_at: new Date().toISOString()
        } as any)
        .eq("empno", jobHistory.empno as any)
        .eq("jobcode", jobHistory.jobcode as any)
        .eq("effdate", jobHistory.effdate as any)
        .select();
      
      if (error) throw new Error(error.message);
      
      // Create audit trail for job history
      await createAuditTrail(data[0], 'UPDATE', 'jobhistory');
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobHistory", employeeEmpno] });
      queryClient.invalidateQueries({ queryKey: ["employees"] }); // Refresh employee data too
      toast.success("Job history updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating job history: ${error.message}`);
    },
  });
};
