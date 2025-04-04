
import DashboardLayout from "@/components/DashboardLayout";
import { departments } from "@/services/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Departments = () => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Departments</h2>
      </div>
      
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Code</TableHead>
                <TableHead>Department Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.deptCode}>
                  <TableCell className="font-medium">{dept.deptCode}</TableCell>
                  <TableCell>{dept.deptName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Departments;
