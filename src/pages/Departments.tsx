
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Department } from "@/types/supabase";
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

const Departments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: departments, isLoading, error } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("department")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data as Department[];
    },
  });

  const filteredDepartments = departments?.filter((department) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      department.deptcode.toLowerCase().includes(searchLower) ||
      (department.deptname && department.deptname.toLowerCase().includes(searchLower))
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Departments</h1>
          <Button className="instagram-gradient">
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Department Management</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by department code or name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">Loading departments...</div>
            ) : error ? (
              <div className="flex justify-center py-8 text-red-500">
                Error loading departments
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department Code</TableHead>
                      <TableHead>Department Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments && filteredDepartments.length > 0 ? (
                      filteredDepartments.map((department) => (
                        <TableRow key={department.deptcode}>
                          <TableCell className="font-medium">{department.deptcode}</TableCell>
                          <TableCell>{department.deptname || "N/A"}</TableCell>
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
                          colSpan={3}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No departments found
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

export default Departments;
