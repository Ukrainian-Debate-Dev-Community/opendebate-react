import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import { LoginPage } from "../features/auth/components/LoginPage";
import { RegisterPage } from "../features/auth/components/RegisterPage";
import { UnderConstruction } from "../components/UnderConstruction";

// Global Admin
import { AdminPanel } from "../features/admin/components/AdminPanel";

// Organiser
import { ManageDirectory } from "../features/manage/components/ManageDirectory";
import { ManageHub } from "../features/manage/components/ManageHub";
import { ManageEventDashboard } from "../features/manage/components/ManageEventDashboard";

// Public
import { PublicDirectory } from "../features/public/components/PublicDirectory";
import { PublicHub } from "../features/public/components/PublicHub";
import { PublicEventDashboard } from "../features/public/components/PublicEventDashboard";

// Cabinet
import { UserCabinet } from "../features/cabinet/components/UserCabinet";

import { useAuthStore } from "../store/authStore";

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

        {/* ADMIN */}
        <Route
          path="/admin"
          element={token ? <AdminPanel /> : <Navigate to="/login" replace />}
        />

        {/* ORG */}
        <Route
          path="/manage/organisations"
          element={
            token ? <ManageDirectory /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/manage/organisations/:id"
          element={token ? <ManageHub /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/manage/events/:eventId"
          element={
            token ? <ManageEventDashboard /> : <Navigate to="/login" replace />
          }
        />

        {/* PUBLIC PORTAL */}
        <Route
          path="/organisations"
          element={
            token ? <PublicDirectory /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/organisations/:id"
          element={token ? <PublicHub /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/events/:eventId"
          element={
            token ? <PublicEventDashboard /> : <Navigate to="/login" replace />
          }
        />

        {/* CABINET */}
        <Route
          path="/cabinet"
          element={token ? <UserCabinet /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};
