
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Department, Job } from "@/types/supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobHistoryFormValues, jobHistorySchema } from "../types/JobHistoryTypes";

interface AddJobHistoryFormProps {
  employeeEmpno: string | null | undefined;
  jobs: Job[] | undefined;
  departments: Department[] | undefined;
  onSubmit: (data: JobHistoryFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const AddJobHistoryForm = ({
  employeeEmpno,
  jobs,
  departments,
  onSubmit,
  isSubmitting,
  onCancel
}: AddJobHistoryFormProps) => {
  const form = useForm<JobHistoryFormValues>({
    resolver: zodResolver(jobHistorySchema),
    defaultValues: {
      empno: employeeEmpno || "",
      jobcode: "",
      deptcode: "",
      effdate: new Date().toISOString().split("T")[0],
      salary: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddJobHistoryForm;
