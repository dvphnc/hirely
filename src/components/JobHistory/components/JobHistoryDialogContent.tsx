
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Employee } from "@/types/supabase";
import EmployeeInfoDisplay from "./EmployeeInfoDisplay";
import JobHistoryTable from "./JobHistoryTable";
import { JobHistoryWithDetails } from "../types/JobHistoryTypes";

interface JobHistoryDialogContentProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobHistory: JobHistoryWithDetails[] | undefined;
  isLoading: boolean;
  onEditClick: (jobHistory: JobHistoryWithDetails) => void;
  onDeleteClick: (jobHistory: JobHistoryWithDetails) => void;
  onAddClick: () => void;
  removingKey: string | null;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const JobHistoryDialogContent: React.FC<JobHistoryDialogContentProps> = ({
  employee,
  open,
  onOpenChange,
  jobHistory,
  isLoading,
  onEditClick,
  onDeleteClick,
  onAddClick,
  removingKey,
  canAdd,
  canEdit,
  canDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Job History</DialogTitle>
        </DialogHeader>
        
        <EmployeeInfoDisplay employee={employee} />
        
        <JobHistoryTable 
          jobHistory={jobHistory} 
          isLoading={isLoading}
          onEditClick={onEditClick} 
          onDeleteClick={onDeleteClick}
          removingKey={removingKey}
          canEdit={canEdit}
          canDelete={canDelete}
        />
        
        <div className="flex justify-end space-x-2">
          {canAdd ? (
            <Button onClick={onAddClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Job History
            </Button>
          ) : (
            <Button 
              disabled={true}
              className="opacity-50 cursor-not-allowed"
            > 
              <Plus className="mr-2 h-4 w-4" /> Add Job History
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
