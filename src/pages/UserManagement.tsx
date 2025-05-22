
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserManagement } from "@/hooks/useUserManagement";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Search, UserCog, Shield, ShieldAlert, ShieldCheck, Trash2, AlertTriangle } from "lucide-react";
import { UserRole } from "@/context/auth-context";
import { ProfileWithEmail, UserPermission, MANAGED_TABLES, UserProfile } from "@/types/UserManagement";

// Define types for the tables
const tables = MANAGED_TABLES;

const UserManagement = () => {
  const navigate = useNavigate();
  const { isAdmin, user, session, fetchUserData } = useAuth();
  const queryClient = useQueryClient();
  const { userEmails, isLoadingEmails, isLoadingPermissions, setUserRole, deleteUser, fetchUserPermissions } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<ProfileWithEmail | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [isLoadingDialog, setIsLoadingDialog] = useState(false);

  // Wrapper for refreshing session
  const refreshSession = useCallback(async () => {
    try {
      console.log("Manually refreshing auth session");
      
      // First attempt to refresh the session
      const { data } = await supabase.auth.refreshSession();
      
      if (data.session) {
        console.log("Session refresh successful");
        
        // After successful refresh, re-fetch user data
        await fetchUserData();
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['users'] });
        return true;
      } else {
        console.log("Session refresh failed - no session returned");
        return false;
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      return false;
    }
  }, [queryClient, fetchUserData]);

  // Check admin status and refresh session when component mounts
  useEffect(() => {
    // Function to verify authorization
    const verifyAdminAccess = async () => {
      console.log("Verifying admin access:", { isAdmin, hasUser: !!user });
      
      if (!user || !session) {
        // No user or session, redirect to signin
        navigate("/signin");
        toast.error("You need to sign in to access this page");
        return;
      }
      
      if (!isAdmin) {
        // Not an admin user, try refreshing session and checking again
        const refreshSucceeded = await refreshSession();
        
        // After refresh, if still not admin, redirect
        if (!refreshSucceeded || !isAdmin) {
          navigate("/dashboard");
          toast.error("You don't have permission to access this page");
        }
      }
    };
    
    verifyAdminAccess();
    
    // Set up regular session refresh
    const refreshInterval = setInterval(() => {
      if (user && session) {
        refreshSession();
      }
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [isAdmin, navigate, user, session, refreshSession]);
  
  // Enhanced session refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (user && session) {
        refreshSession();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, session, refreshSession]);

  // Fetch profiles with user emails
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // Ensure we have a fresh session before making the request
      await refreshSession();
      
      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");
      
      if (profilesError) throw profilesError;
      
      // Map profiles with actual emails from the userEmails object
      return profiles?.map(profile => {
        // Get email from userEmails if available, or use empty placeholder
        let email = userEmails?.[profile.id] || "(Email unavailable)";
        
        return {
          id: profile.id,
          email: email,
          role: profile.role,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          updated_by: profile.updated_by
        } as ProfileWithEmail;
      }) || [];
    },
    enabled: isAdmin && !isLoadingEmails && !!session,
    refetchInterval: 30000, // Refresh data every 30 seconds
  });

  // Get updated_by user emails
  const { data: updatedByEmails } = useQuery({
    queryKey: ['updated-by-emails'],
    queryFn: async () => {
      const uniqueUserIds = new Set<string>();
      
      // Collect all unique user IDs from updated_by fields
      users?.forEach(u => {
        if (u.updated_by) uniqueUserIds.add(u.updated_by);
      });
      
      // If no updated_by IDs, return empty object
      if (uniqueUserIds.size === 0) return {};
      
      // For each unique ID, get the email if not already in userEmails
      const result: Record<string, string> = {};
      const promises: Promise<void>[] = [];
      
      uniqueUserIds.forEach(id => {
        if (!userEmails?.[id]) {
          promises.push(
            supabase.functions.invoke('get-user-emails', {
              body: { userIds: [id] }
            }).then(({ data }) => {
              if (data && data[id]) {
                result[id] = data[id];
              }
            }).catch(error => {
              console.error('Error fetching email for user:', id, error);
            })
          );
        } else if (userEmails[id]) {
          result[id] = userEmails[id];
        }
      });
      
      await Promise.all(promises);
      return result;
    },
    enabled: !!users && !!userEmails && !!session,
  });

  // Subscribe to realtime updates for the profiles table
  useEffect(() => {
    if (!isAdmin || !session) return;
    
    const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles'
        }, 
        (payload) => {
          console.log('Profile change detected:', payload);
          // Refresh user data when profiles change
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, queryClient, session]);

  // Subscribe to realtime updates for the user_permissions table
  useEffect(() => {
    if (!isAdmin || !session) return;
    
    const channel = supabase
      .channel('public:user_permissions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_permissions'
        }, 
        (payload) => {
          console.log('Permission change detected:', payload);
          // Refresh user data when permissions change
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, queryClient, session]);

  // Update user permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (updatedPermissions: UserPermission[]) => {
      // Ensure we have a fresh session before making the request
      await refreshSession();
      
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      for (const permission of updatedPermissions) {
        const { error } = await supabase
          .from("user_permissions")
          .upsert({
            id: permission.id,
            user_id: permission.user_id,
            table_name: permission.table_name,
            can_add: permission.can_add,
            can_edit: permission.can_edit,
            can_delete: permission.can_delete,
            updated_at: new Date().toISOString(),
            updated_by: currentUser?.id
          }, {
            onConflict: 'user_id,table_name'
          });
        
        if (error) throw error;
      }
      
      return updatedPermissions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User permissions updated");
      setIsPermissionDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Error updating permissions: ${error.message}`);
    },
  });

  const handleOpenRoleDialog = (user: ProfileWithEmail) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleUpdateRole = () => {
    if (selectedUser) {
      setUserRole.mutate({
        userId: selectedUser.id,
        role: selectedRole
      });
      setIsRoleDialogOpen(false);
    }
  };

  const handleOpenPermissionDialog = async (user: ProfileWithEmail) => {
    try {
      setIsLoadingDialog(true);
      setSelectedUser(user);
      
      // Ensure fresh session
      await refreshSession();
      
      // Fetch user permissions
      const userPermissions = await fetchUserPermissions(user.id);
      console.log("Fetched user permissions:", userPermissions);
      
      // Create default permissions for tables that don't have entries
      const defaultPermissions: UserPermission[] = [];
      
      tables.forEach(table => {
        if (!userPermissions.some(p => p.table_name === table.name)) {
          defaultPermissions.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            table_name: table.name,
            can_add: true,
            can_edit: true,
            can_delete: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            updated_by: null
          });
        }
      });
      
      setPermissions([...userPermissions, ...defaultPermissions]);
      setIsPermissionDialogOpen(true);
    } catch (error: any) {
      console.error("Error opening permission dialog:", error);
      toast.error(`Error loading permissions: ${error.message}`);
    } finally {
      setIsLoadingDialog(false);
    }
  };

  const handleUpdatePermissions = () => {
    if (permissions.length > 0) {
      updatePermissionsMutation.mutate(permissions);
    }
  };

  const handleOpenDeleteDialog = (user: ProfileWithEmail) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUser.mutate(selectedUser.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
        }
      });
    }
  };

  const updatePermission = (
    tableIndex: number,
    field: 'can_add' | 'can_edit' | 'can_delete',
    value: boolean
  ) => {
    setPermissions(prev => {
      const updated = [...prev];
      updated[tableIndex] = { ...updated[tableIndex], [field]: value };
      return updated;
    });
  };

  // Filter users based on search term
  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-5 w-5 text-blue-500" />;
      case 'user':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'blocked':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  // Format timestamp for better readability
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get the email of the user who last updated a record
  const getUpdaterEmail = (updatedById: string | undefined) => {
    if (!updatedById) return 'System';
    
    // Try to find the email in userEmails or updatedByEmails
    return (userEmails?.[updatedById] || updatedByEmails?.[updatedById] || 'Unknown User');
  };

  // If session is lost during interaction, show an error
  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-red-500">Your session has expired. Please sign in again.</p>
          <Button onClick={() => navigate('/signin')}>
            Sign In
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Loading state when fetching emails
  if (isLoadingEmails) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading user data...</p>
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
                placeholder="Search users by email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((userProfile) => (
                      <TableRow key={userProfile.id}>
                        <TableCell>{userProfile.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(userProfile.role)}
                            <span className="capitalize">{userProfile.role}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatTimestamp(userProfile.created_at)}
                        </TableCell>
                        <TableCell>
                          {formatTimestamp(userProfile.updated_at)}
                        </TableCell>
                        <TableCell>
                          {getUpdaterEmail(userProfile.updated_by)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleOpenRoleDialog(userProfile)}
                            >
                              <Shield className="h-4 w-4" />
                              Role
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleOpenPermissionDialog(userProfile)}
                              disabled={isLoadingDialog}
                            >
                              <UserCog className="h-4 w-4" />
                              {isLoadingDialog ? "Loading..." : "Permissions"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive hover:text-destructive"
                              onClick={() => handleOpenDeleteDialog(userProfile)}
                              disabled={userProfile.id === user?.id} // Prevent deleting self
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Update Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">User: {selectedUser?.email}</p>
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Role permissions:</span>
                <br />
                - Admin: Full system access and user management
                <br />
                - User: Basic system access with configurable permissions
                <br />
                - Blocked: No system access
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={setUserRole.isPending}
            >
              {setUserRole.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm font-medium">User: {selectedUser?.email}</p>
            
            <Tabs defaultValue="tables">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="tables">Table Permissions</TabsTrigger>
              </TabsList>
              <TabsContent value="tables" className="pt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead className="text-center">Add</TableHead>
                        <TableHead className="text-center">Edit</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission, index) => {
                        // Find table label
                        const tableInfo = tables.find(t => t.name === permission.table_name);
                        const tableName = tableInfo ? tableInfo.label : permission.table_name;
                        
                        return (
                          <TableRow key={permission.table_name}>
                            <TableCell>{tableName}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permission.can_add}
                                onCheckedChange={(checked) => 
                                  updatePermission(index, 'can_add', checked === true)
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permission.can_edit}
                                onCheckedChange={(checked) => 
                                  updatePermission(index, 'can_edit', checked === true)
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={permission.can_delete}
                                onCheckedChange={(checked) => 
                                  updatePermission(index, 'can_delete', checked === true)
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsPermissionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              disabled={updatePermissionsMutation.isPending}
            >
              {updatePermissionsMutation.isPending ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove all their data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">Are you sure you want to delete this user?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Email: {selectedUser?.email}
            </p>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserManagement;
