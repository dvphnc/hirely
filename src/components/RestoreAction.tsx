
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { restoreRecord } from "@/utils/restore-utils";
import { Restore } from "lucide-react";

interface RestoreActionProps {
  tableName: string;
  primaryKey: string;
  primaryKeyValue: string;
  queryKey: string | string[];
}

export function RestoreAction({ tableName, primaryKey, primaryKeyValue, queryKey }: RestoreActionProps) {
  const queryClient = useQueryClient();

  const handleRestore = async () => {
    await restoreRecord(tableName, primaryKey, primaryKeyValue, queryClient, queryKey);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRestore}
            className="text-green-500 hover:text-green-700 hover:bg-green-100"
          >
            <Restore className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Restore record</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
