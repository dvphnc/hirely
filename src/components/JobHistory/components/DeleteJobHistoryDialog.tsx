
import { Employee } from "@/types/supabase";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { JobHistoryWithDetails } from "../types/JobHistoryTypes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteJobHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  currentJobHistory: JobHistoryWithDetails | null;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeleteJobHistoryDialog = ({
  isOpen,
  onClose,
  employee,
  currentJobHistory,
  onDelete,
  isDeleting
}: DeleteJobHistoryDialogProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "dd-MMM-yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Job History</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this job history record? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-muted/50 p-3 rounded-md my-2">
          <p className="text-sm">
            <span className="font-medium">Employee:</span> {employee?.lastname}, {employee?.firstname} ({employee?.empno})
          </p>
          {currentJobHistory && (
            <>
              <p className="text-sm"><span className="font-medium">Job:</span> {currentJobHistory.job?.jobdesc || currentJobHistory.jobcode}</p>
              <p className="text-sm"><span className="font-medium">Date:</span> {formatDate(currentJobHistory.effdate)}</p>
            </>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteJobHistoryDialog;
