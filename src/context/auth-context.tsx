
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { users } from '../services/mockData';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('hirely_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple mock authentication - in a real app this would call an API
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const foundUser = users.find(u => u.email === email);
      if (foundUser && password === 'password') {
        setUser(foundUser);
        localStorage.setItem('hirely_user', JSON.stringify(foundUser));
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${foundUser.name || foundUser.email}!`,
        });
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password.",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const userExists = users.some(u => u.email === email);
      if (userExists) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: "Email already in use.",
        });
        return false;
      }
      
      // In a real app, we would save this to a database
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role: 'user',
      };
      
      // For demo purposes, we'll just set this user as logged in
      setUser(newUser);
      localStorage.setItem('hirely_user', JSON.stringify(newUser));
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign up error",
        description: "An unexpected error occurred.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hirely_user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
