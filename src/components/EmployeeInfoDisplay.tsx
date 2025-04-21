
import { Employee } from "@/types/supabase";

const EmployeeInfoDisplay = ({ employee }: { employee: Employee | null }) => (
  <div className="bg-muted/50 p-4 rounded-md">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Employee Number</p>
        <p className="text-lg font-semibold text-neutral-800 dark:text-white">{employee?.empno || "N/A"}</p>
      </div>
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Employee Name</p>
        <p className="text-lg font-semibold text-neutral-800 dark:text-white">
          {employee ? `${employee.lastname}, ${employee.firstname}` : "N/A"}
        </p>
      </div>
    </div>
  </div>
);

export default EmployeeInfoDisplay;
