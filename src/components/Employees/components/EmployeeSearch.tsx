
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface EmployeeSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
  showDeleted?: boolean;
  onShowDeletedChange?: (value: boolean) => void;
  isAdmin?: boolean;
}

export const EmployeeSearch = ({ 
  searchTerm, 
  onSearchChange, 
  showInactive, 
  onShowInactiveChange,
  showDeleted = false,
  onShowDeletedChange,
  isAdmin = false
}: EmployeeSearchProps) => {
  const handleShowInactiveChange = (checked: boolean) => {
    onShowInactiveChange(checked);
    localStorage.setItem('showInactive', checked.toString());
  };

  return (
    <div className="space-y-4 mt-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search employees..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-inactive" 
            checked={showInactive} 
            onCheckedChange={handleShowInactiveChange}
          />
          <Label htmlFor="show-inactive">Show inactive employees</Label>
        </div>
        
        {isAdmin && onShowDeletedChange && (
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-deleted" 
              checked={showDeleted} 
              onCheckedChange={onShowDeletedChange}
            />
            <Label htmlFor="show-deleted">Show deleted records</Label>
          </div>
        )}
      </div>
    </div>
  );
};
