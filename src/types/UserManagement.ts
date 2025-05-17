
import { UserRole } from "@/context/auth-context";

export interface UserProfile {
  id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface UserPermission {
  id: string;
  user_id: string;
  table_name: string;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface ProfileWithEmail {
  id: string;
  role: UserRole;
  email: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface TableInfo {
  name: string;
  label: string;
}

export const MANAGED_TABLES: TableInfo[] = [
  { name: 'employee', label: 'Employees' },
  { name: 'job', label: 'Jobs' },
  { name: 'department', label: 'Departments' },
  { name: 'jobhistory', label: 'Job History' }
];
