import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/client";
import { getDemoUser } from "../utils/demoAuth";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (getDemoUser()?.mode === "demo") {
        setIsAuth(true);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      if (!token || token === "undefined" || token === "null") {
        setIsAuth(false);
        setLoading(false);
        return;
      }

      try {
        await api.get("/me");
        setIsAuth(true);
      } catch {
        localStorage.removeItem("token");
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
