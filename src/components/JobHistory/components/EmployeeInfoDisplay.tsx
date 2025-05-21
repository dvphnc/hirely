
import { Employee } from "@/types/supabase";
import { useUserManagement } from "@/hooks/useUserManagement";

interface EmployeeInfoDisplayProps {
  employee: Employee | null;
}

const EmployeeInfoDisplay = ({ employee }: EmployeeInfoDisplayProps) => {
  const { userEmails } = useUserManagement();

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
    <div className="bg-muted/50 p-4 rounded-md">
      <div className="grid grid-cols-2 gap-4 mb-2">
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
      
      <div className="grid grid-cols-2 gap-4 text-sm border-t pt-2 border-neutral-200 dark:border-neutral-700">
        <div>
          <p className="text-neutral-500 dark:text-neutral-400">Last Updated</p>
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            {formatDateTime(employee?.updated_at || employee?.stamp)}
          </p>
        </div>
        <div>
          <p className="text-neutral-500 dark:text-neutral-400">Updated By</p>
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            {getUserEmail(employee?.updated_by)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfoDisplay;
