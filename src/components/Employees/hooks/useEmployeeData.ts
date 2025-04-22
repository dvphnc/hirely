
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/supabase";

export const useEmployeeData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [nextEmpNo, setNextEmpNo] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedShowInactive = localStorage.getItem('showInactive') === 'true';
    setShowInactive(savedShowInactive);
  }, []);

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee")
        .select("*")
        .order('empno', { ascending: true });
      
      if (error) throw new Error(error.message);
      return data as Employee[];
    },
  });

  useEffect(() => {
    if (employees && employees.length > 0) {
      const sortedEmployees = [...employees].sort((a, b) => {
        return a.empno.localeCompare(b.empno);
      });
      
      const lastEmpNo = sortedEmployees[sortedEmployees.length - 1].empno;
      const numericPart = parseInt(lastEmpNo, 10);
      
      if (!isNaN(numericPart)) {
        const nextNumber = numericPart + 1;
        setNextEmpNo(nextNumber.toString().padStart(lastEmpNo.length, '0'));
      } else {
        setNextEmpNo(lastEmpNo + '1');
      }
    } else {
      setNextEmpNo("00001");
    }
  }, [employees]);

  useEffect(() => {
    const channel = supabase
      .channel('employee-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["employees"] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filteredEmployees = employees?.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      employee.empno.toLowerCase().includes(searchLower) ||
      (employee.lastname && employee.lastname.toLowerCase().includes(searchLower)) ||
      (employee.firstname && employee.firstname.toLowerCase().includes(searchLower));
    
    const matchesStatus = showInactive || !employee.sepdate;
    
    return matchesSearch && matchesStatus;
  });

  return {
    employees: filteredEmployees,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    showInactive,
    setShowInactive,
    nextEmpNo
  };
};
