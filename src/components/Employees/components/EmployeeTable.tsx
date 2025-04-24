
import React from "react";
import { Employee } from "@/types/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { RestoreAction } from "@/components/RestoreAction";
import { useAuth } from "@/context/auth-context";
import { format } from "date-fns";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onEditClick?: (employee: Employee) => void;
  onDeleteClick?: (employee: Employee) => void;
  onJobHistoryClick: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  isLoading,
  onEditClick,
  onDeleteClick,
  onJobHistoryClick
}) => {
  const { isAdmin } = useAuth();

  if (isLoading) {
    return <div className="py-4 text-center">Loading employees...</div>;
  }

  if (!employees || employees.length === 0) {
    return <div className="py-4 text-center">No employees found</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Birth Date</TableHead>
            <TableHead>Hire Date</TableHead>
            <TableHead>Separation Date</TableHead>
            {isAdmin && <TableHead>Status</TableHead>}
            {isAdmin && <TableHead>Timestamp</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.empno}>
              <TableCell className="font-medium">{employee.empno}</TableCell>
              <TableCell>
                {employee.lastname}, {employee.firstname}
              </TableCell>
              <TableCell>{employee.gender}</TableCell>
              <TableCell>
                {employee.birthdate ? 
                  format(new Date(employee.birthdate), 'MM/dd/yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {employee.hiredate ? 
                  format(new Date(employee.hiredate), 'MM/dd/yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {employee.sepdate ? 
                  format(new Date(employee.sepdate), 'MM/dd/yyyy') : 'N/A'}
              </TableCell>
              {isAdmin && <TableCell>{employee.status || 'N/A'}</TableCell>}
              {isAdmin && <TableCell>{employee.stamp ? 
                format(new Date(employee.stamp), 'MM/dd/yyyy HH:mm') : 'N/A'}</TableCell>}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onJobHistoryClick(employee)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {onEditClick && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditClick(employee)}
                      className="h-8 w-8 p-0"
                      disabled={!onEditClick}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onDeleteClick && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteClick(employee)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                      disabled={!onDeleteClick}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {isAdmin && employee.status === 'deleted' && (
                    <RestoreAction
                      tableName="employee"
                      primaryKey="empno"
                      primaryKeyValue={employee.empno}
                      queryKey="employees"
                    />
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
