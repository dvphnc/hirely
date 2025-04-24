
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function ManageUsersButton() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <Button
      onClick={() => navigate("/user-management")}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Users className="h-4 w-4" />
      Manage Users
    </Button>
  );
}
