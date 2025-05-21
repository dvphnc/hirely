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

// --- MAHALAGANG PAGBABAGO DITO ---
// Batay sa iyong EmployeeTable.tsx, ang useAuth ay ini-import mula sa "@/context/auth-context".
// Siguraduhin na ang path na ito ay tama para sa iyong proyekto!
import { useAuth } from "@/context/auth-context"; // <--- BINAGO ANG IMPORT PATH DITO

export const EditEmployeeDialog = ({
  employee,
  open,
  onOpenChange,
  onManageJobHistory
}: EditEmployeeDialogProps) => {
  const { updateEmployeeMutation } = useEmployeeMutations();
  // Siguraduhin na ang useAuth() ay nagre-return ng 'hasPermission' function.
  // Kung ang iyong useAuth context ay nagbibigay lang ng `isAdmin` (tulad ng nakita sa EmployeeTable),
  // maaaring kailangan mong i-derive ang `canEdit` mula sa `isAdmin` o magdagdag ng `hasPermission` function sa iyong auth-context.
  const { hasPermission } = useAuth(); // Ipinapalagay na ang useAuth ay nagbibigay ng hasPermission function

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
    // --- SIMULA: Permission check bago mag-submit ---
    // Siguraduhin na ang 'hasPermission' function ay tama ang implementasyon at available mula sa iyong auth-context.
    // Palitan ang 'employee:edit' ng aktwal na permission string para sa pag-edit ng mga empleyado sa iyong system.
    try {
      // I-check kung ang hasPermission ay isang function bago tawagin ito, upang maiwasan ang mga error
      if (typeof hasPermission === 'function' && !hasPermission('employee:edit')) {
        console.error("Permission Denied: Ang user ay walang pahintulot na mag-edit ng mga empleyado.");
        // Opsyonal, maaari kang magpakita ng user-friendly na mensahe sa user dito (halimbawa, isang toast notification).
        // Halimbawa: toast.error("Wala kang pahintulot na gawin ang aksyon na ito.");
        onOpenChange(false); // Isara ang dialog dahil hindi pinapayagan ang aksyon
        return; // Mahalaga: Itigil ang function kung walang pahintulot
      } else if (typeof hasPermission !== 'function') {
        // Ang kasong ito ay nagpapahiwatig na ang hasPermission ay hindi tama ang pagkakaloob ng useAuth
        console.error("Ang permission check function na 'hasPermission' ay hindi available. Siguraduhin na ang iyong useAuth hook/context ay tama ang implementasyon.");
        onOpenChange(false);
        return;
      }
    } catch (error) {
      console.error("Error sa panahon ng permission check:", error);
      // Pangasiwaan ang mga hindi inaasahang error sa panahon ng permission check mismo
      onOpenChange(false);
      return;
    }
    // --- TAPOS: Permission check ---

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
    // Ang button na ito ay maaaring mangailangan din ng permission check kung ang 'manage_job_history' ay isang hiwalay na permission
    // Halimbawa:
    // if (typeof hasPermission === 'function' && !hasPermission('employee:manage_job_history')) {
    //   console.error("Permission Denied: Ang user ay walang pahintulot na pamahalaan ang kasaysayan ng trabaho.");
    //   return;
    // }

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

  // Tukuyin kung ang user ay may pahintulot na mag-edit ng mga empleyado
  // Siguraduhin na ang iyong 'hasPermission' function ay nagre-return ng boolean.
  // Magdagdag ng fallback (false) kung ang hasPermission ay hindi pa available o hindi isang function
  const canEdit = typeof hasPermission === 'function' ? hasPermission('employee:edit') : false;
  console.log("Ang user ay maaaring mag-edit ng empleyado:", canEdit); // Para sa debugging: I-check ito sa iyong browser console

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
                    disabled={!canEdit} // <--- I-disable ang Select kung walang pahintulot sa pag-edit
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
                  <FormLabel>Petsa ng Paghihiwalay (opsyonal)</FormLabel>
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
