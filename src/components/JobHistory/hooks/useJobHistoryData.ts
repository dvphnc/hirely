
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Employee, Job as JobType, Department as DepartmentType } from "@/types/supabase";
import { JobHistoryWithDetails } from "../types/JobHistoryTypes";

export const useJobHistoryData = (employee: Employee | null) => {
  const { data: jobHistory, isLoading } = useQuery({
    queryKey: ["jobHistory", employee?.empno],
    queryFn: async () => {
      if (!employee) return [];
      
      const { data, error } = await supabase
        .from("jobhistory")
        .select(`
          *,
          job:jobcode (
            jobdesc
          ),
          department:deptcode (
            deptname
          )
        `)
        .eq("empno", employee.empno as any)
        .order("effdate", { ascending: false });
      
      if (error) throw new Error(error.message);
      return data as unknown as JobHistoryWithDetails[];
    },
    enabled: !!employee,
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job")
        .select("*");
      
      if (error) throw new Error(error.message);
      // Fixed type casting to ensure compatibility with our Job type
      return data as unknown as JobType[];
    },
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("department")
        .select("*");
      
      if (error) throw new Error(error.message);
      // Fixed type casting
      return data as unknown as DepartmentType[];
    },
  });

  return {
    jobHistory,
    isLoading,
    jobs,
    departments
  };
};
