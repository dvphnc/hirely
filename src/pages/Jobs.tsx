import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/supabase";
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
import { Label } from "@/components/ui/label";
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
import { createAuditTrail } from "@/utils/auditTrail";
import { useUserManagement } from "@/hooks/useUserManagement";

// Form schema for job validation
const jobSchema = z.object({
  jobcode: z.string().min(1, "Job code is required"),
  jobdesc: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const { canAdd, canEdit, canDelete } = usePermission('job');
  const { userEmails } = useUserManagement();
  
  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ["jobs", showDeleted],
    queryFn: async () => {
      let query = supabase
        .from("job")
        .select("*");
      
      // Only filter by deleted status if not showing deleted or if user is not admin
      if (!showDeleted || !isAdmin) {
        query = query.not('status', 'eq', 'deleted');
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      return data as Job[];
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (newJob: JobFormValues) => {
      // Permission check
      if (!canAdd && !isAdmin) {
        throw new Error("You do not have permission to add jobs");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) throw new Error("User not authenticated");
      
      // Explicitly ensuring jobcode is required by creating a new object
      const jobToInsert = {
        jobcode: newJob.jobcode, // This is required
        jobdesc: newJob.jobdesc,  // This is optional
        status: 'added',
        stamp: new Date().toISOString(),
        updated_by: userId,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("job")
        .insert(jobToInsert)
        .select();
      
      if (error) throw new Error(error.message);
      
      // Create audit trail
      if (data && data.length > 0) {
        await createAuditTrail(data[0], 'INSERT', 'job');
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsAddOpen(false);
      toast.success("Job added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding job: ${error.message}`);
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async (job: JobFormValues) => {
      // Permission check
      if (!canEdit && !isAdmin) {
        throw new Error("You do not have permission to edit jobs");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("job")
        .update({
          jobdesc: job.jobdesc,
          status: 'edited',
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq("jobcode", job.jobcode)
        .select();
      
      if (error) throw new Error(error.message);
      
      // Create audit trail
      if (data && data.length > 0) {
        await createAuditTrail(data[0], 'UPDATE', 'job');
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsEditOpen(false);
      toast.success("Job updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating job: ${error.message}`);
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobcode: string) => {
      // Permission check
      if (!canDelete && !isAdmin) {
        throw new Error("You do not have permission to delete jobs");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) throw new Error("User not authenticated");
      
      // First get the job record
      const { data: jobData, error: fetchError } = await supabase
        .from("job")
        .select('*')
        .eq("jobcode", jobcode)
        .single();
      
      if (fetchError) throw new Error(fetchError.message);
      
      // Then update it to mark as deleted
      const { data, error } = await supabase
        .from("job")
        .update({
          status: 'deleted',
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq("jobcode", jobcode)
        .select();
      
      if (error) throw new Error(error.message);
      
      // Create audit trail
      await createAuditTrail(jobData, 'DELETE', 'job');
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsDeleteOpen(false);
      toast.success("Job deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting job: ${error.message}`);
    },
  });

  // Restore job mutation
  const restoreJobMutation = useMutation({
    mutationFn: async (jobcode: string) => {
      // Only admins can restore
      if (!isAdmin) {
        throw new Error("Only administrators can restore deleted jobs");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("job")
        .update({
          status: 'restored',
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq("jobcode", jobcode)
        .select();
      
      if (error) throw new Error(error.message);
      
      // Create audit trail
      if (data && data.length > 0) {
        await createAuditTrail(data[0], 'UPDATE', 'job');
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job restored successfully");
    },
    onError: (error) => {
      toast.error(`Error restoring job: ${error.message}`);
    },
  });

  // Handle restore job
  const handleRestoreJob = (job: Job) => {
    restoreJobMutation.mutate(job.jobcode);
  };

  const filteredJobs = jobs?.filter((job) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      job.jobcode.toLowerCase().includes(searchLower) ||
      (job.jobdesc && job.jobdesc.toLowerCase().includes(searchLower))
    );
  });

  // Add Job Form
  const addJobForm = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobcode: "",
      jobdesc: "",
    },
  });

  // Edit Job Form
  const editJobForm = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobcode: "",
      jobdesc: "",
    },
  });

  // Handle opening the edit dialog
  const handleEditClick = (job: Job) => {
    setCurrentJob(job);
    editJobForm.reset({
      jobcode: job.jobcode,
      jobdesc: job.jobdesc || "",
    });
    setIsEditOpen(true);
  };

  // Handle opening the delete dialog
  const handleDeleteClick = (job: Job) => {
    setCurrentJob(job);
    setIsDeleteOpen(true);
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

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Jobs</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="instagram-gradient" disabled={!canAdd}>
                <Plus className="mr-2 h-4 w-4" /> Add Job
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Job</DialogTitle>
              </DialogHeader>
              <Form {...addJobForm}>
                <form onSubmit={addJobForm.handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={addJobForm.control}
                    name="jobcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter job code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addJobForm.control}
                    name="jobdesc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter job description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createJobMutation.isPending}>
                      {createJobMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Job
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Job Management</CardTitle>
            <div className="space-y-4 mt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by job code or description..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-deleted-jobs"
                    checked={showDeleted}
                    onChange={(e) => setShowDeleted(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="show-deleted-jobs">Show deleted records</Label>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">Loading jobs...</div>
            ) : error ? (
              <div className="flex justify-center py-8 text-red-500">
                Error loading jobs
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Code</TableHead>
                      <TableHead>Job Description</TableHead>
                      {isAdmin && (
                        <>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Updated By</TableHead>
                        </>
                      )}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs && filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <TableRow key={job.jobcode} className={job.status === 'deleted' ? "bg-muted/30" : ""}>
                          <TableCell className="font-medium">{job.jobcode}</TableCell>
                          <TableCell>{job.jobdesc || "N/A"}</TableCell>
                          {isAdmin && (
                            <>
                              <TableCell>
                                <span className={`capitalize ${
                                  job.status === 'deleted' 
                                    ? 'text-red-500' 
                                    : job.status === 'edited' 
                                    ? 'text-amber-500'
                                    : job.status === 'restored'
                                    ? 'text-blue-500'
                                    : 'text-green-500'
                                }`}>
                                  {job.status || 'added'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {job.updated_at ? formatDateTime(job.updated_at) : 
                                 job.stamp ? formatDateTime(job.stamp) : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {job.updated_by ? getUserEmail(job.updated_by) : 'N/A'}
                              </TableCell>
                            </>
                          )}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditClick(job)}
                                disabled={!canEdit}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {isAdmin && job.status === 'deleted' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => handleRestoreJob(job)}
                                >
                                  <RefreshCcw className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(job)}
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
                          colSpan={isAdmin ? 6 : 3}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No jobs found
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

      {/* Edit Job Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <Form {...editJobForm}>
            <form onSubmit={editJobForm.handleSubmit((data) => updateJobMutation.mutate(data))} className="space-y-4">
              <FormField
                control={editJobForm.control}
                name="jobcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter job code" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editJobForm.control}
                name="jobdesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter job description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateJobMutation.isPending}>
                  {updateJobMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Job
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Job Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the job <strong>{currentJob?.jobcode}</strong>?</p>
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
              onClick={() => currentJob && deleteJobMutation.mutate(currentJob.jobcode)}
              disabled={deleteJobMutation.isPending}
            >
              {deleteJobMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Jobs;
