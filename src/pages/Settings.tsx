
import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
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

  // Handle export data
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Fetch data to export
      const [employeesResult, departmentsResult, jobsResult, jobHistoryResult] = await Promise.all([
        supabase.from("employee").select("*"),
        supabase.from("department").select("*"),
        supabase.from("job").select("*"),
        supabase.from("jobhistory").select("*"),
      ]);

      // Combine data for export
      const exportData = {
        employees: employeesResult.data,
        departments: departmentsResult.data,
        jobs: jobsResult.data,
        jobHistory: jobHistoryResult.data,
        exportedAt: new Date().toISOString(),
      };

      // Create a blob and download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
      console.error("Export error:", error);
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
                  {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Export Data
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
