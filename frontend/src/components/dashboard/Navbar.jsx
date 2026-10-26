import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex min-w-0 items-center gap-3">
        <p className="mb-0 truncate font-medium text-gray-700">
          Welcome, {user?.name || "User"}
        </p>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            user?.role === "admin"
              ? "bg-teal-50 text-teal-800"
              : "bg-sky-50 text-sky-800"
          }`}
          title="Your signed-in account role"
        >
          {user?.role === "admin" ? "Admin" : "Employee"}
        </span>
      </div>
      <button
        className="shrink-0 rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        onClick={handleLogout}
        type="button"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;
