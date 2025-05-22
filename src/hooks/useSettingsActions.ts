
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

export const useSettingsActions = () => {
  const queryClient = useQueryClient();
  
  // States for settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showInactive, setShowInactive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  // Load settings from localStorage on component mount
  const loadSettings = () => {
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
  };

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

  // Handle export data as PDF
  const handleExportData = async (
    employeeChartRef: React.RefObject<HTMLDivElement>,
    departmentChartRef: React.RefObject<HTMLDivElement>,
    employeeStatusData: {name: string; value: number}[],
    departmentCounts: {name: string; count: number}[],
    employees: any[],
    departments: any[]
  ) => {
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

  return {
    emailNotifications,
    setEmailNotifications,
    darkMode,
    setDarkMode,
    showInactive,
    setShowInactive,
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
  };
};

export default useSettingsActions;
