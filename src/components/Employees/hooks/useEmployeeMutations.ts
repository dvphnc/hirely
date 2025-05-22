
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmployeeFormValues } from "../types/EmployeeTypes";
import { createAuditTrail } from "@/utils/auditTrail";
import { usePermission, useAuth } from "@/context/auth-context";

export const useEmployeeMutations = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const { canAdd, canEdit, canDelete } = usePermission('employee');

  // Create mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (newEmployee: EmployeeFormValues) => {
      // Permission check
      if (!canAdd && !isAdmin) {
        throw new Error("You do not have permission to add employees");
      }
      
      // Ensure empno is present since it's required by the database
      if (!newEmployee.empno) {
        throw new Error("Employee number is required");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Check if employee with this empno already exists
      const { data: existingEmployee } = await supabase
        .from('employee')
        .select('empno')
        .eq('empno', newEmployee.empno)
        .single();
        
      if (existingEmployee) {
        throw new Error(`Employee with ID ${newEmployee.empno} already exists`);
      }
      
      const insertData = {
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
      };
      
      // Insert the new employee with type cast to fix TypeScript issues
      const { data, error } = await supabase
        .from('employee')
        .insert(insertData)
        .select();

      if (error) throw error;
      
      // Create audit trail
      await createAuditTrail(data[0], 'INSERT', 'employee');
      
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
      // Permission check
      if (!canEdit && !isAdmin) {
        throw new Error("You do not have permission to edit employees");
      }
      
      // Ensure empno is present since it's required for updates
      if (!employee.empno) {
        throw new Error("Employee number is required for updates");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const updateData = {
        firstname: employee.firstname,
        lastname: employee.lastname,
        gender: employee.gender,
        birthdate: employee.birthdate,
        hiredate: employee.hiredate,
        sepdate: employee.sepdate,
        status: 'edited',
        updated_by: userId,
        updated_at: new Date().toISOString()
      };
      
      // Update the employee with type cast to fix TypeScript issues
      const { data, error } = await supabase
        .from('employee')
        .update(updateData)
        .eq('empno', employee.empno as any)
        .select();

      if (error) throw error;
      
      // Create audit trail
      await createAuditTrail(data[0], 'UPDATE', 'employee');
      
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
      // Permission check
      if (!canDelete && !isAdmin) {
        throw new Error("You do not have permission to delete employees");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // First get the employee record
      const { data: employeeData, error: fetchError } = await supabase
        .from('employee')
        .select('*')
        .eq('empno', employeeId as any)
        .single();
      
      if (fetchError) throw fetchError;
      
      const updateData = {
        status: 'deleted',
        updated_by: userId,
        updated_at: new Date().toISOString()
      };
      
      // Then update it to mark as deleted with type cast to fix TypeScript issues
      const { data, error } = await supabase
        .from('employee')
        .update(updateData)
        .eq('empno', employeeId as any)
        .select();

      if (error) throw error;
      
      // Create audit trail
      await createAuditTrail(employeeData, 'DELETE', 'employee');
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Employee deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Error deleting employee: ${error.message}`);
    }
  });

  // Restore mutation
  const restoreEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      // Only admins can restore
      if (!isAdmin) {
        throw new Error("Only administrators can restore deleted employees");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const updateData = {
        status: 'restored',
        updated_by: userId,
        updated_at: new Date().toISOString()
      };
      
      // Update with type cast to fix TypeScript issues
      const { data, error } = await supabase
        .from('employee')
        .update(updateData)
        .eq('empno', employeeId as any)
        .select();

      if (error) throw error;
      
      // Create audit trail
      await createAuditTrail(data[0], 'UPDATE', 'employee');
      
      return data[0];
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
