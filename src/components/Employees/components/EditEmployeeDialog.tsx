
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
import { usePermission } from "@/context/auth-context";

export const EditEmployeeDialog = ({
  employee,
  open,
  onOpenChange,
  onManageJobHistory
}: EditEmployeeDialogProps) => {
  const { updateEmployeeMutation } = useEmployeeMutations();
  const { canEdit } = usePermission('employee');

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
    if (!canEdit) {
      console.error("Permission Denied: User does not have permission to edit employees.");
      onOpenChange(false);
      return;
    }

    updateEmployeeMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
      onError: (error) => {
        console.error("Failed to update employee:", error);
      }
    });
  };

  const handleJobHistoryClick = async () => {
    if (employee?.empno) {
      try {
        await createAuditTrail(
          {
            empno: employee.empno,
            status: 'viewed_job_history'
          },
          'UPDATE',
          'employee'
        );
      } catch (error) {
        console.error("Error updating employee audit trail for job history:", error);
      }
    }

    if (onManageJobHistory && employee) {
      onManageJobHistory(employee);
    }
  };

  console.log("User can edit employee (from usePermission):", canEdit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="empno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Number</FormLabel>
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} disabled={!canEdit} />
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
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} disabled={!canEdit} />
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
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!canEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
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
                  <FormLabel>Date of Birth</FormLabel>
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
                  <FormLabel>Hire Date</FormLabel>
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
                  <FormLabel>Separation Date (optional)</FormLabel>
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
                >
                  <History className="mr-2 h-4 w-4" /> Manage Job History
                </Button>
                <Button
                  type="submit"
                  disabled={updateEmployeeMutation.isPending || !canEdit}
                >
                  {updateEmployeeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Employee
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
