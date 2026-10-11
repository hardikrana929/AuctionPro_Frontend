import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role = "admin" }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Checking your session...
      </div>
    );
  }

  if (user?.role === role) return <Outlet />;
  return <Navigate to={user?.role === "admin" ? "/admin" : user?.role === "user" ? "/dashboard" : role === "user" ? "/login" : "/admin/login"} replace />;
}
