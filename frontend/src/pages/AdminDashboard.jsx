import AdminSidebar from "../components/dashboard/AdminSidebar";
import Navbar from "../components/dashboard/Navbar";
import { Outlet } from "react-router-dom";

const AdminDashboard = ({ basePath = "/admin-dashboard", employeeView = false }) => {
  return (
    <div className="min-h-screen bg-gray-100 md:flex">
      <AdminSidebar basePath={basePath} employeeView={employeeView} />
      <div className="min-w-0 flex-1 md:ml-64">
        <Navbar />
        <main className="p-3 sm:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
