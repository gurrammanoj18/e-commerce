import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PageLoader from "../shared/PageLoader";

interface ProtectedRouteProps {
  children: React.ReactElement;
  adminOnly?: boolean;
  customerOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  customerOnly = false,
}) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={adminOnly ? "/admin/login" : "/login"}
        replace
        state={{ from: location, adminOnly }}
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location, adminOnly: true }} />;
  }

  if (customerOnly && isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
