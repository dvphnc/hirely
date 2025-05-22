
import { useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import NotificationSettings from "@/components/Settings/NotificationSettings";
import DisplayPreferences from "@/components/Settings/DisplayPreferences";
import DataVisualizations from "@/components/Settings/DataVisualizations";
import AccountSettings from "@/components/Settings/AccountSettings";
import PasswordDialog from "@/components/Settings/PasswordDialog";
import useSettingsData from "@/hooks/useSettingsData";
import useSettingsActions from "@/hooks/useSettingsActions";

const Settings = () => {
  const { user } = useAuth();
  const exportSectionRef = useRef(null);
  const employeeChartRef = useRef<HTMLDivElement>(null);
  const departmentChartRef = useRef<HTMLDivElement>(null);

  // Get data for settings page
  const {
    employees,
    departments,
    employeesLoading,
    departmentsLoading,
    departmentCounts,
    employeeStatusData
  } = useSettingsData();

  // Get actions for settings page
  const {
    emailNotifications,
    setEmailNotifications,
    darkMode,
    showInactive,
    isSaving,
    isPasswordDialogOpen,
    setIsPasswordDialogOpen,
    isExporting,
    isClearingData,
    loadSettings,
    saveSettings,
    handleDarkModeChange,
    handleShowInactiveChange,
    handleExportData,
    handleClearData
  } = useSettingsActions();

  // Load settings from localStorage on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Handle export data for this component
  const handleExportDataWithRefs = async () => {
    if (employees && departments) {
      await handleExportData(
        employeeChartRef,
        departmentChartRef,
        employeeStatusData,
        departmentCounts,
        employees,
        departments
      );
    }
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
        {/* Notification Settings */}
        <NotificationSettings 
          emailNotifications={emailNotifications}
          setEmailNotifications={setEmailNotifications}
        />
        
        {/* Display Preferences */}
        <DisplayPreferences 
          darkMode={darkMode}
          showInactive={showInactive}
          handleDarkModeChange={handleDarkModeChange}
          handleShowInactiveChange={handleShowInactiveChange}
        />

        {/* Data Visualization */}
        <div className="md:col-span-2" ref={exportSectionRef}>
          <DataVisualizations 
            employeeStatusData={employeeStatusData}
            departmentCounts={departmentCounts}
            employeesLoading={employeesLoading}
            departmentsLoading={departmentsLoading}
            employeeChartRef={employeeChartRef}
            departmentChartRef={departmentChartRef}
          />
        </div>
        
        {/* Account Settings */}
        <AccountSettings 
          user={user}
          isExporting={isExporting}
          isClearingData={isClearingData}
          handleExportData={handleExportDataWithRefs}
          handleClearData={handleClearData}
          setIsPasswordDialogOpen={setIsPasswordDialogOpen}
        />
      </div>

      {/* Password Dialog */}
      <PasswordDialog 
        open={isPasswordDialogOpen} 
        onOpenChange={setIsPasswordDialogOpen} 
      />
    </DashboardLayout>
  );
};

export default Settings;
