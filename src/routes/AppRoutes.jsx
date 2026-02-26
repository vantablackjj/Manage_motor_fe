// src/routes/AppRoutes.jsx - Updated to refresh routes configuration
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { publicRoutes, privateRoutes } from "./routeConfig";
import PrivateRoute from "./PrivateRoutes";
import PageLoading from "../components/common/Loading/Loading";
import { Fragment } from "react";

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Redirect /sales to /sales/orders as it's a parent menu key */}
        <Route
          path="/sales"
          element={<Navigate to="/sales/orders" replace />}
        />
        <Route
          path="/purchase"
          element={<Navigate to="/purchase/vehicles" replace />}
        />

        {/* Public routes */}
        {publicRoutes.map((route, index) => {
          const Page = route.component;
          const Layout = route.layout;

          return (
            <Route
              key={index}
              path={route.path}
              element={
                Layout ? (
                  <Layout>
                    <Page />
                  </Layout>
                ) : (
                  <Page />
                )
              }
            />
          );
        })}

        {/* Private routes */}
        {privateRoutes.map((route, index) => {
          const Page = route.component;
          const Layout = route.layout || Fragment;

          return (
            <Route
              key={index}
              path={route.path}
              element={
                <PrivateRoute role={route.role} permissions={route.permissions}>
                  <Layout>
                    <Page />
                  </Layout>
                </PrivateRoute>
              }
            />
          );
        })}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
