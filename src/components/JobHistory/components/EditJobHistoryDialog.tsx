
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Employee } from "@/types/supabase";
import { Department, Job } from "@/types/supabase";
import EmployeeInfoDisplay from "./EmployeeInfoDisplay";
import EditJobHistoryForm from "./EditJobHistoryForm";
import { JobHistoryFormValues, JobHistoryWithDetails } from "../types/JobHistoryTypes";

interface EditJobHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  currentJobHistory: JobHistoryWithDetails | null;
  jobs: Job[] | undefined;
  departments: Department[] | undefined;
  onSubmit: (data: JobHistoryFormValues) => void;
  isSubmitting: boolean;
}

const EditJobHistoryDialog: React.FC<EditJobHistoryDialogProps> = ({
  isOpen,
  onOpenChange,
  employee,
  currentJobHistory,
  jobs,
  departments,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Job History</DialogTitle>
        </DialogHeader>
        
        <EmployeeInfoDisplay employee={employee} />
        
        <EditJobHistoryForm 
          currentJobHistory={currentJobHistory}
          jobs={jobs}
          departments={departments}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditJobHistoryDialog;
