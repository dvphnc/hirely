
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

  // Enhanced realtime subscription with improved handling
  useEffect(() => {
    // Create channel for employee changes
    const employeeChannel = supabase
      .channel('employee-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee'
        },
        (payload) => {
          console.log('Employee table change detected:', payload);
          // Immediately invalidate query to refresh data
          queryClient.invalidateQueries({ queryKey: ["employees"] });
          
          // Additional invalidation after a short delay to ensure changes are visible
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
          }, 500);
        }
      )
      .subscribe();
      
    // Also subscribe to job history changes as they affect employee statuses
    const jobHistoryChannel = supabase
      .channel('jobhistory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobhistory'
        },
        (payload) => {
          // When job history changes, refresh employee data as well
          console.log('Job history change detected, refreshing employee data:', payload);
          
          // Get the employee number from the payload to refresh specific employee data
          const empno = payload.new?.empno || payload.old?.empno;
          if (empno) {
            console.log(`Refreshing data for employee ${empno}`);
          }
          
          // Refresh all employees data
          queryClient.invalidateQueries({ queryKey: ["employees"] });
          
          // Additional invalidation after a short delay
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
          }, 500);
        }
      )
      .subscribe();
      
    // Cleanup function to remove channels when component unmounts
    return () => {
      console.log('Removing realtime subscriptions');
      supabase.removeChannel(employeeChannel);
      supabase.removeChannel(jobHistoryChannel);
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
