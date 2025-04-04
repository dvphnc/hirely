
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Edit, Trash } from "lucide-react";
import { Employee } from "@/types";
import { employees as initialEmployees } from "@/services/mockData";
import { format, parseISO } from "date-fns";

const Employees = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({
    empNo: "",
    firstName: "",
    lastName: "",
    gender: "Male",
    birthDate: "",
    hireDate: "",
    sepDate: null,
  });

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, employees]);

  const filterEmployees = () => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(
      (emp) =>
        emp.empNo.toLowerCase().includes(query) ||
        emp.firstName.toLowerCase().includes(query) ||
        emp.lastName.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const resetForm = () => {
    setFormData({
      empNo: "",
      firstName: "",
      lastName: "",
      gender: "Male",
      birthDate: "",
      hireDate: "",
      sepDate: null,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData(employee);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleAddEmployee = () => {
    const newEmployee = formData as Employee;
    
    // Validate required fields
    if (!newEmployee.empNo || !newEmployee.firstName || !newEmployee.lastName || 
        !newEmployee.birthDate || !newEmployee.hireDate) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    // Check if employee number already exists
    if (employees.some((emp) => emp.empNo === newEmployee.empNo)) {
      toast({
        variant: "destructive",
        title: "Duplicate employee number",
        description: "An employee with this number already exists.",
      });
      return;
    }
    
    setEmployees([...employees, newEmployee]);
    setIsAddDialogOpen(false);
    resetForm();
    toast({
      title: "Employee added",
      description: `${newEmployee.firstName} ${newEmployee.lastName} has been added successfully.`,
    });
  };

  const handleEditEmployee = () => {
    if (!selectedEmployee) return;
    
    const updatedEmployee = formData as Employee;
    
    // Validate required fields
    if (!updatedEmployee.firstName || !updatedEmployee.lastName || 
        !updatedEmployee.birthDate || !updatedEmployee.hireDate) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    const updatedEmployees = employees.map((emp) =>
      emp.empNo === selectedEmployee.empNo ? updatedEmployee : emp
    );
    
    setEmployees(updatedEmployees);
    setIsEditDialogOpen(false);
    resetForm();
    toast({
      title: "Employee updated",
      description: `${updatedEmployee.firstName} ${updatedEmployee.lastName} has been updated successfully.`,
    });
  };

  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return;
    
    const updatedEmployees = employees.filter(
      (emp) => emp.empNo !== selectedEmployee.empNo
    );
    
    setEmployees(updatedEmployees);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Employee deleted",
      description: `${selectedEmployee.firstName} ${selectedEmployee.lastName} has been deleted successfully.`,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold">Employees</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={openAddDialog} className="instagram-gradient whitespace-nowrap">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-lg border p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No employees found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try using different search terms."
                : "Get started by adding your first employee."}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Birth Date</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.empNo}>
                    <TableCell className="font-medium">{employee.empNo}</TableCell>
                    <TableCell>
                      {employee.lastName}, {employee.firstName}
                    </TableCell>
                    <TableCell>{employee.gender}</TableCell>
                    <TableCell>{formatDate(employee.birthDate)}</TableCell>
                    <TableCell>{formatDate(employee.hireDate)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.sepDate
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {employee.sepDate ? "Former" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(employee)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(employee)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Add a new employee to the system. Fill in all required information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empNo">Employee No.</Label>
                <Input
                  id="empNo"
                  name="empNo"
                  value={formData.empNo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender as string}
                  onValueChange={(value) => handleSelectChange(value, "gender")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sepDate">Separation Date</Label>
              <Input
                id="sepDate"
                name="sepDate"
                type="date"
                value={formData.sepDate || ""}
                onChange={handleInputChange}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty for current employees
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee} className="instagram-gradient">
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information. Employee number cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-empNo">Employee No.</Label>
                <Input
                  id="edit-empNo"
                  name="empNo"
                  value={formData.empNo}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender</Label>
                <Select
                  value={formData.gender as string}
                  onValueChange={(value) => handleSelectChange(value, "gender")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-birthDate">Birth Date</Label>
                <Input
                  id="edit-birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hireDate">Hire Date</Label>
                <Input
                  id="edit-hireDate"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-sepDate">Separation Date</Label>
              <Input
                id="edit-sepDate"
                name="sepDate"
                type="date"
                value={formData.sepDate || ""}
                onChange={handleInputChange}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty for current employees
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee} className="instagram-gradient">
              Update Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete {selectedEmployee?.firstName}{" "}
              {selectedEmployee?.lastName} from the system. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Employees;
