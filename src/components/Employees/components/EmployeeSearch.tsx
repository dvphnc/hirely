
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import { EmployeeSearchProps } from "../types/EmployeeTypes";

export const EmployeeSearch = ({
  searchTerm,
  onSearchChange,
  showInactive,
  onShowInactiveChange
}: EmployeeSearchProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mt-2">
      <div className="relative w-full md:w-auto flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search by employee number, name..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="show-inactive-toggle" className="text-sm font-medium">
          Show Inactive Employees
        </label>
        <Switch
          id="show-inactive-toggle"
          checked={showInactive}
          onCheckedChange={onShowInactiveChange}
        />
      </div>
    </div>
  );
};
