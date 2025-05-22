
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DeleteEmployeeDialogProps } from "../types/EmployeeTypes";
import { useEmployeeMutations } from "../hooks/useEmployeeMutations";
import { usePermission } from "@/context/auth-context";

export const DeleteEmployeeDialog = ({
  employee,
  open,
  onOpenChange,
}: DeleteEmployeeDialogProps) => {
  const { deleteEmployeeMutation } = useEmployeeMutations();
  // Get permissions for the 'employee' table
  const { canDelete } = usePermission('employee');

  const handleDeleteConfirm = () => {
    // Check if user has permission to delete employees
    if (!canDelete) {
      console.error("Permission Denied: User does not have permission to delete employees.");
      onOpenChange(false); // Close dialog since action is not permitted
      return;
    }

    if (employee?.empno) {
      deleteEmployeeMutation.mutate(employee.empno, {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Failed to delete employee:", error);
        }
      });
    }
  };

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
            disabled={deleteEmployeeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={deleteEmployeeMutation.isPending || !canDelete}
          >
            {deleteEmployeeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
