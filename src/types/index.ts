
export interface Employee {
  empNo: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  birthDate: string;
  hireDate: string;
  sepDate?: string | null;
}

export interface JobHistory {
  empNo: string;
  jobCode: string;
  effDate: string;
  salary: number;
  deptCode: string;
}

export interface Department {
  deptCode: string;
  deptName: string;
}

export interface Job {
  jobCode: string;
  jobDesc: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
}
