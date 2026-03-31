import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface CreatorModeRouteProps {
  children: React.ReactNode;
}

const CreatorModeRoute = ({ children }: CreatorModeRouteProps) => {
  const { canAccessCreatorMode } = useAuth();

  if (!canAccessCreatorMode()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default CreatorModeRoute;
