
import { Employee } from "@/types/supabase";
import { z } from "zod";

export const employeeSchema = z.object({
  empno: z.string().min(1, "Employee number is required"),
  lastname: z.string().min(1, "Last name is required"),
  firstname: z.string().min(1, "First name is required"),
  gender: z.string().min(1, "Gender is required"),
  birthdate: z.string().min(1, "Birth date is required"),
  hiredate: z.string().min(1, "Hire date is required"),
  sepdate: z.string().nullable(),
  status: z.string().optional(),
  stamp: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextEmpNo: string;
}

export interface EditEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManageJobHistory?: (employee: Employee) => void;
}

export interface DeleteEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}

export interface EmployeeSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
}
