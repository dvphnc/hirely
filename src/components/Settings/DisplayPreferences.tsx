
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DisplayPreferencesProps {
  darkMode: boolean;
  showInactive: boolean;
  handleDarkModeChange: (checked: boolean) => void;
  handleShowInactiveChange: (checked: boolean) => void;
}

export const DisplayPreferences = ({
  darkMode,
  showInactive,
  handleDarkModeChange,
  handleShowInactiveChange,
}: DisplayPreferencesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Preferences</CardTitle>
        <CardDescription>
          Customize your visual experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dark-mode" className="font-medium">
              Dark Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Use dark theme for reduced eye strain
            </p>
          </div>
          <Switch
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={handleDarkModeChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-inactive" className="font-medium">
              Show Inactive Employees
            </Label>
            <p className="text-sm text-muted-foreground">
              Display former employees in employee list
            </p>
          </div>
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={handleShowInactiveChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DisplayPreferences;
