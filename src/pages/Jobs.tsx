
import DashboardLayout from "@/components/DashboardLayout";
import { jobs } from "@/services/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Jobs = () => {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Jobs</h2>
      </div>
      
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Code</TableHead>
                <TableHead>Job Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.jobCode}>
                  <TableCell className="font-medium">{job.jobCode}</TableCell>
                  <TableCell>{job.jobDesc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
