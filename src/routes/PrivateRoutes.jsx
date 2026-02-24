import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children, role, permissions }) => {
  const { loading, isAuthenticated, hasPermission, hasRole } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role (legacy – backward compat)
  if (role && !hasRole(role)) {
    return <Navigate to="/403" replace />;
  }

  // Check permission mới dạng "module.action"
  if (permissions && !hasPermission(permissions)) {
    if (import.meta.env.DEV) {
      console.error(
        `[Guard] Access denied for path ${window.location.pathname}. Missing permission: ${permissions}`,
      );
    }
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default PrivateRoute;
