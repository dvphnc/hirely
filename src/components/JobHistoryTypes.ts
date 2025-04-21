
import { Job, Department } from "@/types/supabase";

export interface JobHistoryWithDetails {
  empno: string;
  jobcode: string;
  effdate: string;
  deptcode: string | null;
  salary: number | null;
  job?: Job | null;
  department?: Department | null;
}

export interface JobHistoryFormValues {
  empno: string;
  jobcode: string;
  deptcode: string;
  effdate: string;
  salary: number;
}
