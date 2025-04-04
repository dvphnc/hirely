
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/context/auth-context";
import { Users, Briefcase, Building, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Use React Query for all data fetching to ensure real-time updates
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data;
    },
  });
  
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("department")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data;
    },
  });
  
  const { data: jobHistory, isLoading: jobHistoryLoading } = useQuery({
    queryKey: ["jobHistory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobhistory")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data;
    },
  });

  // Derived state from React Query data
  const [totalActiveEmployees, setTotalActiveEmployees] = useState(0);
  const [departmentCounts, setDepartmentCounts] = useState<{name: string; count: number}[]>([]);
  const [averageSalary, setAverageSalary] = useState(0);
  const [recentHires, setRecentHires] = useState(0);

  // Recalculate stats whenever the data changes
  useEffect(() => {
    if (employees && departments && jobHistory) {
      // Count active employees
      const activeEmps = employees.filter(emp => !emp.sepdate).length;
      setTotalActiveEmployees(activeEmps);
      
      // Calculate department distribution
      const deptData = departments.map(dept => {
        const empInDept = jobHistory.filter(job => job.deptcode === dept.deptcode)
          .map(job => job.empno)
          .filter((empNo, index, self) => self.indexOf(empNo) === index)
          .length;
        
        return {
          name: dept.deptname || dept.deptcode,
          count: empInDept
        };
      });
      setDepartmentCounts(deptData);
      
      // Calculate average salary
      if (jobHistory.length > 0) {
        const salaries = jobHistory.map(job => job.salary || 0);
        const avgSalary = salaries.reduce((acc, curr) => acc + curr, 0) / salaries.length;
        setAverageSalary(avgSalary);
      }
      
      // Count recent hires (last 365 days)
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      const recentlyHired = employees.filter(emp => {
        if (!emp.hiredate) return false;
        const hireDate = new Date(emp.hiredate);
        return hireDate >= oneYearAgo && hireDate <= today;
      }).length;
      setRecentHires(recentlyHired);
    }
  }, [employees, departments, jobHistory]);

  // Navigate to respective pages when quick action cards are clicked
  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  // Extract user name from user_metadata or fallback to email
  const userName = user?.user_metadata?.name || user?.email;

  // Apply dark mode from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {userName}!
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {employeesLoading ? <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div> : totalActiveEmployees}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active employees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {departmentsLoading ? <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div> : departments?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {jobHistoryLoading ? 
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div> : 
                `$${Math.round(averageSalary).toLocaleString()}`
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per employee
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Hires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {employeesLoading ? <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div> : recentHires}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In the last 12 months
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee Distribution by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {departmentsLoading || employeesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentCounts}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 40,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8a3ab9" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2 grid-cols-2">
                <Card 
                  className="bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => handleQuickAction('/employees')}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Users className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-medium">View Employees</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage your staff
                    </p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => handleQuickAction('/jobs')}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Briefcase className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-medium">Job Roles</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      View job descriptions
                    </p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => handleQuickAction('/departments')}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Building className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-medium">Departments</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage departments
                    </p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => handleQuickAction('/settings')}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Settings className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-medium">Settings</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      System preferences
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
