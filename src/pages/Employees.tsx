
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/supabase";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data as Employee[];
    },
  });

  const filteredEmployees = employees?.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.empno.toLowerCase().includes(searchLower) ||
      (employee.lastname && employee.lastname.toLowerCase().includes(searchLower)) ||
      (employee.firstname && employee.firstname.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employees</h1>
          <Button className="instagram-gradient">
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Employee Management</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by employee number, name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">Loading employees...</div>
            ) : error ? (
              <div className="flex justify-center py-8 text-red-500">
                Error loading employees
              </div>
            ) : (
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees && filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee.empno}>
                          <TableCell className="font-medium">{employee.empno}</TableCell>
                          <TableCell>
                            {employee.lastname}, {employee.firstname}
                          </TableCell>
                          <TableCell>{employee.gender || "N/A"}</TableCell>
                          <TableCell>{formatDate(employee.birthdate)}</TableCell>
                          <TableCell>{formatDate(employee.hiredate)}</TableCell>
                          <TableCell>
                            {employee.sepdate ? formatDate(employee.sepdate) : "Active"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No employees found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Employees;
