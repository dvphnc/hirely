
import { Employee, JobHistory, Department, Job, User } from '../types';

// Mock users for authentication
export const users: User[] = [
  {
    id: '1',
    email: 'admin@hirely.com',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '2',
    email: 'user@hirely.com',
    name: 'Regular User',
    role: 'user'
  }
];

// Mock employees data
export const employees: Employee[] = [
  {
    empNo: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    birthDate: '1985-05-15',
    hireDate: '2020-01-10',
    sepDate: null
  },
  {
    empNo: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    gender: 'Female',
    birthDate: '1990-08-22',
    hireDate: '2019-03-15',
    sepDate: null
  },
  {
    empNo: 'EMP003',
    firstName: 'Michael',
    lastName: 'Johnson',
    gender: 'Male',
    birthDate: '1982-11-30',
    hireDate: '2018-06-05',
    sepDate: null
  },
  {
    empNo: 'EMP004',
    firstName: 'Emily',
    lastName: 'Williams',
    gender: 'Female',
    birthDate: '1988-04-12',
    hireDate: '2021-02-20',
    sepDate: null
  },
  {
    empNo: 'EMP005',
    firstName: 'Robert',
    lastName: 'Brown',
    gender: 'Male',
    birthDate: '1979-09-25',
    hireDate: '2017-11-08',
    sepDate: '2023-01-15'
  }
];

// Mock job history data
export const jobHistory: JobHistory[] = [
  {
    empNo: 'EMP001',
    jobCode: 'JOB001',
    effDate: '2020-01-10',
    salary: 60000,
    deptCode: 'DEPT001'
  },
  {
    empNo: 'EMP002',
    jobCode: 'JOB002',
    effDate: '2019-03-15',
    salary: 65000,
    deptCode: 'DEPT002'
  },
  {
    empNo: 'EMP003',
    jobCode: 'JOB003',
    effDate: '2018-06-05',
    salary: 70000,
    deptCode: 'DEPT003'
  },
  {
    empNo: 'EMP001',
    jobCode: 'JOB004',
    effDate: '2022-01-10',
    salary: 75000,
    deptCode: 'DEPT001'
  }
];

// Mock department data
export const departments: Department[] = [
  {
    deptCode: 'DEPT001',
    deptName: 'Human Resources'
  },
  {
    deptCode: 'DEPT002',
    deptName: 'Engineering'
  },
  {
    deptCode: 'DEPT003',
    deptName: 'Marketing'
  },
  {
    deptCode: 'DEPT004',
    deptName: 'Finance'
  }
];

// Mock job data
export const jobs: Job[] = [
  {
    jobCode: 'JOB001',
    jobDesc: 'HR Manager'
  },
  {
    jobCode: 'JOB002',
    jobDesc: 'Software Engineer'
  },
  {
    jobCode: 'JOB003',
    jobDesc: 'Marketing Specialist'
  },
  {
    jobCode: 'JOB004',
    jobDesc: 'Senior HR Manager'
  }
];
