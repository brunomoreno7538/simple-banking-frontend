import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface AuthRouteProps {
  children?: React.ReactNode;
}

interface ProtectedRouteProps extends AuthRouteProps {
  requiredUserType: "core" | "merchant";
}

const isAuthenticated = (): {
  authenticated: boolean;
  userType: string | null;
} => {
  const coreToken = localStorage.getItem("coreUserToken");
  const merchantToken = localStorage.getItem("merchantToken");
  const activeUserType = localStorage.getItem("activeUserType");
  return {
    authenticated: !!(coreToken || merchantToken),
    userType: activeUserType,
  };
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType,
}) => {
  const auth = isAuthenticated();
  const location = useLocation();

  if (!auth.authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (auth.userType !== requiredUserType) {
    console.warn(
      `Access denied: User type '${auth.userType}' tried to access route for '${requiredUserType}'. Redirecting.`
    );
    if (auth.userType === "core") {
      return (
        <Navigate to="/admin/dashboard" state={{ from: location }} replace />
      );
    } else if (auth.userType === "merchant") {
      return (
        <Navigate to="/merchant/dashboard" state={{ from: location }} replace />
      );
    } else {
      localStorage.removeItem("coreUserToken");
      localStorage.removeItem("merchantToken");
      localStorage.removeItem("activeUserType");
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export const PublicOnlyRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const auth = isAuthenticated();
  const location = useLocation();

  if (auth.authenticated) {
    if (auth.userType === "core") {
      return (
        <Navigate to="/admin/dashboard" state={{ from: location }} replace />
      );
    } else if (auth.userType === "merchant") {
      return (
        <Navigate to="/merchant/dashboard" state={{ from: location }} replace />
      );
    } else {
      console.warn("Unknown userType with active token. Clearing tokens.");
      localStorage.removeItem("coreUserToken");
      localStorage.removeItem("merchantToken");
      localStorage.removeItem("activeUserType");
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
