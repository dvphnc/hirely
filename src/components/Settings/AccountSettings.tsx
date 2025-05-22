
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown } from "lucide-react";

interface AccountSettingsProps {
  user: any;
  isExporting: boolean;
  isClearingData: boolean;
  handleExportData: () => void;
  handleClearData: () => void;
  setIsPasswordDialogOpen: (value: boolean) => void;
}

export const AccountSettings = ({
  user,
  isExporting,
  isClearingData,
  handleExportData,
  handleClearData,
  setIsPasswordDialogOpen,
}: AccountSettingsProps) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account preferences and security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label className="font-medium">Password Reset</Label>
          <p className="text-sm text-muted-foreground">
            Change your account password
          </p>
          <div>
            <Button 
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(true)}
              disabled={!user}
            >
              Change Password
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Label className="font-medium">Data Management</Label>
          <p className="text-sm text-muted-foreground">
            Manage your data and exports
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Export as PDF
            </Button>
            <Button 
              variant="destructive"
              onClick={handleClearData}
              disabled={isClearingData}
            >
              {isClearingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clear All Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
