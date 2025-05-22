
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Loader2, FileDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const Settings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showInactive, setShowInactive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const exportSectionRef = useRef(null);
  const employeeChartRef = useRef(null);
  const departmentChartRef = useRef(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedShowInactive = localStorage.getItem('showInactive') === 'true';
    const savedEmailNotifications = localStorage.getItem('emailNotifications') !== 'false';
    
    setDarkMode(savedDarkMode);
    setShowInactive(savedShowInactive);
    setEmailNotifications(savedEmailNotifications);
    
    // Apply dark mode if enabled
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fetch data for charts and tables
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

  // Calculate chart data
  const [departmentCounts, setDepartmentCounts] = useState<{name: string; count: number}[]>([]);
  const [employeeStatusData, setEmployeeStatusData] = useState<{name: string; value: number}[]>([]);
  
  useEffect(() => {
    if (employees && departments && jobHistory) {
      // Calculate department distribution
      const deptData = departments.map(dept => {
        const empInDept = employees?.filter(emp => {
          const latestJob = jobHistory
            .filter(job => job.empno === emp.empno)
            .sort((a, b) => new Date(b.effdate).getTime() - new Date(a.effdate).getTime())[0];
          return latestJob && latestJob.deptcode === dept.deptcode;
        }).length || 0;
        
        return {
          name: dept.deptname || dept.deptcode,
          count: empInDept
        };
      });
      setDepartmentCounts(deptData);
      
      // Calculate employee status (active vs inactive)
      const activeCount = employees.filter(emp => !emp.sepdate).length;
      const inactiveCount = employees.filter(emp => emp.sepdate).length;
      setEmployeeStatusData([
        { name: "Active", value: activeCount },
        { name: "Inactive", value: inactiveCount }
      ]);
    }
  }, [employees, departments, jobHistory]);

  // Function to save settings
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save settings to localStorage
      localStorage.setItem('darkMode', darkMode.toString());
      localStorage.setItem('showInactive', showInactive.toString());
      localStorage.setItem('emailNotifications', emailNotifications.toString());
      
      // Apply dark mode change immediately
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Invalidate relevant queries to refresh data based on new settings
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Settings save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle change password
  const handleChangePassword = async (data: PasswordFormValues) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw new Error(error.message);

      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to change password: ${error.message}`);
      } else {
        toast.error("Failed to change password");
      }
    }
  };

  // Handle export data as PDF
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFontSize(18);
      pdf.text("Company Data Export", 20, 20);
      
      pdf.setFontSize(12);
      const currentDate = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${currentDate}`, 20, 30);
      
      let yOffset = 40;
      
      // Add employee chart to PDF
      if (employeeChartRef.current && employeeStatusData.length > 0) {
        pdf.text("Employee Status Distribution", 20, yOffset);
        yOffset += 5;
        
        const employeeCanvas = await html2canvas(employeeChartRef.current);
        const employeeChartImage = employeeCanvas.toDataURL('image/png');
        pdf.addImage(employeeChartImage, 'PNG', 20, yOffset, 170, 80);
        yOffset += 85;
      }
      
      // Add department chart to PDF
      if (departmentChartRef.current && departmentCounts.length > 0) {
        // Check if we need to add a new page
        if (yOffset > 200) {
          pdf.addPage();
          yOffset = 20;
        }
        
        pdf.text("Department Distribution", 20, yOffset);
        yOffset += 5;
        
        const deptCanvas = await html2canvas(departmentChartRef.current);
        const deptChartImage = deptCanvas.toDataURL('image/png');
        pdf.addImage(deptChartImage, 'PNG', 20, yOffset, 170, 80);
        yOffset += 85;
      }
      
      // Add employee table
      if (employees && employees.length > 0) {
        // Check if we need to add a new page
        if (yOffset > 200) {
          pdf.addPage();
          yOffset = 20;
        }
        
        pdf.text("Employee List", 20, yOffset);
        yOffset += 5;
        
        // Format employee data for table
        const employeeData = employees.map(emp => [
          emp.empno,
          `${emp.firstname} ${emp.lastname}`,
          emp.gender,
          emp.hiredate ? new Date(emp.hiredate).toLocaleDateString() : 'N/A',
          !emp.sepdate ? 'Active' : 'Inactive'
        ]);
        
        autoTable(pdf, {
          head: [['ID', 'Name', 'Gender', 'Hire Date', 'Status']],
          body: employeeData,
          startY: yOffset,
          margin: { top: 20 },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });
        
        yOffset = (pdf as any).lastAutoTable.finalY + 10;
      }
      
      // Add department table
      if (departments && departments.length > 0) {
        // Check if we need to add a new page
        if (yOffset > 200) {
          pdf.addPage();
          yOffset = 20;
        }
        
        pdf.text("Department List", 20, yOffset);
        yOffset += 5;
        
        // Format department data for table
        const departmentData = departments.map(dept => [
          dept.deptcode,
          dept.deptname || 'N/A',
          departmentCounts.find(d => d.name === (dept.deptname || dept.deptcode))?.count || 0
        ]);
        
        autoTable(pdf, {
          head: [['Code', 'Name', 'Employee Count']],
          body: departmentData,
          startY: yOffset,
          margin: { top: 20 },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });
      }
      
      // Save the PDF
      pdf.save(`company-data-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Data exported successfully as PDF");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data as PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle clear all data
  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      return;
    }

    setIsClearingData(true);
    try {
      // This is a placeholder. In a real application, you'd want to implement this with proper backend support
      // and ensure data is properly cleared with appropriate permissions.
      toast.info("This feature would clear all data in a real application, but is currently disabled for safety.");
    } catch (error) {
      toast.error("Failed to clear data");
      console.error("Clear data error:", error);
    } finally {
      setIsClearingData(false);
    }
  };

  // Handle dark mode toggle
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', checked.toString());
  };

  // Handle show inactive employees toggle
  const handleShowInactiveChange = (checked: boolean) => {
    setShowInactive(checked);
    localStorage.setItem('showInactive', checked.toString());
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Settings</h2>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive system alerts and notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
            <CardDescription>
              Customize your visual experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="font-medium">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for reduced eye strain
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleDarkModeChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-inactive" className="font-medium">
                  Show Inactive Employees
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display former employees in employee list
                </p>
              </div>
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={handleShowInactiveChange}
              />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2" ref={exportSectionRef}>
          <Card>
            <CardHeader>
              <CardTitle>Data Visualization</CardTitle>
              <CardDescription>
                Charts and data for export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Employee Status</h3>
                  <div className="h-[300px]" ref={employeeChartRef}>
                    {employeesLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <p>Loading chart data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={employeeStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {employeeStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Department Distribution</h3>
                  <div className="h-[300px]" ref={departmentChartRef}>
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label className="font-medium">Password Reset</Label>
              <p className="text-sm text-muted-foreground">
                Change your account password
              </p>
              <div>
                <Button 
                  variant="outline"
                  onClick={() => setIsPasswordDialogOpen(true)}
                  disabled={!user}
                >
                  Change Password
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label className="font-medium">Data Management</Label>
              <p className="text-sm text-muted-foreground">
                Manage your data and exports
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Export as PDF
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleClearData}
                  disabled={isClearingData}
                >
                  {isClearingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Clear All Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
