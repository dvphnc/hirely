
import { format, parseISO } from "date-fns";
import { Edit, History, Trash2, RefreshCcw } from "lucide-react";
import { Employee } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermission, useAuth } from "@/context/auth-context";

interface EmployeeTableProps {
  employees: Employee[] | undefined;
  isLoading: boolean;
  onEditClick: (employee: Employee) => void;
  onDeleteClick: (employee: Employee) => void;
  onJobHistoryClick: (employee: Employee) => void;
  onRestoreClick?: (employee: Employee) => void;
}

export const EmployeeTable = ({
  employees,
  isLoading,
  onEditClick,
  onDeleteClick,
  onJobHistoryClick,
  onRestoreClick
}: EmployeeTableProps) => {
  const { isAdmin } = useAuth();
  const { canEdit, canDelete } = usePermission('employee');
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
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
            <TableHead>Employee No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Birth Date</TableHead>
            <TableHead>Hire Date</TableHead>
            <TableHead>Separation Date</TableHead>
            {isAdmin && (
              <>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </>
            )}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.empno} className={employee.sepdate ? "bg-muted/30" : ""}>
              <TableCell className="font-medium">{employee.empno}</TableCell>
              <TableCell>
                {employee.lastname}, {employee.firstname}
              </TableCell>
              <TableCell>{employee.gender || "N/A"}</TableCell>
              <TableCell>{formatDate(employee.birthdate)}</TableCell>
              <TableCell>{formatDate(employee.hiredate)}</TableCell>
              <TableCell>
                {employee.sepdate ? (
                  <span className="text-muted-foreground">
                    {formatDate(employee.sepdate)}
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Active
                  </span>
                )}
              </TableCell>
              {isAdmin && (
                <>
                  <TableCell>
                    <span className={`capitalize ${
                      employee.status === 'deleted' 
                        ? 'text-red-500' 
                        : employee.status === 'edited' 
                        ? 'text-amber-500'
                        : employee.status === 'restored'
                        ? 'text-blue-500'
                        : 'text-green-500'
                    }`}>
                      {employee.status || 'added'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {employee.stamp ? formatDate(employee.stamp) : 'N/A'}
                  </TableCell>
                </>
              )}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClick(employee)}
                    disabled={!canEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDeleteClick(employee)}
                    disabled={!canDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
