
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, ArchiveRestore, Clock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { usePermissions } from "@/context/auth-context";

interface DataTableActionsProps {
  tableName: 'employee' | 'job' | 'department' | 'jobhistory';
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  status?: string | null;
  stamp?: string | null;
  hideDelete?: boolean;
}

export function DataTableActions({
  tableName,
  onEdit,
  onDelete,
  onRestore,
  status,
  stamp,
  hideDelete = false
}: DataTableActionsProps) {
  const { isAdmin } = useAuth();
  const { canEdit, canDelete } = usePermissions(tableName);
  
  return (
    <div className="flex items-center justify-end gap-2">
      {isAdmin && stamp && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Last updated: {new Date(stamp).toLocaleString()}</p>
            <p>Status: {status || 'added'}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {onEdit && canEdit && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      {onDelete && canDelete && !hideDelete && (
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-700"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      {isAdmin && status === 'deleted' && onRestore && (
        <Button
          variant="outline"
          size="sm"
          className="text-green-500 hover:text-green-700"
          onClick={onRestore}
        >
          <ArchiveRestore className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
