
import { Employee, JobHistory, Department, Job } from "@/types/supabase";
import { z } from "zod";

export interface JobHistoryWithDetails extends JobHistory {
  job?: {
    jobdesc: string | null;
  };
  department?: {
    deptname: string | null;
  };
}

export const jobHistorySchema = z.object({
  empno: z.string().min(1, "Employee number is required"),
  jobcode: z.string().min(1, "Job code is required"),
  deptcode: z.string().min(1, "Department code is required"),
  effdate: z.string().min(1, "Effective date is required"),
  salary: z.coerce.number().min(0, "Salary must be a positive number"),
});

export type JobHistoryFormValues = z.infer<typeof jobHistorySchema>;

export interface JobHistoryDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
