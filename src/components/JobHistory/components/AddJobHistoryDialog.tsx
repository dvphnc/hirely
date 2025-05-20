
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Employee } from "@/types/supabase";
import { Department, Job } from "@/types/supabase";
import EmployeeInfoDisplay from "./EmployeeInfoDisplay";
import AddJobHistoryForm from "./AddJobHistoryForm";
import { JobHistoryFormValues } from "../types/JobHistoryTypes";

interface AddJobHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  jobs: Job[] | undefined;
  departments: Department[] | undefined;
  onSubmit: (data: JobHistoryFormValues) => void;
  isSubmitting: boolean;
}

const AddJobHistoryDialog: React.FC<AddJobHistoryDialogProps> = ({
  isOpen,
  onOpenChange,
  employee,
  jobs,
  departments,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Job History</DialogTitle>
        </DialogHeader>
        
        <EmployeeInfoDisplay employee={employee} />
        
        <AddJobHistoryForm 
          employeeEmpno={employee?.empno}
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

export default AddJobHistoryDialog;
