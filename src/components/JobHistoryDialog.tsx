
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Employee, JobHistory, Department, Job } from "@/types/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Form schema for job history validation
const jobHistorySchema = z.object({
  empno: z.string().min(1, "Employee number is required"),
  jobcode: z.string().min(1, "Job code is required"),
  deptcode: z.string().min(1, "Department code is required"),
  effdate: z.string().min(1, "Effective date is required"),
  salary: z.coerce.number().min(0, "Salary must be a positive number"),
});

type JobHistoryFormValues = z.infer<typeof jobHistorySchema>;

interface JobHistoryDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JobHistoryWithDetails extends JobHistory {
  job?: {
    jobdesc: string | null;
  };
  department?: {
    deptname: string | null;
  };
}

const JobHistoryDialog = ({ employee, open, onOpenChange }: JobHistoryDialogProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentJobHistory, setCurrentJobHistory] = useState<JobHistoryWithDetails | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch job history for the current employee
  const { data: jobHistory, isLoading } = useQuery({
    queryKey: ["jobHistory", employee?.empno],
    queryFn: async () => {
      if (!employee) return [];
      
      const { data, error } = await supabase
        .from("jobhistory")
        .select(`
          *,
          job:jobcode (
            jobdesc
          ),
          department:deptcode (
            deptname
          )
        `)
        .eq("empno", employee.empno)
        .order("effdate", { ascending: false });
      
      if (error) throw new Error(error.message);
      return data as JobHistoryWithDetails[];
    },
    enabled: !!employee,
  });

  // Fetch jobs for dropdown
  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data as Job[];
    },
  });

  // Fetch departments for dropdown
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("department")
        .select("*");
      
      if (error) throw new Error(error.message);
      return data as Department[];
    },
  });

  // Add job history form
  const addJobHistoryForm = useForm<JobHistoryFormValues>({
    resolver: zodResolver(jobHistorySchema),
    defaultValues: {
      empno: employee?.empno || "",
      jobcode: "",
      deptcode: "",
      effdate: new Date().toISOString().split("T")[0],
      salary: 0,
    },
  });

  // Edit job history form
  const editJobHistoryForm = useForm<JobHistoryFormValues>({
    resolver: zodResolver(jobHistorySchema),
    defaultValues: {
      empno: "",
      jobcode: "",
      deptcode: "",
      effdate: "",
      salary: 0,
    },
  });

  // Update forms when employee changes
  useEffect(() => {
    if (employee) {
      addJobHistoryForm.setValue("empno", employee.empno);
    }
  }, [employee, addJobHistoryForm]);

  // Create job history mutation
  const createJobHistoryMutation = useMutation({
    mutationFn: async (newJobHistory: JobHistoryFormValues) => {
      const jobHistoryToInsert = {
        empno: newJobHistory.empno,
        jobcode: newJobHistory.jobcode,
        deptcode: newJobHistory.deptcode,
        effdate: newJobHistory.effdate,
        salary: newJobHistory.salary,
      };
      
      const { data, error } = await supabase
        .from("jobhistory")
        .insert(jobHistoryToInsert)
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobHistory", employee?.empno] });
      setIsAddOpen(false);
      toast.success("Job history entry added successfully");
    },
    onError: (error) => {
      toast.error(`Error adding job history: ${error.message}`);
    },
  });

  // Update job history mutation
  const updateJobHistoryMutation = useMutation({
    mutationFn: async (jobHistory: JobHistoryFormValues) => {
      const jobHistoryToUpdate = {
        empno: jobHistory.empno,
        jobcode: jobHistory.jobcode,
        deptcode: jobHistory.deptcode,
        effdate: jobHistory.effdate,
        salary: jobHistory.salary,
      };
      
      const { data, error } = await supabase
        .from("jobhistory")
        .update(jobHistoryToUpdate)
        .eq("empno", jobHistory.empno)
        .eq("jobcode", jobHistory.jobcode)
        .eq("effdate", jobHistory.effdate)
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobHistory", employee?.empno] });
      setIsEditOpen(false);
      toast.success("Job history updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating job history: ${error.message}`);
    },
  });

  // Delete job history mutation
  const deleteJobHistoryMutation = useMutation({
    mutationFn: async (jobHistory: JobHistoryWithDetails) => {
      const { error } = await supabase
        .from("jobhistory")
        .delete()
        .eq("empno", jobHistory.empno)
        .eq("jobcode", jobHistory.jobcode)
        .eq("effdate", jobHistory.effdate);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobHistory", employee?.empno] });
      setIsDeleteOpen(false);
      toast.success("Job history deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting job history: ${error.message}`);
    },
  });

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "dd-MMM-yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Format salary
  const formatSalary = (salary: number | null) => {
    if (salary === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(salary);
  };

  // Handle edit button click
  const handleEditClick = (jobHistory: JobHistoryWithDetails) => {
    setCurrentJobHistory(jobHistory);
    editJobHistoryForm.reset({
      empno: jobHistory.empno,
      jobcode: jobHistory.jobcode,
      deptcode: jobHistory.deptcode || "",
      effdate: jobHistory.effdate,
      salary: jobHistory.salary || 0,
    });
    setIsEditOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (jobHistory: JobHistoryWithDetails) => {
    setCurrentJobHistory(jobHistory);
    setIsDeleteOpen(true);
  };

  // Reset forms when dialog closes
  useEffect(() => {
    if (!open) {
      setIsAddOpen(false);
      setIsEditOpen(false);
      setIsDeleteOpen(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Job History</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm text-muted-foreground">Employee Number</p>
                <p className="text-lg font-semibold">{employee?.empno || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Employee Name</p>
                <p className="text-lg font-semibold">{employee ? `${employee.lastname}, ${employee.firstname}` : "N/A"}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Effectivity Date</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading job history...
                    </TableCell>
                  </TableRow>
                ) : jobHistory && jobHistory.length > 0 ? (
                  jobHistory.map((history) => (
                    <TableRow key={`${history.empno}-${history.jobcode}-${history.effdate}`}>
                      <TableCell>{history.job?.jobdesc || history.jobcode}</TableCell>
                      <TableCell>{formatDate(history.effdate)}</TableCell>
                      <TableCell>{history.department?.deptname || history.deptcode || "N/A"}</TableCell>
                      <TableCell>{formatSalary(history.salary)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(history)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(history)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No job history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Job History
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Add Job History Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Job History</DialogTitle>
          </DialogHeader>
          
          <div className="bg-muted/50 p-3 rounded-md mb-4">
            <p className="text-sm font-medium">
              Adding job history for: <span className="font-semibold">{employee?.lastname}, {employee?.firstname} ({employee?.empno})</span>
            </p>
          </div>
          
          <Form {...addJobHistoryForm}>
            <form onSubmit={addJobHistoryForm.handleSubmit((data) => createJobHistoryMutation.mutate(data))} className="space-y-4">
              <FormField
                control={addJobHistoryForm.control}
                name="jobcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a job" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobs?.map((job) => (
                          <SelectItem key={job.jobcode} value={job.jobcode}>
                            {job.jobdesc || job.jobcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addJobHistoryForm.control}
                name="deptcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept.deptcode} value={dept.deptcode}>
                            {dept.deptname || dept.deptcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addJobHistoryForm.control}
                name="effdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addJobHistoryForm.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createJobHistoryMutation.isPending}>
                  {createJobHistoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Job History Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Job History</DialogTitle>
          </DialogHeader>
          
          <div className="bg-muted/50 p-3 rounded-md mb-4">
            <p className="text-sm font-medium">
              Editing job history for: <span className="font-semibold">{employee?.lastname}, {employee?.firstname} ({employee?.empno})</span>
            </p>
          </div>
          
          <Form {...editJobHistoryForm}>
            <form onSubmit={editJobHistoryForm.handleSubmit((data) => updateJobHistoryMutation.mutate(data))} className="space-y-4">
              <FormField
                control={editJobHistoryForm.control}
                name="jobcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a job" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobs?.map((job) => (
                          <SelectItem key={job.jobcode} value={job.jobcode}>
                            {job.jobdesc || job.jobcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editJobHistoryForm.control}
                name="deptcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept.deptcode} value={dept.deptcode}>
                            {dept.deptname || dept.deptcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editJobHistoryForm.control}
                name="effdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editJobHistoryForm.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateJobHistoryMutation.isPending}>
                  {updateJobHistoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Job History Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job history record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted/50 p-3 rounded-md my-2">
            <p className="text-sm">
              <span className="font-medium">Employee:</span> {employee?.lastname}, {employee?.firstname} ({employee?.empno})
            </p>
            {currentJobHistory && (
              <>
                <p className="text-sm"><span className="font-medium">Job:</span> {currentJobHistory.job?.jobdesc || currentJobHistory.jobcode}</p>
                <p className="text-sm"><span className="font-medium">Date:</span> {formatDate(currentJobHistory.effdate)}</p>
              </>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => currentJobHistory && deleteJobHistoryMutation.mutate(currentJobHistory)}
              disabled={deleteJobHistoryMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteJobHistoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default JobHistoryDialog;
