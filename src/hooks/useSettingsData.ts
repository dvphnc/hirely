
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export const useSettingsData = () => {
  // States for employee and department data
  const [departmentCounts, setDepartmentCounts] = useState<{name: string; count: number}[]>([]);
  const [employeeStatusData, setEmployeeStatusData] = useState<{name: string; value: number}[]>([]);
  
  // Fetch employees data
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data;
    },
  });
  
  // Fetch departments data
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("department")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data;
    },
  });
  
  // Fetch job history data
  const { data: jobHistory, isLoading: jobHistoryLoading } = useQuery({
    queryKey: ["jobHistory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobhistory")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data;
    },
  });

  // Calculate chart data when data is loaded
  useEffect(() => {
    if (employees && departments && jobHistory) {
      // Calculate department distribution
      const deptData = departments.map(dept => {
        const empInDept = employees?.filter(emp => {
          const latestJob = jobHistory
            .filter(job => job.empno === emp.empno)
            .sort((a, b) => new Date(b.effdate).getTime() - new Date(a.effdate).getTime())[0];
          return latestJob && latestJob.deptcode === dept.deptcode;
        }).length || 0;
        
        return {
          name: dept.deptname || dept.deptcode,
          count: empInDept
        };
      });
      setDepartmentCounts(deptData);
      
      // Calculate employee status (active vs inactive)
      const activeCount = employees.filter(emp => !emp.sepdate).length;
      const inactiveCount = employees.filter(emp => emp.sepdate).length;
      setEmployeeStatusData([
        { name: "Active", value: activeCount },
        { name: "Inactive", value: inactiveCount }
      ]);
    }
  }, [employees, departments, jobHistory]);

  return {
    employees,
    departments,
    jobHistory,
    employeesLoading,
    departmentsLoading,
    jobHistoryLoading,
    departmentCounts,
    employeeStatusData
  };
};

export default useSettingsData;
