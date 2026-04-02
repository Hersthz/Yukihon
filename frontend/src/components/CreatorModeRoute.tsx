import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface CreatorModeRouteProps {
  children: React.ReactNode;
}

const CreatorModeRoute = ({ children }: CreatorModeRouteProps) => {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default CreatorModeRoute;
