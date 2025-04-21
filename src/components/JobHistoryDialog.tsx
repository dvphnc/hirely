
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Employee, Job, Department } from "@/types/supabase";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobHistoryTable from "./JobHistoryTable";
import JobHistoryAddDialog from "./JobHistoryAddDialog";
import JobHistoryEditDialog from "./JobHistoryEditDialog";
import JobHistoryDeleteDialog from "./JobHistoryDeleteDialog";
import { useJobHistoryDeleteMutation } from "./useJobHistoryMutations";
import { JobHistoryWithDetails, JobHistoryFormValues } from "./JobHistoryTypes";

const jobHistorySchema = z.object({
  empno: z.string().min(1, "Employee number is required"),
  jobcode: z.string().min(1, "Job code is required"),
  deptcode: z.string().min(1, "Department code is required"),
  effdate: z.string().min(1, "Effective date is required"),
  salary: z.coerce.number().min(0, "Salary must be a positive number"),
});

interface JobHistoryDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JobHistoryDialog({ employee, open, onOpenChange }: JobHistoryDialogProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentJobHistory, setCurrentJobHistory] = useState<JobHistoryWithDetails | null>(null);

  // Form setup
  const addJobHistoryForm = useForm<JobHistoryFormValues>({
    resolver: zodResolver(jobHistorySchema),
    defaultValues: {
      empno: employee?.empno || "",
      jobcode: "",
      deptcode: "",
      effdate: "",
      salary: 0,
    },
  });

  const editJobHistoryForm = useForm<JobHistoryFormValues>({
    resolver: zodResolver(jobHistorySchema),
    defaultValues: {
      empno: employee?.empno || "",
      jobcode: "",
      deptcode: "",
      effdate: "",
      salary: 0,
    },
  });

  // Queries
  const { data: jobHistory, isLoading: isJobHistoryLoading } = useQuery({
    queryKey: ["jobHistory", employee?.empno],
    queryFn: async () => {
      if (!employee?.empno) return [];

      const { data, error } = await supabase
        .from("jobhistory")
        .select(`
          *,
          job:jobcode(jobcode, jobdesc),
          department:deptcode(deptcode, deptname)
        `)
        .eq("empno", employee.empno)
        .order("effdate", { ascending: false });

      if (error) throw new Error(error.message);
      return data as JobHistoryWithDetails[];
    },
    enabled: !!employee?.empno && open,
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job")
        .select("*")
        .order("jobdesc");

      if (error) throw new Error(error.message);
      return data as Job[];
    },
    enabled: open,
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("department")
        .select("*")
        .order("deptname");

      if (error) throw new Error(error.message);
      return data as Department[];
    },
    enabled: open,
  });

  // Mutations
  const addJobHistoryMutation = useMutation({
    mutationFn: async (data: JobHistoryFormValues) => {
      const { error } = await supabase
        .from("jobhistory")
        .insert(data);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      setIsAddOpen(false);
      addJobHistoryForm.reset();
    },
  });

  const updateJobHistoryMutation = useMutation({
    mutationFn: async (data: JobHistoryFormValues) => {
      const { error } = await supabase
        .from("jobhistory")
        .update({
          deptcode: data.deptcode,
          salary: data.salary
        })
        .eq("empno", data.empno)
        .eq("jobcode", data.jobcode)
        .eq("effdate", data.effdate);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      setIsEditOpen(false);
      editJobHistoryForm.reset();
    },
  });

  // Delete mutation using the custom hook
  const deleteJobHistoryMutation = useJobHistoryDeleteMutation(employee?.empno);

  // Handlers
  const handleAddSubmit = (data: JobHistoryFormValues) => {
    addJobHistoryMutation.mutate(data);
  };

  const handleEditSubmit = (data: JobHistoryFormValues) => {
    updateJobHistoryMutation.mutate(data);
  };

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

  const handleDeleteClick = (jobHistory: JobHistoryWithDetails) => {
    setCurrentJobHistory(jobHistory);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (currentJobHistory) {
      deleteJobHistoryMutation.mutate(currentJobHistory);
      setIsDeleteOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Job History</h2>
          <Button onClick={() => {
            addJobHistoryForm.reset({
              empno: employee?.empno || "",
              jobcode: "",
              deptcode: "",
              effdate: "",
              salary: 0,
            });
            setIsAddOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Job History
          </Button>
        </div>

        {/* Job History Table */}
        <JobHistoryTable 
          jobHistory={jobHistory} 
          isLoading={isJobHistoryLoading} 
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Add Dialog */}
      <JobHistoryAddDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleAddSubmit}
        isPending={addJobHistoryMutation.isPending}
        employee={employee}
        jobs={jobs}
        departments={departments}
        addJobHistoryForm={addJobHistoryForm}
      />

      {/* Edit Dialog */}
      <JobHistoryEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleEditSubmit}
        isPending={updateJobHistoryMutation.isPending}
        employee={employee}
        jobs={jobs}
        departments={departments}
        editJobHistoryForm={editJobHistoryForm}
      />

      {/* Delete Dialog */}
      <JobHistoryDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDelete={handleDelete}
        isPending={deleteJobHistoryMutation.isPending}
        employee={employee}
        jobHistory={currentJobHistory}
      />
    </>
  );
}
