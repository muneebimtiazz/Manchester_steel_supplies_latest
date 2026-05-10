import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
]);

export default function App() {
  return (
    <SnackbarProvider
      maxSnack={1}
      autoHideDuration={1000}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <RouterProvider router={router} />
    </SnackbarProvider>
  );
}