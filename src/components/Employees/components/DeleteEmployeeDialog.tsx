
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DeleteEmployeeDialogProps } from "../types/EmployeeTypes";
import { useEmployeeMutations } from "../hooks/useEmployeeMutations";
import { usePermission, useAuth } from "@/context/auth-context";

export const DeleteEmployeeDialog = ({
  employee,
  open,
  onOpenChange,
  onConfirmDelete,
  isDeleting,
}: DeleteEmployeeDialogProps) => {
  const { canDelete } = usePermission('employee');
  const { isAdmin } = useAuth();
  
  // User can delete only if they have permission or are admin
  const hasDeletePermission = canDelete || isAdmin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Are you sure you want to delete this employee? This action cannot be undone.
          <br />
          <span className="font-semibold">{employee?.lastname}, {employee?.firstname} ({employee?.empno})</span>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isDeleting || !hasDeletePermission}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
