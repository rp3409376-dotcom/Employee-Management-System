import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const RoleBaseRoutes = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!requiredRole.includes(user.role)) {
    return <Navigate to="/employee-dashboard" replace />;
  }

  return children;
};

export default RoleBaseRoutes;
