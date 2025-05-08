import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Search, Plus, Edit, Trash2, Loader2, RefreshCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, usePermission } from "@/context/auth-context";
import { Label } from "@/components/ui/label";

// Form schema for department validation
const departmentSchema = z.object({
  deptcode: z.string().min(1, "Department code is required"),
  deptname: z.string().min(1, "Department name is required"),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

const Departments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const { canAdd, canEdit, canDelete } = usePermission('department');
  
  const { data: departments, isLoading, error, refetch } = useQuery({
    queryKey: ["departments", showDeleted],
    queryFn: async () => {
      let query = supabase
        .from("department")
        .select("*");
      
      // Only filter by deleted status if not showing deleted or if user is not admin
      if (!showDeleted || !isAdmin) {
        query = query.not('status', 'eq', 'deleted');
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      return data as Department[];
    },
  });

  // Create department mutation
  const createDepartmentMutation = useMutation({
    mutationFn: async (newDepartment: DepartmentFormValues) => {
      // Explicitly ensuring deptcode is required by creating a new object
      const departmentToInsert = {
        deptcode: newDepartment.deptcode, // This is required
        deptname: newDepartment.deptname,  // This is also required due to our schema
        status: 'added',
        stamp: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("department")
        .insert(departmentToInsert)
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsAddOpen(false);
      toast.success("Department added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding department: ${error.message}`);
    },
  });

  // Update department mutation
  const updateDepartmentMutation = useMutation({
    mutationFn: async (department: DepartmentFormValues) => {
      // Ensure deptcode is required for the update operation
      const departmentToUpdate = {
        deptcode: department.deptcode, // Required
        deptname: department.deptname,
        status: 'edited',
        stamp: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("department")
        .update(departmentToUpdate)
        .eq("deptcode", department.deptcode)
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsEditOpen(false);
      toast.success("Department updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating department: ${error.message}`);
    },
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: async (deptcode: string) => {
      const { error } = await supabase
        .from("department")
        .update({
          status: 'deleted',
          stamp: new Date().toISOString()
        })
        .eq("deptcode", deptcode);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsDeleteOpen(false);
      toast.success("Department deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting department: ${error.message}`);
    },
  });

  // Restore department mutation
  const restoreDepartmentMutation = useMutation({
    mutationFn: async (deptcode: string) => {
      const { error } = await supabase
        .from("department")
        .update({
          status: 'restored',
          stamp: new Date().toISOString()
        })
        .eq("deptcode", deptcode);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department restored successfully");
    },
    onError: (error) => {
      toast.error(`Error restoring department: ${error.message}`);
    },
  });

  // Handle restore department
  const handleRestoreDepartment = (department: Department) => {
    restoreDepartmentMutation.mutate(department.deptcode);
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

  const filteredDepartments = departments?.filter((department) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      department.deptcode.toLowerCase().includes(searchLower) ||
      (department.deptname && department.deptname.toLowerCase().includes(searchLower))
    );
  });

  // Add Department Form
  const addDepartmentForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      deptcode: "",
      deptname: "",
    },
  });

  // Edit Department Form
  const editDepartmentForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      deptcode: "",
      deptname: "",
    },
  });

  // Handle opening the edit dialog
  const handleEditClick = (department: Department) => {
    setCurrentDepartment(department);
    editDepartmentForm.reset({
      deptcode: department.deptcode,
      deptname: department.deptname || "",
    });
    setIsEditOpen(true);
  };

  // Handle opening the delete dialog
  const handleDeleteClick = (department: Department) => {
    setCurrentDepartment(department);
    setIsDeleteOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Departments</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="instagram-gradient" disabled={!canAdd}>
                <Plus className="mr-2 h-4 w-4" /> Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
              </DialogHeader>
              <Form {...addDepartmentForm}>
                <form onSubmit={addDepartmentForm.handleSubmit((data) => createDepartmentMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={addDepartmentForm.control}
                    name="deptcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter department code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addDepartmentForm.control}
                    name="deptname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter department name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createDepartmentMutation.isPending}>
                      {createDepartmentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Department
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Department Management</CardTitle>
            <div className="space-y-4 mt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by department code or name..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-deleted-departments"
                    checked={showDeleted}
                    onChange={(e) => setShowDeleted(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="show-deleted-departments">Show deleted records</Label>
                </div>
              )}
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
                    {filteredDepartments && filteredDepartments.length > 0 ? (
                      filteredDepartments.map((department) => (
                        <TableRow key={department.deptcode} className={department.status === 'deleted' ? "bg-muted/30" : ""}>
                          <TableCell className="font-medium">{department.deptcode}</TableCell>
                          <TableCell>{department.deptname || "N/A"}</TableCell>
                          {isAdmin && (
                            <>
                              <TableCell>
                                <span className={`capitalize ${
                                  department.status === 'deleted' 
                                    ? 'text-red-500' 
                                    : department.status === 'edited' 
                                    ? 'text-amber-500'
                                    : department.status === 'restored'
                                    ? 'text-blue-500'
                                    : 'text-green-500'
                                }`}>
                                  {department.status || 'added'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {department.stamp ? formatDateTime(department.stamp) : 'N/A'}
                              </TableCell>
                            </>
                          )}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditClick(department)}
                                disabled={!canEdit}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {isAdmin && department.status === 'deleted' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => handleRestoreDepartment(department)}
                                >
                                  <RefreshCcw className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(department)}
                                disabled={!canDelete}
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
                          colSpan={isAdmin ? 5 : 3}
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

      {/* Edit Department Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <Form {...editDepartmentForm}>
            <form onSubmit={editDepartmentForm.handleSubmit((data) => updateDepartmentMutation.mutate(data))} className="space-y-4">
              <FormField
                control={editDepartmentForm.control}
                name="deptcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department code" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editDepartmentForm.control}
                name="deptname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateDepartmentMutation.isPending}>
                  {updateDepartmentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Department
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the department <strong>{currentDepartment?.deptname}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => currentDepartment && deleteDepartmentMutation.mutate(currentDepartment.deptcode)}
              disabled={deleteDepartmentMutation.isPending}
            >
              {deleteDepartmentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Departments;
