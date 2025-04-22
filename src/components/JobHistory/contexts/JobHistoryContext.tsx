
import React, { createContext, useContext, useState } from 'react';
import { Employee } from "@/types/supabase";
import { JobHistoryWithDetails } from '../types/JobHistoryTypes';

interface JobHistoryContextType {
  currentEmployee: Employee | null;
  currentJobHistory: JobHistoryWithDetails | null;
  removingKey: string | null;
  isAddOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  setCurrentEmployee: (employee: Employee | null) => void;
  setCurrentJobHistory: (jobHistory: JobHistoryWithDetails | null) => void;
  setRemovingKey: (key: string | null) => void;
  setIsAddOpen: (isOpen: boolean) => void;
  setIsEditOpen: (isOpen: boolean) => void;
  setIsDeleteOpen: (isOpen: boolean) => void;
}

const JobHistoryContext = createContext<JobHistoryContextType | undefined>(undefined);

export const JobHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [currentJobHistory, setCurrentJobHistory] = useState<JobHistoryWithDetails | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <JobHistoryContext.Provider value={{
      currentEmployee,
      currentJobHistory,
      removingKey,
      isAddOpen,
      isEditOpen,
      isDeleteOpen,
      setCurrentEmployee,
      setCurrentJobHistory,
      setRemovingKey,
      setIsAddOpen,
      setIsEditOpen,
      setIsDeleteOpen,
    }}>
      {children}
    </JobHistoryContext.Provider>
  );
};

export const useJobHistoryContext = () => {
  const context = useContext(JobHistoryContext);
  if (context === undefined) {
    throw new Error('useJobHistoryContext must be used within a JobHistoryProvider');
  }
  return context;
};
