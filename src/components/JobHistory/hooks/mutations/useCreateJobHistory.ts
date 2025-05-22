
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { JobHistoryFormValues } from "../../types/JobHistoryTypes";
import { usePermission } from "@/context/auth-context";
import { createAuditTrail } from "@/utils/auditTrail";

export const useCreateJobHistory = (employeeEmpno: string | null | undefined) => {
  const queryClient = useQueryClient();
  const { canAdd } = usePermission('jobhistory');

  return useMutation({
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

      // Always update the employee record to show activity regardless of user role
      if (newJobHistory.empno) {
        try {
          console.log(`Updating employee ${newJobHistory.empno} audit trail on job history creation`);
          // Update employee status and create audit trail
          const { data: employeeData } = await supabase
            .from('employee')
            .update({ 
              status: 'edited', 
              updated_by: userId, 
              updated_at: new Date().toISOString() 
            } as any)
            .eq('empno', newJobHistory.empno as any)
            .select();
            
          if (employeeData && employeeData[0]) {
            // Create audit trail for the employee update
            await createAuditTrail(employeeData[0], 'UPDATE', 'employee');
          }
          
          // Force a refresh of the employees query to show the updated status
          queryClient.invalidateQueries({ queryKey: ["employees"] });
        } catch (error) {
          console.error("Error updating employee audit trail:", error);
        }
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
        .insert(jobHistoryToInsert as any)
        .select();
      
      if (error) throw new Error(error.message);
      
      // Create audit trail for job history
      await createAuditTrail(data[0], 'INSERT', 'jobhistory');
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobHistory", employeeEmpno] });
      queryClient.invalidateQueries({ queryKey: ["employees"] }); // Refresh employee data too
      toast.success("Job history entry added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding job history: ${error.message}`);
    },
  });
};
