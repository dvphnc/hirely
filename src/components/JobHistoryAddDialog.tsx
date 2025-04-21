
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import EmployeeInfoDisplay from "./EmployeeInfoDisplay";
import { Job, Department } from "@/types/supabase";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const jobHistorySchema = z.object({
  empno: z.string().min(1, "Employee number is required"),
  jobcode: z.string().min(1, "Job code is required"),
  deptcode: z.string().min(1, "Department code is required"),
  effdate: z.string().min(1, "Effective date is required"),
  salary: z.coerce.number().min(0, "Salary must be a positive number"),
});
type JobHistoryFormValues = z.infer<typeof jobHistorySchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: JobHistoryFormValues) => void;
  isPending: boolean;
  employee: any;
  jobs: Job[] | undefined;
  departments: Department[] | undefined;
  addJobHistoryForm: ReturnType<typeof useForm<JobHistoryFormValues>>;
}
export default function JobHistoryAddDialog({ open, onOpenChange, onSubmit, isPending, employee, jobs, departments, addJobHistoryForm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Job History</DialogTitle>
        </DialogHeader>
        <EmployeeInfoDisplay employee={employee} />
        <Form {...addJobHistoryForm}>
          <form onSubmit={addJobHistoryForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={addJobHistoryForm.control}
              name="jobcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
