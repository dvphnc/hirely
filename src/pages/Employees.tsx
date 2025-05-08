
import { useState } from "react";
import { Employee } from "@/types/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import JobHistoryDialog from "@/components/JobHistoryDialog";
import { useEmployeeData } from "@/components/Employees/hooks/useEmployeeData";
import { useEmployeeMutations } from "@/components/Employees/hooks/useEmployeeMutations";
import { AddEmployeeDialog } from "@/components/Employees/components/AddEmployeeDialog";
import { EditEmployeeDialog } from "@/components/Employees/components/EditEmployeeDialog";
import { DeleteEmployeeDialog } from "@/components/Employees/components/DeleteEmployeeDialog";
import { EmployeeSearch } from "@/components/Employees/components/EmployeeSearch";
import { EmployeeTable } from "@/components/Employees/components/EmployeeTable";
import { usePermission, useAuth } from "@/context/auth-context";

const Employees = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isJobHistoryOpen, setIsJobHistoryOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const { isAdmin } = useAuth();
  const { canAdd } = usePermission('employee');

  const { 
    employees,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    showInactive,
    setShowInactive,
    showDeleted,
    setShowDeleted,
    nextEmpNo,
    refetch
  } = useEmployeeData();

  const { deleteEmployeeMutation, restoreEmployeeMutation } = useEmployeeMutations();

  const handleEditClick = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDeleteOpen(true);
  };

  const handleJobHistoryClick = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsJobHistoryOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currentEmployee) {
      deleteEmployeeMutation.mutate(currentEmployee.empno, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setCurrentEmployee(null);
        }
      });
    }
  };
  
  const handleRestoreEmployee = (employee: Employee) => {
    restoreEmployeeMutation.mutate(employee.empno, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-8 text-red-500">
          Error loading employees
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employees</h1>
          <Button
            className="instagram-gradient"
            onClick={() => setIsAddOpen(true)}
            disabled={!canAdd}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Employee Management</CardTitle>
            <EmployeeSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              showInactive={showInactive}
              onShowInactiveChange={setShowInactive}
              showDeleted={showDeleted}
              onShowDeletedChange={setShowDeleted}
              isAdmin={isAdmin}
            />
          </CardHeader>
          <CardContent>
            <EmployeeTable
              employees={employees}
              isLoading={isLoading}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onJobHistoryClick={handleJobHistoryClick}
              onRestoreClick={isAdmin ? handleRestoreEmployee : undefined}
            />
          </CardContent>
        </Card>
      </div>

      <AddEmployeeDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        nextEmpNo={nextEmpNo}
      />

      <EditEmployeeDialog
        employee={currentEmployee}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onManageJobHistory={handleJobHistoryClick}
      />

      <DeleteEmployeeDialog
        employee={currentEmployee}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deleteEmployeeMutation.isPending}
      />

      <JobHistoryDialog
        employee={currentEmployee}
        open={isJobHistoryOpen}
        onOpenChange={setIsJobHistoryOpen}
      />
    </DashboardLayout>
  );
};

export default Employees;
