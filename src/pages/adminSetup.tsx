
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const makeAdmin = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      // Get the current session for the authorization header
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        toast.error("Not authenticated. Please log in first.");
        setResult({
          success: false, 
          message: "You need to be logged in to perform this action."
        });
        return;
      }
      
      // Call our edge function
      const { data, error } = await supabase.functions.invoke('make-admin', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) {
        console.error("Error making user admin:", error);
        setResult({
          success: false,
          message: `Failed to set user as admin: ${error.message || "Unknown error"}`
        });
        toast.error("Failed to set user as admin");
        return;
      }
      
      // Success!
      setResult({
        success: true,
        message: `User jdsoffcl@gmail.com has been set as admin successfully.`
      });
      toast.success("User has been set as admin!");
      
    } catch (error) {
      console.error("Unexpected error:", error);
      setResult({
        success: false,
        message: `An unexpected error occurred: ${error.message || "Unknown error"}`
      });
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Setup</CardTitle>
            <CardDescription>
              Make jdsoffcl@gmail.com an admin user in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Click the button below to assign admin rights to jdsoffcl@gmail.com. This will grant full access to all system functions.
            </p>
            
            {result && (
              <Alert className={`mb-4 ${result.success ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}>
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={makeAdmin} 
              disabled={loading}
              className="instagram-gradient"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Making Admin...
                </>
              ) : (
                "Make Admin"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSetup;
