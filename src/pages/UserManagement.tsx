
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth, UserRole, TablePermission } from "@/context/auth-context";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Shield, Users, Ban, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define types for user management
interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  created_at: string;
}

// User edit form schema
const userUpdateSchema = z.object({
  role: z.enum(["admin", "user", "blocked"]),
});

type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;

// Permission edit form schema
const permissionSchema = z.object({
  can_view: z.boolean(),
  can_add: z.boolean(),
  can_edit: z.boolean(),
  can_delete: z.boolean(),
});

type PermissionFormValues = z.infer<typeof permissionSchema>;

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("employee");

  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Join auth.users with user_profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("*");
      
      if (profilesError) throw profilesError;

      // Get emails from auth.users
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Merge data
      const mergedUsers = profiles.map(profile => {
        const authUser = authUsers.find(user => user.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email || "Unknown",
          name: profile.name,
          role: profile.role,
          created_at: profile.created_at
        };
      });

      return mergedUsers as User[];
    },
    enabled: isAdmin, // Only run if user is admin
  });

  // Fetch user permissions for the selected user
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["user-permissions", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];

      const { data, error } = await supabase
        .from("user_permissions")
        .select("*")
        .eq("user_id", selectedUser.id);

      if (error) throw error;
      return data as TablePermission[];
    },
    enabled: !!selectedUser?.id && isPermissionsOpen,
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      const { error } = await supabase
        .from("user_profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditOpen(false);
      toast.success("User role updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Error updating user role: ${error.message}`);
    },
  });

  // Update user permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      tableName, 
      permissions 
    }: { 
      userId: string, 
      tableName: string, 
      permissions: PermissionFormValues 
    }) => {
      const { error } = await supabase
        .from("user_permissions")
        .update({ 
          ...permissions, 
          updated_at: new Date().toISOString() 
        })
        .eq("user_id", userId)
        .eq("table_name", tableName);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions", variables.userId] });
      toast.success(`Permissions updated for ${variables.tableName} table`);
    },
    onError: (error: any) => {
      toast.error(`Error updating permissions: ${error.message}`);
    },
  });

  // Filter users based on search term
  const filteredUsers = users?.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.name && user.name.toLowerCase().includes(searchLower))
    );
  });

  // User role update form
  const userForm = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      role: "user",
    },
  });

  // Permissions form for each table
  const employeePermissionsForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      can_view: true,
      can_add: true,
      can_edit: true,
      can_delete: true,
    },
  });

  const jobPermissionsForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      can_view: true,
      can_add: true,
      can_edit: true,
      can_delete: true,
    },
  });

  const departmentPermissionsForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      can_view: true,
      can_add: true,
      can_edit: true,
      can_delete: true,
    },
  });

  const jobhistoryPermissionsForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      can_view: true,
      can_add: true,
      can_edit: true,
      can_delete: true,
    },
  });

  // Handle opening the edit dialog
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    userForm.reset({
      role: user.role,
    });
    setIsEditOpen(true);
  };

  // Handle opening the permissions dialog
  const handlePermissionsClick = (user: User) => {
    setSelectedUser(user);
    setIsPermissionsOpen(true);
  };

  // Update form values when permissions data is loaded
  useEffect(() => {
    if (permissions) {
      // Find permissions for each table and update the respective form
      const employeePerms = permissions.find(p => p.table_name === "employee");
      if (employeePerms) {
        employeePermissionsForm.reset({
          can_view: employeePerms.can_view,
          can_add: employeePerms.can_add,
          can_edit: employeePerms.can_edit,
          can_delete: employeePerms.can_delete,
        });
      }

      const jobPerms = permissions.find(p => p.table_name === "job");
      if (jobPerms) {
        jobPermissionsForm.reset({
          can_view: jobPerms.can_view,
          can_add: jobPerms.can_add,
          can_edit: jobPerms.can_edit,
          can_delete: jobPerms.can_delete,
        });
      }

      const departmentPerms = permissions.find(p => p.table_name === "department");
      if (departmentPerms) {
        departmentPermissionsForm.reset({
          can_view: departmentPerms.can_view,
          can_add: departmentPerms.can_add,
          can_edit: departmentPerms.can_edit,
          can_delete: departmentPerms.can_delete,
        });
      }

      const jobhistoryPerms = permissions.find(p => p.table_name === "jobhistory");
      if (jobhistoryPerms) {
        jobhistoryPermissionsForm.reset({
          can_view: jobhistoryPerms.can_view,
          can_add: jobhistoryPerms.can_add,
          can_edit: jobhistoryPerms.can_edit,
          can_delete: jobhistoryPerms.can_delete,
        });
      }
    }
  }, [permissions]);

  // If not admin, redirect or show not authorized message
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <Shield className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-500 text-center">
            You don't have permission to access this page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Users</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">Loading users...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers && filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.name || "N/A"}</TableCell>
                          <TableCell>
                            <span 
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                user.role === "admin" 
                                  ? "bg-blue-100 text-blue-800"
                                  : user.role === "blocked"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(user)}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePermissionsClick(user)}
                                disabled={user.role !== "user"}
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No users found
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

      {/* Edit User Role Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit((data) => {
              if (!selectedUser) return;
              updateRoleMutation.mutate({ userId: selectedUser.id, role: data.role });
            })} 
            className="space-y-4 pt-2"
            >
              <FormField
                control={userForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            <span>User</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="blocked">
                          <div className="flex items-center">
                            <Ban className="mr-2 h-4 w-4" />
                            <span>Blocked</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Admins have full access, users have restricted access, and blocked users cannot access the system.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* User Permissions Dialog */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Set permissions for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {isLoadingPermissions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="employee" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="employee">Employees</TabsTrigger>
                <TabsTrigger value="job">Jobs</TabsTrigger>
                <TabsTrigger value="department">Departments</TabsTrigger>
                <TabsTrigger value="jobhistory">Job History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="employee">
                <Form {...employeePermissionsForm}>
                  <form onSubmit={employeePermissionsForm.handleSubmit((data) => {
                    if (!selectedUser) return;
                    updatePermissionsMutation.mutate({
                      userId: selectedUser.id,
                      tableName: "employee",
                      permissions: data
                    });
                  })}
                  className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={employeePermissionsForm.control}
                        name="can_view"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can View</FormLabel>
                              <FormDescription>
                                User can see employee records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={employeePermissionsForm.control}
                        name="can_add"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Add</FormLabel>
                              <FormDescription>
                                User can add new employee records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={employeePermissionsForm.control}
                        name="can_edit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Edit</FormLabel>
                              <FormDescription>
                                User can edit employee records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={employeePermissionsForm.control}
                        name="can_delete"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Delete</FormLabel>
                              <FormDescription>
                                User can delete employee records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-4" 
                      disabled={updatePermissionsMutation.isPending}
                    >
                      {updatePermissionsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Employee Permissions
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="job">
                <Form {...jobPermissionsForm}>
                  <form onSubmit={jobPermissionsForm.handleSubmit((data) => {
                    if (!selectedUser) return;
                    updatePermissionsMutation.mutate({
                      userId: selectedUser.id,
                      tableName: "job",
                      permissions: data
                    });
                  })}
                  className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={jobPermissionsForm.control}
                        name="can_view"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can View</FormLabel>
                              <FormDescription>
                                User can see job records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jobPermissionsForm.control}
                        name="can_add"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Add</FormLabel>
                              <FormDescription>
                                User can add new job records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jobPermissionsForm.control}
                        name="can_edit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Edit</FormLabel>
                              <FormDescription>
                                User can edit job records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jobPermissionsForm.control}
                        name="can_delete"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Delete</FormLabel>
                              <FormDescription>
                                User can delete job records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-4" 
                      disabled={updatePermissionsMutation.isPending}
                    >
                      {updatePermissionsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Job Permissions
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="department">
                <Form {...departmentPermissionsForm}>
                  <form onSubmit={departmentPermissionsForm.handleSubmit((data) => {
                    if (!selectedUser) return;
                    updatePermissionsMutation.mutate({
                      userId: selectedUser.id,
                      tableName: "department",
                      permissions: data
                    });
                  })}
                  className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={departmentPermissionsForm.control}
                        name="can_view"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can View</FormLabel>
                              <FormDescription>
                                User can see department records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={departmentPermissionsForm.control}
                        name="can_add"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Add</FormLabel>
                              <FormDescription>
                                User can add new department records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={departmentPermissionsForm.control}
                        name="can_edit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Edit</FormLabel>
                              <FormDescription>
                                User can edit department records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={departmentPermissionsForm.control}
                        name="can_delete"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Delete</FormLabel>
                              <FormDescription>
                                User can delete department records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-4" 
                      disabled={updatePermissionsMutation.isPending}
                    >
                      {updatePermissionsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Department Permissions
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="jobhistory">
                <Form {...jobhistoryPermissionsForm}>
                  <form onSubmit={jobhistoryPermissionsForm.handleSubmit((data) => {
                    if (!selectedUser) return;
                    updatePermissionsMutation.mutate({
                      userId: selectedUser.id,
                      tableName: "jobhistory",
                      permissions: data
                    });
                  })}
                  className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={jobhistoryPermissionsForm.control}
                        name="can_view"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can View</FormLabel>
                              <FormDescription>
                                User can see job history records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jobhistoryPermissionsForm.control}
                        name="can_add"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Add</FormLabel>
                              <FormDescription>
                                User can add new job history records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jobhistoryPermissionsForm.control}
                        name="can_edit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Edit</FormLabel>
                              <FormDescription>
                                User can edit job history records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jobhistoryPermissionsForm.control}
                        name="can_delete"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Can Delete</FormLabel>
                              <FormDescription>
                                User can delete job history records
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-4" 
                      disabled={updatePermissionsMutation.isPending}
                    >
                      {updatePermissionsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Job History Permissions
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPermissionsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserManagement;
