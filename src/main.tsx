import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";

import { initializeSeedData } from "./data/seed";
import AuthProvider from "./contexts/AuthContext";
import ToastProvider from "./contexts/ToastContext";
import App from "./App";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import ProjectList from "./pages/projects/ProjectList";
import ProjectDetail from "./pages/projects/ProjectDetail";
import ProjectForm from "./pages/projects/ProjectForm";
import DefectList from "./pages/defects/DefectList";
import DefectDetail from "./pages/defects/DefectDetail";
import DefectForm from "./pages/defects/DefectForm";
import TestPlanList from "./pages/testplans/TestPlanList";
import TestPlanDetail from "./pages/testplans/TestPlanDetail";
import TestPlanForm from "./pages/testplans/TestPlanForm";
import TestRunExecution from "./pages/testplans/TestRunExecution";
import TeamList from "./pages/team/TeamList";
import UserDetail from "./pages/team/UserDetail";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import { TEST_IDS } from "./shared/testIds";

initializeSeedData();

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "profile", element: <Profile /> },
      { path: "projects", element: <ProjectList /> },
      { path: "projects/new", element: <ProjectForm /> },
      { path: "projects/:projectId", element: <ProjectDetail /> },
      { path: "projects/:projectId/edit", element: <ProjectForm /> },
      { path: "defects", element: <DefectList /> },
      { path: "defects/new", element: <DefectForm /> },
      { path: "defects/:defectId", element: <DefectDetail /> },
      { path: "defects/:defectId/edit", element: <DefectForm /> },
      { path: "test-plans", element: <TestPlanList /> },
      { path: "test-plans/new", element: <TestPlanForm /> },
      { path: "test-plans/:planId", element: <TestPlanDetail /> },
      { path: "test-plans/:planId/edit", element: <TestPlanForm /> },
      { path: "test-plans/:planId/execute", element: <TestRunExecution /> },
      { path: "team", element: <TeamList /> },
      {
        path: "team/:userId",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={["qa_lead", "admin"]}>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: (
          <div
            data-testid={TEST_IDS.notFound.page}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
            <p className="text-gray-400">
              The page you are looking for does not exist.
            </p>
          </div>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
