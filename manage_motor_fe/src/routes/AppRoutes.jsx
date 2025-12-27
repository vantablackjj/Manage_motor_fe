// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { publicRoutes, privateRoutes } from "./routeConfig";
import PrivateRoute from "./PrivateRoutes";
import PageLoading from "../components/common/Loading/Loading";
import { Fragment } from "react";

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
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
                <PrivateRoute role={route.role}>
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
