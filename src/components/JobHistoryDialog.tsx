
import React from "react";
import { Employee } from "@/types/supabase";
import { useJobHistoryData } from "./JobHistory/hooks/useJobHistoryData";
import { JobHistoryDialogManager } from "./JobHistory/components/JobHistoryDialogManager";
import { JobHistoryActionHandlers } from "./JobHistory/components/JobHistoryActionHandlers";
import { JobHistoryDialogContent } from "./JobHistory/components/JobHistoryDialogContent";
import AddJobHistoryDialog from "./JobHistory/components/AddJobHistoryDialog";
import EditJobHistoryDialog from "./JobHistory/components/EditJobHistoryDialog";
import DeleteJobHistoryDialog from "./JobHistory/components/DeleteJobHistoryDialog";

interface JobHistoryDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobHistoryDialog = ({ employee, open, onOpenChange }: JobHistoryDialogProps) => {
  const { jobHistory, isLoading, jobs, departments } = useJobHistoryData(employee);

  return (
    <JobHistoryDialogManager employee={employee} open={open}>
      {({ 
        isAddOpen, setIsAddOpen,
        isEditOpen, setIsEditOpen,
        isDeleteOpen, setIsDeleteOpen,
        currentJobHistory, setCurrentJobHistory,
        removingKey 
      }) => (
        <JobHistoryActionHandlers
          employee={employee}
          currentJobHistory={currentJobHistory} // Pass the currentJobHistory prop
          setCurrentJobHistory={setCurrentJobHistory}
          setIsAddOpen={setIsAddOpen}
          setIsEditOpen={setIsEditOpen}
          setIsDeleteOpen={setIsDeleteOpen}
        >
          {({ 
            handleEditClick, handleDeleteClick,
            handleCreateJobHistory, handleUpdateJobHistory, handleDeleteJobHistory,
            createJobHistoryMutation, updateJobHistoryMutation, deleteJobHistoryMutation,
            canAdd, canEdit, canDelete
          }) => (
            <>
              <JobHistoryDialogContent
                employee={employee}
                open={open}
                onOpenChange={onOpenChange}
                jobHistory={jobHistory}
                isLoading={isLoading}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onAddClick={() => setIsAddOpen(true)}
                removingKey={removingKey}
                canAdd={canAdd}
                canEdit={canEdit}
                canDelete={canDelete}
              />

              <AddJobHistoryDialog
                isOpen={isAddOpen}
                onOpenChange={setIsAddOpen}
                employee={employee}
                jobs={jobs}
                departments={departments}
                onSubmit={handleCreateJobHistory}
                isSubmitting={createJobHistoryMutation.isPending}
              />

              <EditJobHistoryDialog
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                employee={employee}
                currentJobHistory={currentJobHistory}
                jobs={jobs}
                departments={departments}
                onSubmit={handleUpdateJobHistory}
                isSubmitting={updateJobHistoryMutation.isPending}
              />

              <DeleteJobHistoryDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                employee={employee}
                currentJobHistory={currentJobHistory}
                onDelete={handleDeleteJobHistory}
                isDeleting={deleteJobHistoryMutation.isPending}
              />
            </>
          )}
        </JobHistoryActionHandlers>
      )}
    </JobHistoryDialogManager>
  );
};

export default JobHistoryDialog;
