import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getMe } from "../api/auth";

type Props = { children: ReactNode };

const ProtectedRoute = ({ children }: Props) => {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    getMe().then(() => setOk(true)).catch(() => setOk(false));
  }, []);

  if (ok === null) return <div>Loading...</div>;
  if (!ok) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;