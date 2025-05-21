import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, History } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeFormValues, employeeSchema, EditEmployeeDialogProps } from "../types/EmployeeTypes";
import { useEmployeeMutations } from "../hooks/useEmployeeMutations";
import { createAuditTrail } from "@/utils/auditTrail";

// --- BINAGO ANG IMPORT DITO ---
// Gagamitin natin ang usePermission hook mula sa iyong auth-context.
import { usePermission } from "@/context/auth-context";

export const EditEmployeeDialog = ({
  employee,
  open,
  onOpenChange,
  onManageJobHistory
}: EditEmployeeDialogProps) => {
  const { updateEmployeeMutation } = useEmployeeMutations();
  // --- BINAGO ANG PAGKUHA NG PERMISSION DITO ---
  // Gamitin ang usePermission hook para sa 'employees' table.
  const { canEdit } = usePermission('employees'); // Kukunin ang 'canEdit' property para sa 'employees' table

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      empno: "",
      lastname: "",
      firstname: "",
      gender: "",
      birthdate: "",
      hiredate: "",
      sepdate: null,
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        empno: employee.empno,
        lastname: employee.lastname || "",
        firstname: employee.firstname || "",
        gender: employee.gender || "",
        birthdate: employee.birthdate || "",
        hiredate: employee.hiredate || "",
        sepdate: employee.sepdate,
      });
    }
  }, [employee, form]);

  const onSubmit = (data: EmployeeFormValues) => {
    // --- BINAGO ANG PERMISSION CHECK DITO ---
    // Direkta nang gagamitin ang 'canEdit' na galing sa usePermission hook.
    if (!canEdit) {
      console.error("Permission Denied: Ang user ay walang pahintulot na mag-edit ng mga empleyado.");
      onOpenChange(false); // Isara ang dialog dahil hindi pinapayagan ang aksyon
      return; // Mahalaga: Itigil ang function kung walang pahintulot
    }

    updateEmployeeMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        // Opsyonal, magpakita ng mensahe ng tagumpay sa user
      },
      onError: (error) => {
        // Pangasiwaan ang error mula sa mutation, halimbawa, magpakita ng mensahe sa user
        console.error("Nabigo na i-update ang empleyado:", error);
        // Maaari kang magpakita ng mas user-friendly na mensahe ng error dito,
        // posibleng gamit ang isang toast notification o isang alert system.
      }
    });
  };

  const handleJobHistoryClick = async () => {
    // Kung may specific permission para sa job history, gamitin din ang usePermission
    // Halimbawa: const { canViewJobHistory } = usePermission('job_history');
    // if (!canViewJobHistory) { ... return; }

    // I-log ang access sa kasaysayan ng trabaho sa audit trail
    if (employee?.empno) {
      try {
        // Markahan ang record ng empleyado bilang tinitingnan para sa kasaysayan ng trabaho
        await createAuditTrail(
          {
            empno: employee.empno,
            status: 'viewed_job_history'
          },
          'UPDATE', // O 'VIEW' kung sinusuportahan ito ng iyong audit trail para sa mga aksyon sa pagtingin
          'employee'
        );
      } catch (error) {
        console.error("Error sa pag-update ng employee audit trail para sa kasaysayan ng trabaho:", error);
      }
    }

    if (onManageJobHistory && employee) {
      onManageJobHistory(employee);
    }
  };

  console.log("User can edit employee (from usePermission):", canEdit); // Para sa debugging: I-check ito sa iyong browser console

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>I-edit ang Empleyado</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="empno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numero ng Empleyado</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-muted/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apelyido</FormLabel>
                    <FormControl>
                      {/* I-disable ang mga input field kung hindi maaaring mag-edit ang user */}
                      <Input placeholder="Ilagay ang apelyido" {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pangalan</FormLabel>
                    <FormControl>
                      {/* I-disable ang mga input field kung hindi maaaring mag-edit ang user */}
                      <Input placeholder="Ilagay ang pangalan" {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kasarian</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!canEdit} // I-disable ang Select kung walang pahintulot sa pag-edit
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pumili ng kasarian" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Lalaki</SelectItem>
                      <SelectItem value="F">Babae</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Petsa ng Kapanganakan</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={!canEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hiredate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Petsa ng Pagkaka-hire</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={!canEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sepdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Petsa ng Paghihiwalay (opsyonal)</Formabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e.target.value || null);
                      }}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <div className="flex w-full justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleJobHistoryClick}
                  // Maaari mo ring i-disable ito kung mayroon itong partikular na pahintulot
                  // disabled={!hasPermission('employee:manage_job_history')}
                >
                  <History className="mr-2 h-4 w-4" /> Pamahalaan ang Kasaysayan ng Trabaho
                </Button>
                <Button
                  type="submit"
                  disabled={updateEmployeeMutation.isPending || !canEdit} // I-disable kung walang pahintulot
                >
                  {updateEmployeeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  I-update ang Empleyado
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
