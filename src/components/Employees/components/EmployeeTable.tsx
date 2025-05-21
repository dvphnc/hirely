
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, History, RefreshCcw } from "lucide-react";
import { Employee } from "@/types/supabase";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useAuth } from "@/context/auth-context";

interface EmployeeTableProps {
  employees: Employee[] | null;
  isLoading: boolean;
  onEditClick: (employee: Employee) => void;
  onDeleteClick: (employee: Employee) => void;
  onJobHistoryClick: (employee: Employee) => void;
  onRestoreClick?: (employee: Employee) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function EmployeeTable({
  employees,
  isLoading,
  onEditClick,
  onDeleteClick,
  onJobHistoryClick,
  onRestoreClick,
  canEdit,
  canDelete,
}: EmployeeTableProps) {
  const { isAdmin } = useAuth();
  const { userEmails } = useUserManagement();

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };
  
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  const getUserEmail = (userId: string | null) => {
    if (!userId || !userEmails) return "N/A";
    return userEmails[userId] || userId.substring(0, 8);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading employees...</div>;
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="flex justify-center py-8 text-muted-foreground">
        No employees found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Emp No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Birth Date</TableHead>
            <TableHead>Hire Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Updated By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow 
              key={employee.empno}
              className={employee.status === 'deleted' ? "bg-muted/30" : ""}
            >
              <TableCell className="font-medium">{employee.empno}</TableCell>
              <TableCell>{`${employee.lastname || ""}, ${
                employee.firstname || ""
              }`}</TableCell>
              <TableCell>{employee.gender || "N/A"}</TableCell>
              <TableCell>{formatDate(employee.birthdate)}</TableCell>
              <TableCell>{formatDate(employee.hiredate)}</TableCell>
              <TableCell>
                <span
                  className={`capitalize ${
                    employee.status === 'deleted'
                      ? 'text-red-500'
                      : employee.status === 'edited'
                      ? 'text-amber-500'
                      : employee.status === 'restored'
                      ? 'text-blue-500'
                      : 'text-green-500'
                  }`}
                >
                  {employee.status || 'active'}
                </span>
              </TableCell>
              <TableCell>
                {employee.updated_at ? formatDateTime(employee.updated_at) : 
                 employee.stamp ? formatDateTime(employee.stamp) : 'N/A'}
              </TableCell>
              <TableCell>
                {employee.updated_by ? getUserEmail(employee.updated_by) : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditClick(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onJobHistoryClick(employee)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  {isAdmin && employee.status === 'deleted' && onRestoreClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => onRestoreClick(employee)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => onDeleteClick(employee)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
