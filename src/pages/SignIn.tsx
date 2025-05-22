
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_VERSION } from "@/lib/version";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Helper function to clean up auth state in localStorage
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetSent, setIsResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Login attempt for user:", email);
      
      // Clean up auth state before attempting to log in
      cleanupAuthState();
      
      // Try to sign out globally first to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log("Global sign out successful");
      } catch (err) {
        console.log('Global sign out failed, continuing with login');
      }
      
      const success = await login(email, password);
      if (success) {
        console.log("Login successful, navigating to dashboard");
        navigate("/dashboard");
      } else {
        console.log("Login failed");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred during login");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address.",
      });
      return;
    }

    try {
      setIsResetting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsResetSent(true);
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send password reset email.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-instagram-purple via-instagram-pink to-instagram-orange p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Hirely</h1>
          <p className="text-white opacity-90">HR Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          {!isResetOpen ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button 
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => setIsResetOpen(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full instagram-gradient" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary font-semibold hover:underline">
                    Sign Up
                  </Link>
                </div>
                
                <div className="text-center text-xs text-muted-foreground mt-4">
                  Version {APP_VERSION}
                </div>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                {isResetSent ? (
                  <Alert>
                    <AlertDescription>
                      Password reset email sent. Please check your inbox.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Email</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="name@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                {!isResetSent && (
                  <Button 
                    type="submit" 
                    className="w-full instagram-gradient" 
                    disabled={isResetting}
                  >
                    {isResetting ? "Sending..." : "Send Reset Link"}
                  </Button>
                )}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setIsResetOpen(false);
                    setIsResetSent(false);
                    setResetEmail("");
                  }}
                >
                  Back to Sign In
                </Button>
                
                <div className="text-center text-xs text-muted-foreground mt-4">
                  Version {APP_VERSION}
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
