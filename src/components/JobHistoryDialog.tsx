import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Employee } from "@/types/supabase";
import EmployeeInfoDisplay from "./JobHistory/components/EmployeeInfoDisplay";
import JobHistoryTable from "./JobHistory/components/JobHistoryTable";
import { useJobHistoryData } from "./JobHistory/hooks/useJobHistoryData";
import { useJobHistoryMutations } from "./JobHistory/hooks/useJobHistoryMutations";
import AddJobHistoryForm from "./JobHistory/components/AddJobHistoryForm";
import EditJobHistoryForm from "./JobHistory/components/EditJobHistoryForm";
import DeleteJobHistoryDialog from "./JobHistory/components/DeleteJobHistoryDialog";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JobHistoryFormValues, JobHistoryWithDetails } from "./JobHistory/types/JobHistoryTypes";
import { usePermission } from "@/context/auth-context"; // Import usePermission

interface JobHistoryDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobHistoryDialog = ({ employee, open, onOpenChange }: JobHistoryDialogProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentJobHistory, setCurrentJobHistory] = useState<JobHistoryWithDetails | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  // Get permissions for 'job_history' table
  const { canAdd, canEdit, canDelete } = usePermission('job_history'); 
  
  const { jobHistory, isLoading, jobs, departments } = useJobHistoryData(employee);
  const { createJobHistoryMutation, updateJobHistoryMutation, deleteJobHistoryMutation } = useJobHistoryMutations(employee?.empno);
  
  const queryClient = useQueryClient();

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
          table: 'jobhistory', // Ensure this matches your actual table name
          filter: `empno=eq.${employee.empno}`
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const deleted = payload.old;
            const rowKey = `${deleted.empno}-${deleted.jobcode}-${deleted.effdate}`;
            setRemovingKey(rowKey);

            // Use a shorter timeout for deletion animations
            setTimeout(() => {
              setRemovingKey(null);
              queryClient.invalidateQueries({ queryKey: ["jobHistory", employee.empno] });
            }, 100);
          } else {
            // Use a shorter timeout for other updates
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

  const handleEditClick = (jobHistory: JobHistoryWithDetails) => {
    // Add permission check here:
    if (!canEdit) {
      // Optionally show a toast notification or alert
      console.warn("User does not have permission to edit job history.");
      return; 
    }
    setCurrentJobHistory(jobHistory);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (jobHistory: JobHistoryWithDetails) => {
    // Add permission check here:
    if (!canDelete) {
      // Optionally show a toast notification or alert
      console.warn("User does not have permission to delete job history.");
      return;
    }
    setCurrentJobHistory(jobHistory);
    setIsDeleteOpen(true);
  };

  const handleCreateJobHistory = (data: JobHistoryFormValues) => {
    // This is called AFTER the add button is clicked, but the button itself is disabled
    // Still good to have this check for robustness, though client-side UI prevents it
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
    if (currentJobHistory) {
      deleteJobHistoryMutation.mutate(currentJobHistory, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setCurrentJobHistory(null);
        }
      });
    }
  };

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Job History</DialogTitle>
          </DialogHeader>
          
          <EmployeeInfoDisplay employee={employee} />
          
          <JobHistoryTable 
            jobHistory={jobHistory} 
            isLoading={isLoading}
            onEditClick={handleEditClick} // handleEditClick now has the permission check
            onDeleteClick={handleDeleteClick} // handleDeleteClick now has the permission check
            removingKey={removingKey}
            // Pass permissions to JobHistoryTable if it also renders the buttons directly
            canEdit={canEdit} 
            canDelete={canDelete}
          />
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsAddOpen(true)} disabled={!canAdd}> {/* Disable 'Add' button */}
              <Plus className="mr-2 h-4 w-4" /> Add Job History
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Job History</DialogTitle>
          </DialogHeader>
          
          <EmployeeInfoDisplay employee={employee} />
          
          <AddJobHistoryForm 
            employeeEmpno={employee?.empno}
            jobs={jobs}
            departments={departments}
            onSubmit={handleCreateJobHistory}
            isSubmitting={createJobHistoryMutation.isPending}
            onCancel={() => setIsAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Job History</DialogTitle>
          </DialogHeader>
          
          <EmployeeInfoDisplay employee={employee} />
          
          <EditJobHistoryForm 
            currentJobHistory={currentJobHistory}
            jobs={jobs}
            departments={departments}
            onSubmit={handleUpdateJobHistory}
            isSubmitting={updateJobHistoryMutation.isPending}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <DeleteJobHistoryDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        employee={employee}
        currentJobHistory={currentJobHistory}
        onDelete={handleDeleteJobHistory}
        isDeleting={deleteJobHistoryMutation.isPending}
      />
    </>
  );
};

export default JobHistoryDialog;
