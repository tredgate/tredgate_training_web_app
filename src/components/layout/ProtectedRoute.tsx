import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { Role } from "../../data/entities";
import { useAuth } from "../../hooks/useAuth";
import { TEST_IDS } from "../../shared/testIds";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: readonly Role[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div
        data-testid={TEST_IDS.protectedRoute.denied}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-xl font-bold text-white mb-2">
          Permission Denied
        </h2>
        <p className="text-gray-400">
          You do not have access to this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
