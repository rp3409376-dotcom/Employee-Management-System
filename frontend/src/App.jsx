import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Login from "./pages/Login";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";
import AdminSummary from "./components/dashboard/AdminSummary";
import DepartmentList from "./components/department/DepartmentList";
import AddDepartment from "./components/department/AddDepartment";
import EditDepartment from "./components/department/EditDepartment";
import EmployeeList from "./components/employee/EmployeeList";
import LeaveDashboard from "./components/dashboard/LeaveDashboard";
import SalaryDashboard from "./components/dashboard/SalaryDashboard";
import SettingsDashboard from "./components/dashboard/SettingsDashboard";
import EmployeeSummary from "./components/dashboard/EmployeeSummary";
import EmployeeDepartmentList from "./components/department/EmployeeDepartmentList";
import EmployeeDirectory from "./components/employee/EmployeeDirectory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin-dashboard" />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["admin"]}>
                <AdminDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<AdminSummary />}></Route>

          <Route path="employees" element={<EmployeeList />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="add-department" element={<AddDepartment />} />
          <Route path="department/:id" element={<EditDepartment />} />
          <Route path="leaves" element={<LeaveDashboard />} />
          <Route path="salary" element={<SalaryDashboard />} />
          <Route path="settings" element={<SettingsDashboard />} />
        </Route>
        <Route
          path="/employee-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["employee"]}>
                <EmployeeDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<EmployeeSummary />} />
          <Route path="profile" element={<EmployeeDirectory />} />
          <Route path="departments" element={<EmployeeDepartmentList />} />
          <Route path="add-department" element={<AddDepartment />} />
          <Route path="department/:id" element={<EditDepartment />} />
          <Route path="leaves" element={<LeaveDashboard />} />
          <Route path="salary" element={<SalaryDashboard />} />
          <Route path="settings" element={<EmployeeDirectory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
