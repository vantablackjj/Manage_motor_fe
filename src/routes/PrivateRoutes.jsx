import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

const PrivateRoute = ({ children, role }) => {
  const { loading, isAuthenticated, hasPermission } = useAuth();
  useEffect(() => {
    console.log(isAuthenticated);
  }, []);

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

  if (role && !hasPermission(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default PrivateRoute;
