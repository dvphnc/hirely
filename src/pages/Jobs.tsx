
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
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react";
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
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data as Job[];
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (newJob: JobFormValues) => {
      const { data, error } = await supabase
        .from("job")
        .insert([newJob])
        .select();
      
      if (error) throw new Error(error.message);
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
      const { data, error } = await supabase
        .from("job")
        .update(job)
        .eq("jobcode", job.jobcode)
        .select();
      
      if (error) throw new Error(error.message);
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
      const { error } = await supabase
        .from("job")
        .delete()
        .eq("jobcode", jobcode);
      
      if (error) throw new Error(error.message);
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

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Jobs</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="instagram-gradient">
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
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search by job code or description..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs && filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <TableRow key={job.jobcode}>
                          <TableCell className="font-medium">{job.jobcode}</TableCell>
                          <TableCell>{job.jobdesc || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditClick(job)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(job)}
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
