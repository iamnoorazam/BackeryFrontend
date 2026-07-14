import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/authStore";

const ProtectedRoute = ({ children, roles }) => {
  const { user, isLoggedIn } = useAuth();
  const fallbackUser = !user ? (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch { return null; }
  })() : user;
  const loggedIn = isLoggedIn || !!localStorage.getItem("token");

  if (!loggedIn) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(fallbackUser?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;