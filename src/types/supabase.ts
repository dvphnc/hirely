
export type Employee = {
  empno: string;
  lastname: string | null;
  firstname: string | null;
  gender: string | null;
  birthdate: string | null;
  hiredate: string | null;
  sepdate: string | null;
  status?: string | null;
  stamp?: string | null;
};

export type JobHistory = {
  empno: string;
  jobcode: string;
  effdate: string;
  salary: number | null;
  deptcode: string | null;
  status?: string | null;
  stamp?: string | null;
};

export type Department = {
  deptcode: string;
  deptname: string | null;
  status?: string | null;
  stamp?: string | null;
};

export type Job = {
  jobcode: string;
  jobdesc: string | null;
  status?: string | null;
  stamp?: string | null;
};
