import { format, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { JobHistoryWithDetails } from "./JobHistoryTypes";

interface Props {
  jobHistory: JobHistoryWithDetails[] | undefined;
  isLoading: boolean;
  onEdit: (history: JobHistoryWithDetails) => void;
  onDelete: (history: JobHistoryWithDetails) => void;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "dd-MMM-yyyy");
  } catch (e) {
    return dateString;
  }
}

function formatSalary(salary: number | null) {
  if (salary === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(salary);
}

export default function JobHistoryTable({ jobHistory, isLoading, onEdit, onDelete }: Props) {
  return (
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
                      onClick={() => onEdit(history)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(history)}
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
  )
}
