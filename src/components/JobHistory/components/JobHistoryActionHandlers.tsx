
import React from "react";
import { Employee } from "@/types/supabase";
import { JobHistoryFormValues, JobHistoryWithDetails } from "../types/JobHistoryTypes";
import { useJobHistoryMutations } from "../hooks/useJobHistoryMutations";
import { usePermission } from "@/context/auth-context";

interface JobHistoryActionHandlersProps {
  employee: Employee | null;
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
  setCurrentJobHistory,
  setIsAddOpen,
  setIsEditOpen,
  setIsDeleteOpen,
  children,
}) => {
  const { canAdd, canEdit, canDelete } = usePermission('jobhistory');
  const { 
    createJobHistoryMutation, 
    updateJobHistoryMutation, 
    deleteJobHistoryMutation 
  } = useJobHistoryMutations(employee?.empno);

  const handleEditClick = (jobHistory: JobHistoryWithDetails) => {
    if (!canEdit) { 
      console.warn("User does not have permission to edit job history.");
      return; 
    }
    setCurrentJobHistory(jobHistory);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (jobHistory: JobHistoryWithDetails) => {
    if (!canDelete) { 
      console.warn("User does not have permission to delete job history.");
      return;
    }
    setCurrentJobHistory(jobHistory);
    setIsDeleteOpen(true);
  };

  const handleCreateJobHistory = (data: JobHistoryFormValues) => {
    if (!canAdd) {
      console.warn("User does not have permission to add job history.");
      return;
    }
    createJobHistoryMutation.mutate(data, {
      onSuccess: () => {
        setIsAddOpen(false);
      }
    });
  };

  const handleUpdateJobHistory = (data: JobHistoryFormValues) => {
    if (!canEdit) {
      console.warn("User does not have permission to update job history via form submission.");
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
    if (!canDelete) {
      console.warn("User does not have permission to delete job history via confirmation.");
      return;
    }
    deleteJobHistoryMutation.mutate(createJobHistoryMutation.variables, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setCurrentJobHistory(null);
      }
    });
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
        canAdd,
        canEdit,
        canDelete,
      })}
    </>
  );
};
