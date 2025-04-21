import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Employee } from "@/types/supabase";
import { JobHistoryWithDetails } from "./JobHistoryTypes";

function formatDate(dateString: string | null) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return dateString;
  }
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDelete: () => void;
  isPending: boolean;
  employee: Employee | null;
  jobHistory: JobHistoryWithDetails | null;
}

export default function JobHistoryDeleteDialog({ open, onOpenChange, onDelete, isPending, employee, jobHistory }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          {jobHistory && (
            <>
              <p className="text-sm"><span className="font-medium">Job:</span> {jobHistory.job?.jobdesc || jobHistory.jobcode}</p>
              <p className="text-sm"><span className="font-medium">Date:</span> {formatDate(jobHistory.effdate)}</p>
            </>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
