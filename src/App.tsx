
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth-context";
import React, { useEffect } from "react";

// Pages
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Jobs from "./pages/Jobs";
import Departments from "./pages/Departments";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";

// Create QueryClient outside the component to avoid re-creation on render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, session } = useAuth();

  useEffect(() => {
    // Log auth state for debugging
    console.log("Protected route auth state:", { 
      isAuthenticated: !!user, 
      isLoading,
      hasSession: !!session 
    });
  }, [user, isLoading, session]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || !session) {
    console.log("No authenticated user detected, redirecting to signin");
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAdmin, session } = useAuth();

  useEffect(() => {
    // Log admin auth state for debugging
    console.log("Admin route auth state:", { 
      isAuthenticated: !!user, 
      isAdmin, 
      isLoading,
      hasSession: !!session 
    });
  }, [user, isAdmin, isLoading, session]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || !session) {
    console.log("No authenticated user detected, redirecting to signin");
    return <Navigate to="/signin" replace />;
  }

  if (!isAdmin) {
    console.log("User is not an admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public route component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, session } = useAuth();

  useEffect(() => {
    // Log public route auth state for debugging
    console.log("Public route auth state:", { 
      isAuthenticated: !!user, 
      isLoading,
      hasSession: !!session 
    });
  }, [user, isLoading, session]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user && session) {
    console.log("User is already authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
    
    {/* Protected Routes */}
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
    <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
    <Route path="/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    
    {/* Admin Routes */}
    <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
    
    {/* Redirects */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    
    {/* 404 Not Found */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
