import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LoginPage } from "../features/auth/components/LoginPage";
import { RegisterPage } from "../features/auth/components/RegisterPage";
import { UnderConstruction } from "../components/UnderConstruction";
import { UserCabinet } from "../features/stats/components/UserCabinet";
import { AdminPanel } from "../features/admin/components/AdminPanel";
import { OrganisationDirectory } from "../features/events/components/OrganisationDirectory";
import { useAuthStore } from "../store/authStore";
import { OrganisationHub } from "../features/events/components/OrganisationHub";
import { EventDashboard } from "../features/events/components/EventDashboard";

export const AppRoutes: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          path="/"
          element={
            token ? <UnderConstruction /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/cabinet"
          element={token ? <UserCabinet /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin"
          element={token ? <AdminPanel /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/organisations"
          element={
            token ? <OrganisationDirectory /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/organisations/:id"
          element={
            token ? <OrganisationHub /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/events/:eventId"
          element={
            token ? <EventDashboard /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
