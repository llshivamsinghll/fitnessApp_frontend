import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Floating "Back to Dashboard" button shown on every page except the Dashboard itself.
 * Fixed position so it doesn't interfere with page layouts.
 */
const BackToDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on dashboard route and landing page
  if (location.pathname === "/dashboard" || location.pathname === "/") return null;

  return (
    <div className="fixed left-4 bottom-4 z-50">
      <Button
        variant="outline"
        onClick={() => navigate("/dashboard")}
        className="shadow-card bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur hover:bg-accent hover:text-accent-foreground"
        title="Go to Dashboard"
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="ml-2">Dashboard</span>
      </Button>
    </div>
  );
};

export default BackToDashboard;
