
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
import { toast } from "sonner";

const Employees = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isJobHistoryOpen, setIsJobHistoryOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const { isAdmin } = useAuth();
  const { canAdd, canEdit, canDelete } = usePermission('employee');

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
    // Only allow editing if user has permission
    if (!canEdit && !isAdmin) {
      toast.error("You don't have permission to edit employees.");
      return;
    }
    setCurrentEmployee(employee);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    // Only allow deletion if user has permission
    if (!canDelete && !isAdmin) {
      toast.error("You don't have permission to delete employees.");
      return;
    }
    setCurrentEmployee(employee);
    setIsDeleteOpen(true);
  };

  const handleJobHistoryClick = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsJobHistoryOpen(true);
  };

  const handleConfirmDelete = () => {
    // Final check before deletion
    if (!canDelete && !isAdmin) {
      toast.error("You don't have permission to delete employees.");
      return;
    }
    
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
    // Only admins can restore
    if (!isAdmin) {
      toast.error("Only admins can restore deleted employees.");
      return;
    }
    
    restoreEmployeeMutation.mutate(employee.empno, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const handleAddClick = () => {
    if (!canAdd && !isAdmin) {
      toast.error("You don't have permission to add employees.");
      return;
    }
    setIsAddOpen(true);
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

  const hasAddPermission = canAdd || isAdmin;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employees</h1>
          {hasAddPermission ? (
            <Button
              className="instagram-gradient"
              onClick={handleAddClick}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          ) : (
            <Button
              className="instagram-gradient opacity-50 cursor-not-allowed"
              disabled={true}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          )}
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
              canEdit={canEdit || isAdmin}
              canDelete={canDelete || isAdmin}
            />
          </CardContent>
        </Card>
      </div>

      {hasAddPermission && (
        <AddEmployeeDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          nextEmpNo={nextEmpNo}
        />
      )}

      {(canEdit || isAdmin) && (
        <EditEmployeeDialog
          employee={currentEmployee}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onManageJobHistory={handleJobHistoryClick}
        />
      )}

      {(canDelete || isAdmin) && (
        <DeleteEmployeeDialog
          employee={currentEmployee}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirmDelete={handleConfirmDelete}
          isDeleting={deleteEmployeeMutation.isPending}
        />
      )}

      <JobHistoryDialog
        employee={currentEmployee}
        open={isJobHistoryOpen}
        onOpenChange={setIsJobHistoryOpen}
      />
    </DashboardLayout>
  );
};

export default Employees;
