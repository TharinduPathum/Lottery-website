import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-20">Loading Auth...</div>;
  }

  if (user && user.roles.includes("admin")) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

export default AdminRoute;