import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DeleteEmployeeDialogProps } from "../types/EmployeeTypes";
import { useEmployeeMutations } from "../hooks/useEmployeeMutations";
// --- BINAGO ANG IMPORT DITO ---
// Gagamitin natin ang usePermission hook mula sa iyong auth-context.
import { usePermission } from "@/context/auth-context"; // Siguraduhin na ang path na ito ay tama

export const DeleteEmployeeDialog = ({
  employee,
  open,
  onOpenChange,
}: DeleteEmployeeDialogProps) => {
  const { deleteEmployeeMutation } = useEmployeeMutations();
  // --- BINAGO ANG PAGKUHA NG PERMISSION DITO ---
  // Gamitin ang usePermission hook para sa 'employees' table.
  const { canDelete } = usePermission('employees'); // Kukunin ang 'canDelete' property para sa 'employees' table

  const handleDeleteConfirm = () => {
    // --- BINAGO ANG PERMISSION CHECK DITO ---
    // Direkta nang gagamitin ang 'canDelete' na galing sa usePermission hook.
    if (!canDelete) {
      console.error("Permission Denied: Ang user ay walang pahintulot na mag-delete ng mga empleyado.");
      // Opsyonal, maaari kang magpakita ng user-friendly na mensahe sa user dito.
      onOpenChange(false); // Isara ang dialog dahil hindi pinapayagan ang aksyon
      return; // Mahalaga: Itigil ang function kung walang pahintulot
    }

    if (employee?.empno) {
      deleteEmployeeMutation.mutate(employee.empno, {
        onSuccess: () => {
          onOpenChange(false);
          // Opsyonal, magpakita ng mensahe ng tagumpay sa user
        },
        onError: (error) => {
          console.error("Nabigo na i-delete ang empleyado:", error);
          // Maaari kang magpakita ng mas user-friendly na mensahe ng error dito.
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Kumpirmahin ang Pag-delete</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Sigurado ka bang gusto mong i-delete ang empleyadong ito? Ang aksyon na ito ay hindi na mababawi.
          <br />
          <span className="font-semibold">{employee?.lastname}, {employee?.firstname} ({employee?.empno})</span>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteEmployeeMutation.isPending}
          >
            Kanselahin
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={deleteEmployeeMutation.isPending || !canDelete} // I-disable kung walang pahintulot
          >
            {deleteEmployeeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            I-delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
