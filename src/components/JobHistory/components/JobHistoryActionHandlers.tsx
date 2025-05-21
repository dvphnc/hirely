
import React from "react";
import { Employee } from "@/types/supabase";
import { JobHistoryFormValues, JobHistoryWithDetails } from "../types/JobHistoryTypes";
import { useJobHistoryMutations } from "../hooks/useJobHistoryMutations";
import { usePermission, useAuth } from "@/context/auth-context";
import { toast } from "sonner";

interface JobHistoryActionHandlersProps {
  employee: Employee | null;
  currentJobHistory: JobHistoryWithDetails | null;
  setCurrentJobHistory: (jobHistory: JobHistoryWithDetails | null) => void;
  setIsAddOpen: (open: boolean) => void;
  setIsEditOpen: (open: boolean) => void;
  setIsDeleteOpen: (open: boolean) => void;
  children: (props: {
    handleEditClick: (jobHistory: JobHistoryWithDetails) => void;
    handleDeleteClick: (jobHistory: JobHistoryWithDetails) => void;
    handleCreateJobHistory: (data: JobHistoryFormValues) => void;
    handleUpdateJobHistory: (data: JobHistoryFormValues) => void;
    handleDeleteJobHistory: () => void;
    createJobHistoryMutation: ReturnType<typeof useJobHistoryMutations>["createJobHistoryMutation"];
    updateJobHistoryMutation: ReturnType<typeof useJobHistoryMutations>["updateJobHistoryMutation"];
    deleteJobHistoryMutation: ReturnType<typeof useJobHistoryMutations>["deleteJobHistoryMutation"];
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }) => React.ReactNode;
}

export const JobHistoryActionHandlers: React.FC<JobHistoryActionHandlersProps> = ({
  employee,
  currentJobHistory,
  setCurrentJobHistory,
  setIsAddOpen,
  setIsEditOpen,
  setIsDeleteOpen,
  children,
}) => {
  const { isAdmin } = useAuth();
  const { canAdd, canEdit, canDelete } = usePermission('jobhistory');
  const { 
    createJobHistoryMutation, 
    updateJobHistoryMutation, 
    deleteJobHistoryMutation 
  } = useJobHistoryMutations(employee?.empno);

  const handleEditClick = (jobHistory: JobHistoryWithDetails) => {
    if (!canEdit && !isAdmin) { 
      toast.error("You don't have permission to edit job history.");
      return; 
    }
    setCurrentJobHistory(jobHistory);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (jobHistory: JobHistoryWithDetails) => {
    if (!canDelete && !isAdmin) { 
      toast.error("You don't have permission to delete job history.");
      return;
    }
    setCurrentJobHistory(jobHistory);
    setIsDeleteOpen(true);
  };

  const handleCreateJobHistory = (data: JobHistoryFormValues) => {
    if (!canAdd && !isAdmin) {
      toast.error("You don't have permission to add job history.");
      return;
    }
    createJobHistoryMutation.mutate(data, {
      onSuccess: () => {
        setIsAddOpen(false);
      }
    });
  };

  const handleUpdateJobHistory = (data: JobHistoryFormValues) => {
    if (!canEdit && !isAdmin) {
      toast.error("You don't have permission to update job history.");
      return;
    }
    updateJobHistoryMutation.mutate(data, {
      onSuccess: () => {
        setIsEditOpen(false);
        setCurrentJobHistory(null);
      }
    });
  };

  const handleDeleteJobHistory = () => {
    if (!canDelete && !isAdmin) {
      toast.error("You don't have permission to delete job history.");
      return;
    }
    
    // Make sure we have a current job history item to delete
    if (currentJobHistory) {
      deleteJobHistoryMutation.mutate(currentJobHistory, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setCurrentJobHistory(null);
        }
      });
    }
  };

  return (
    <>
      {children({
        handleEditClick,
        handleDeleteClick,
        handleCreateJobHistory,
        handleUpdateJobHistory,
        handleDeleteJobHistory,
        createJobHistoryMutation,
        updateJobHistoryMutation,
        deleteJobHistoryMutation,
        canAdd: canAdd || isAdmin,
        canEdit: canEdit || isAdmin,
        canDelete: canDelete || isAdmin,
      })}
    </>
  );
};
