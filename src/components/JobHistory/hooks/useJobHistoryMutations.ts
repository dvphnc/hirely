
import { useCreateJobHistory } from './mutations/useCreateJobHistory';
import { useUpdateJobHistory } from './mutations/useUpdateJobHistory';
import { useDeleteJobHistory } from './mutations/useDeleteJobHistory';

export const useJobHistoryMutations = (employeeEmpno: string | null | undefined) => {
  const createJobHistoryMutation = useCreateJobHistory(employeeEmpno);
  const updateJobHistoryMutation = useUpdateJobHistory(employeeEmpno);
  const deleteJobHistoryMutation = useDeleteJobHistory(employeeEmpno);

  return {
    createJobHistoryMutation,
    updateJobHistoryMutation,
    deleteJobHistoryMutation
  };
};
