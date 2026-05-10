import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/Group_20.png";
import { LogOut } from "lucide-react";
import { logout } from "../api/auth";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";

const NavBar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await logout();
      enqueueSnackbar("Logged out successfully", { variant: "success" });
      navigate("/login");
    } catch (err: any) {
      enqueueSnackbar(
        err?.response?.data?.message || "Logout failed",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="h-14 text-sm w-full flex items-center justify-between px-10 bg-[#F4F4F5] shrink-0">
      <div className="flex items-center">
        <NavLink to="/">
          <img src={logo} alt="logo" />
        </NavLink>
      </div>

      <div className="flex items-center space-x-3">
        <button onClick={handleLogout} disabled={loading} className="p-2 rounded-full bg-white disabled:opacity-50">
          <LogOut size={18} className="cursor-pointer" />
        </button>
      </div>
    </nav>
  );
};

export default NavBar;