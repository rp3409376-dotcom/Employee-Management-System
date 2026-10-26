import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

const PrivateRoutes = ({ children }) => {
  const { user } = useAuth();

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoutes;
