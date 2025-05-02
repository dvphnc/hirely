
export interface Employee {
  empNo: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  birthDate: string;
  hireDate: string;
  sepDate?: string | null;
  status?: string | null;
  stamp?: string | null;
}

export interface JobHistory {
  empNo: string;
  jobCode: string;
  effDate: string;
  salary: number;
  deptCode: string;
  status?: string | null;
  stamp?: string | null;
}

export interface Department {
  deptCode: string;
  deptName: string;
  status?: string | null;
  stamp?: string | null;
}

export interface Job {
  jobCode: string;
  jobDesc: string;
  status?: string | null;
  stamp?: string | null;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user' | 'blocked';
}
