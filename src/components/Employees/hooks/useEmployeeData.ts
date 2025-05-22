
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Employee } from "@/types/supabase";

export const useEmployeeData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const {
    data: employees,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["employees", searchTerm, showDeleted],
    queryFn: async () => {
      console.log("Fetching employees:", { searchTerm, showDeleted });
      
      let query = supabase.from("employee").select("*");
      
      if (!showDeleted) {
        // If not showing deleted, exclude them - using 'eq' with explicit type casting
        query = query.neq("status" as any, "deleted");
      }
      
      if (searchTerm) {
        query = query.or(
          `firstname.ilike.%${searchTerm}%,lastname.ilike.%${searchTerm}%,empno.ilike.%${searchTerm}%`
        );
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }

      // Cast the result to the Employee[] type to fix TypeScript issues
      return data as unknown as Employee[];
    },
    staleTime: 60000, // 1 minute
  });

  return {
    employees,
    isLoading,
    isError,
    refetch,
    searchTerm,
    setSearchTerm,
    showDeleted,
    setShowDeleted,
  };
};
