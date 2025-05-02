
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmployeeFormValues } from "../types/EmployeeTypes";

export const useEmployeeMutations = () => {
  const queryClient = useQueryClient();

  // Create mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (newEmployee: EmployeeFormValues) => {
      // Ensure empno is present since it's required by the database
      if (!newEmployee.empno) {
        throw new Error("Employee number is required");
      }
      
      const { data, error } = await supabase
        .from('employee')
        .insert({
          ...newEmployee,
          status: 'added',
          stamp: new Date().toISOString()
        })
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
      
      const { data, error } = await supabase
        .from('employee')
        .update({ 
          ...employee,
          status: 'edited',
          stamp: new Date().toISOString()
        })
        .eq('empno', employee.empno)
        .select();

      if (error) throw error;
      return data[0];
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
      const { error } = await supabase
        .from('employee')
        .update({ 
          status: 'deleted',
          stamp: new Date().toISOString()
        })
        .eq('empno', employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting employee: ${error.message}`);
    }
  });

  return { 
    createEmployeeMutation, 
    updateEmployeeMutation, 
    deleteEmployeeMutation 
  };
};
