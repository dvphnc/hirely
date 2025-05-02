
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/supabase";
import { useAuth } from "@/context/auth-context";

export const useEmployeeData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [nextEmpNo, setNextEmpNo] = useState("");
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedShowInactive = localStorage.getItem('showInactive') === 'true';
    setShowInactive(savedShowInactive);
  }, []);

  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ["employees", showDeleted],
    queryFn: async () => {
      let query = supabase
        .from("employee")
        .select("*")
        .order('empno', { ascending: true });
      
      // Only filter by deleted status if not showing deleted or if user is not admin
      if (!showDeleted || !isAdmin) {
        query = query.not('status', 'eq', 'deleted');
      }
      
      const { data, error } = await query;
      
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
    const matchesDeleted = showDeleted || employee.status !== 'deleted';
    
    return matchesSearch && matchesStatus && (isAdmin ? true : matchesDeleted);
  });

  return {
    employees: filteredEmployees,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    showInactive,
    setShowInactive,
    showDeleted,
    setShowDeleted,
    nextEmpNo,
    refetch
  };
};
