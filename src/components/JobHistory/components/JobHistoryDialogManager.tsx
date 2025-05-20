
import React, { useState, useEffect, useRef } from "react";
import { Employee } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { JobHistoryWithDetails } from "../types/JobHistoryTypes";

interface JobHistoryDialogManagerProps {
  employee: Employee | null;
  open: boolean;
  children: (props: {
    isAddOpen: boolean;
    setIsAddOpen: (open: boolean) => void;
    isEditOpen: boolean;
    setIsEditOpen: (open: boolean) => void;
    isDeleteOpen: boolean;
    setIsDeleteOpen: (open: boolean) => void;
    currentJobHistory: JobHistoryWithDetails | null;
    setCurrentJobHistory: (jobHistory: JobHistoryWithDetails | null) => void;
    removingKey: string | null;
  }) => React.ReactNode;
}

export const JobHistoryDialogManager: React.FC<JobHistoryDialogManagerProps> = ({
  employee,
  open,
  children,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentJobHistory, setCurrentJobHistory] = useState<JobHistoryWithDetails | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  const queryClient = useQueryClient();

  // Handle channel subscription for real-time updates
  useEffect(() => {
    if (!employee?.empno || !open) return;
    
    // Clean up any existing channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    const channel = supabase
      .channel(`job-history-changes-${employee.empno}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobhistory',
          filter: `empno=eq.${employee.empno}`
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const deleted = payload.old;
            const rowKey = `${deleted.empno}-${deleted.jobcode}-${deleted.effdate}`;
            setRemovingKey(rowKey);

            setTimeout(() => {
              setRemovingKey(null);
              queryClient.invalidateQueries({ queryKey: ["jobHistory", employee.empno] });
            }, 100);
          } else {
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ["jobHistory", employee.empno] });
            }, 100);
          }
        }
      )
      .subscribe();
      
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [employee?.empno, queryClient, open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => {
        setIsAddOpen(false);
        setIsEditOpen(false);
        setIsDeleteOpen(false);
        setCurrentJobHistory(null);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <>
      {children({
        isAddOpen,
        setIsAddOpen,
        isEditOpen,
        setIsEditOpen,
        isDeleteOpen,
        setIsDeleteOpen,
        currentJobHistory,
        setCurrentJobHistory,
        removingKey,
      })}
    </>
  );
};
