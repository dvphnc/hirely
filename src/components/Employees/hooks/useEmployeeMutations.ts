
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmployeeFormValues } from "../types/EmployeeTypes";
import { updateAuditTrail } from "@/utils/auditTrail";

export const useEmployeeMutations = () => {
  const queryClient = useQueryClient();

  // Create mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (newEmployee: EmployeeFormValues) => {
      // Ensure empno is present since it's required by the database
      if (!newEmployee.empno) {
        throw new Error("Employee number is required");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('employee')
        .insert([
          {
            empno: newEmployee.empno,
            firstname: newEmployee.firstname,
            lastname: newEmployee.lastname,
            gender: newEmployee.gender,
            birthdate: newEmployee.birthdate,
            hiredate: newEmployee.hiredate,
            sepdate: newEmployee.sepdate,
            status: 'added',
            stamp: new Date().toISOString(),
            updated_by: userId,
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee added successfully');
    },
    onError: (error: any) => {
      toast.error(`Error adding employee: ${error.message}`);
    }
  });

  // Update mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async (employee: EmployeeFormValues) => {
      // Ensure empno is present since it's required for updates
      if (!employee.empno) {
        throw new Error("Employee number is required for updates");
      }
      
      await updateAuditTrail('employee', employee.empno, 'empno', {
        firstname: employee.firstname,
        lastname: employee.lastname,
        gender: employee.gender,
        birthdate: employee.birthdate,
        hiredate: employee.hiredate,
        sepdate: employee.sepdate,
        status: 'edited'
      });
      
      const { data, error } = await supabase
        .from('employee')
        .select()
        .eq('empno', employee.empno)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating employee: ${error.message}`);
    }
  });

  // Delete mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      // Soft delete - update status to deleted
      await updateAuditTrail('employee', employeeId, 'empno', {
        status: 'deleted'
      });
      
      const { data, error } = await supabase
        .from('employee')
        .select()
        .eq('empno', employeeId)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting employee: ${error.message}`);
    }
  });

  // Restore mutation
  const restoreEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      await updateAuditTrail('employee', employeeId, 'empno', {
        status: 'restored'
      });
      
      const { data, error } = await supabase
        .from('employee')
        .select()
        .eq('empno', employeeId)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee restored successfully');
    },
    onError: (error: any) => {
      toast.error(`Error restoring employee: ${error.message}`);
    }
  });

  return { 
    createEmployeeMutation, 
    updateEmployeeMutation, 
    deleteEmployeeMutation,
    restoreEmployeeMutation
  };
};
