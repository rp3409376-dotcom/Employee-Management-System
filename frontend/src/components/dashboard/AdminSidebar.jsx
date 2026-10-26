import { NavLink } from "react-router-dom";
import {
  FaBuilding,
  FaCalendarAlt,
  FaCogs,
  FaMoneyBillWave,
  FaTachometerAlt,
  FaUser,
} from "react-icons/fa";

const AdminSidebar = ({ basePath = "/admin-dashboard", employeeView = false }) => {
  const linkClass = (isActive) =>
    `flex min-w-[112px] flex-1 items-center justify-center gap-2 rounded px-3 py-2 text-sm transition-colors md:justify-start md:px-4 md:py-3 ${
      isActive
        ? "bg-teal-700 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside className="z-20 w-full bg-gray-900 text-white md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col">
      <div className="flex h-16 items-center justify-center border-b border-gray-700 bg-teal-700">
        <h2 className="text-xl font-bold">Employee MS</h2>
      </div>
      <nav
        aria-label={employeeView ? "Employee navigation" : "Admin navigation"}
        className="flex flex-wrap gap-1 p-2 md:block md:space-y-2 md:px-3 md:py-5"
      >
        <NavLink
          end
          className={({ isActive }) => linkClass(isActive)}
          to={basePath}
        >
          <FaTachometerAlt aria-hidden="true" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          className={({ isActive }) => linkClass(isActive)}
          to={`${basePath}/${employeeView ? "profile" : "employees"}`}
        >
          <FaUser aria-hidden="true" />
          <span>Employee</span>
        </NavLink>
        <NavLink
          className={({ isActive }) => linkClass(isActive)}
          to={`${basePath}/departments`}
        >
          <FaBuilding aria-hidden="true" />
          <span>Department</span>
        </NavLink>
        <NavLink
          className={({ isActive }) => linkClass(isActive)}
          to={`${basePath}/leaves`}
        >
          <FaCalendarAlt aria-hidden="true" />
          <span>Leave</span>
        </NavLink>
        <NavLink
          className={({ isActive }) => linkClass(isActive)}
          to={`${basePath}/salary`}
        >
          <FaMoneyBillWave aria-hidden="true" />
          <span>Salary</span>
        </NavLink>
        <NavLink
          className={({ isActive }) => linkClass(isActive)}
          to={`${basePath}/settings`}
        >
          <FaCogs aria-hidden="true" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
