
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmployeeFormValues } from "../types/EmployeeTypes";

export const useEmployeeMutations = () => {
  const queryClient = useQueryClient();

  const createEmployeeMutation = useMutation({
    mutationFn: async (newEmployee: EmployeeFormValues) => {
      const employeeToInsert = {
        empno: newEmployee.empno,
        lastname: newEmployee.lastname,
        firstname: newEmployee.firstname,
        gender: newEmployee.gender,
        birthdate: newEmployee.birthdate,
        hiredate: newEmployee.hiredate,
        sepdate: newEmployee.sepdate
      };
      
      const { data, error } = await supabase
        .from("employee")
        .insert(employeeToInsert)
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding employee: ${error.message}`);
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (employee: EmployeeFormValues) => {
      const employeeToUpdate = {
        empno: employee.empno,
        lastname: employee.lastname,
        firstname: employee.firstname,
        gender: employee.gender,
        birthdate: employee.birthdate,
        hiredate: employee.hiredate,
        sepdate: employee.sepdate
      };
      
      const { data, error } = await supabase
        .from("employee")
        .update(employeeToUpdate)
        .eq("empno", employee.empno)
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating employee: ${error.message}`);
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (empno: string) => {
      const { error } = await supabase
        .from("employee")
        .delete()
        .eq("empno", empno);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting employee: ${error.message}`);
    },
  });

  return {
    createEmployeeMutation,
    updateEmployeeMutation,
    deleteEmployeeMutation
  };
};
