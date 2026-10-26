import { useEffect, useMemo, useState } from "react";
import { FaEye, FaPlus, FaSearch, FaUserPlus } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./EmployeeDirectory.css";

const EmployeeDirectory = () => {
  const { user, login } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    dateOfBirth: "",
  });
  const [saving, setSaving] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const currentUserId = String(user?._id ?? user?.id ?? "");

  const getEmployeeId = (employee) => String(employee?._id ?? employee?.id ?? "");
  const formatDateInput = (date) => {
    if (!date) {
      return "";
    }
    const dateString = String(date);
    return dateString.length >= 10 ? dateString.slice(0, 10) : "";
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadEmployees = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` };
        const [employeesResponse, departmentsResponse] = await Promise.all([
          fetch("/api/users/employees", { headers, signal: controller.signal }),
          fetch("/api/department", { headers, signal: controller.signal }),
        ]);
        const [employeesResult, departmentsResult] = await Promise.all([
          employeesResponse.json(),
          departmentsResponse.json(),
        ]);
        if (!employeesResponse.ok || !departmentsResponse.ok) {
          throw new Error(employeesResult.message || departmentsResult.error || "Unable to load employee information.");
        }
        setEmployees(Array.isArray(employeesResult.employees) ? employeesResult.employees : []);
        setDepartments(Array.isArray(departmentsResult.department) ? departmentsResult.department : []);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load employees.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadEmployees();
    return () => controller.abort();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((employee) =>
      `${employee.name} ${employee.email} ${employee.department || ""}`.toLowerCase().includes(query),
    );
  }, [employees, search]);

  const handleAddEmployee = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: JSON.stringify({ ...newEmployee, role: "employee" }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to add employee.");
      }
      setEmployees((current) => [...current, result.user].sort((a, b) => a.name.localeCompare(b.name)));
      setNewEmployee({ name: "", email: "", password: "", department: "", dateOfBirth: "" });
      setShowAddForm(false);
      setNotice("Employee account created successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to add employee.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditEmployee = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingEdit(true);
    try {
      const response = await fetch(`/api/users/${editingEmployee._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: JSON.stringify({
          name: editingEmployee.name,
          email: editingEmployee.email,
          department: editingEmployee.department || "",
          dateOfBirth: editingEmployee.dateOfBirth || "",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to update employee.");
      }
      setEmployees((current) => current.map((employee) =>
        getEmployeeId(employee) === getEmployeeId(result.user) ? result.user : employee,
      ));
      if (getEmployeeId(result.user) === currentUserId) {
        login(
          { ...user, ...result.user, id: getEmployeeId(result.user) },
          localStorage.getItem("token") ?? "",
        );
      }
      setEditingEmployee(null);
      setNotice("Employee details updated.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update employee.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <section className="space-y-5 p-3 sm:p-5">
      <header className="employee-directory-heading">
        <label className="employee-directory-search">
          <span className="sr-only">Search employees</span>
          <FaSearch aria-hidden="true" className="employee-directory-search-icon" />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employees"
            type="search"
            value={search}
          />
        </label>
        <h1>Manage Employees</h1>
        <button
          aria-label={showAddForm ? "Close add employee form" : "Add new employee"}
          className="employee-directory-add-button"
          onClick={() => {
            setShowAddForm((visible) => !visible);
            setError("");
            setNotice("");
          }}
          type="button"
        >
          <FaPlus aria-hidden="true" />
          <span>Add New Employee</span>
        </button>
      </header>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      {notice && <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{notice}</p>}
      {showAddForm && (
        <form className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-4" onSubmit={handleAddEmployee}>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Full name
            <input
              autoComplete="name"
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              maxLength={100}
              onChange={(event) => setNewEmployee((current) => ({ ...current, name: event.target.value }))}
              required
              value={newEmployee.name}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Email
            <input
              autoComplete="email"
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              onChange={(event) => setNewEmployee((current) => ({ ...current, email: event.target.value }))}
              required
              type="email"
              value={newEmployee.email}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Department
            <select
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              onChange={(event) => setNewEmployee((current) => ({ ...current, department: event.target.value }))}
              value={newEmployee.department}
            >
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department._id} value={department.dep_name}>{department.dep_name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Date of birth
            <input
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              onChange={(event) => setNewEmployee((current) => ({ ...current, dateOfBirth: event.target.value }))}
              type="date"
              value={newEmployee.dateOfBirth}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Temporary password
            <input
              autoComplete="new-password"
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              minLength={8}
              onChange={(event) => setNewEmployee((current) => ({ ...current, password: event.target.value }))}
              required
              type="password"
              value={newEmployee.password}
            />
          </label>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded bg-teal-700 px-4 font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            <FaUserPlus aria-hidden="true" />
            {saving ? "Creating..." : "Create Employee"}
          </button>
        </form>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-center text-sm">
          <colgroup>
            <col className="w-20" />
            <col />
            <col />
            <col />
            <col className="w-36" />
            <col className="w-[520px]" />
          </colgroup>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Image</th>
              <th>Department</th>
              <th>DOB</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee, index) => (
              <tr key={employee._id}>
                <td>{index + 1}</td>
                <td className="font-medium text-gray-900">{employee.name}</td>
                <td>
                  <span className="employee-directory-avatar">
                    {employee.profileImage ? (
                      <>
                        <span className="employee-directory-avatar-initials">
                          {employee.name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                        <img
                          alt={`${employee.name} profile`}
                          onError={(event) => { event.currentTarget.style.display = "none"; }}
                          src={employee.profileImage}
                        />
                      </>
                    ) : (
                      employee.name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
                    )}
                  </span>
                </td>
                <td>{employee.department || "—"}</td>
                <td>{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : "—"}</td>
                <td>
                  <div className="employee-directory-actions">
                    <button
                      aria-label={`View ${employee.name}`}
                      className="employee-directory-view"
                      onClick={() => setSelectedEmployee(employee)}
                      type="button"
                    >
                      <FaEye aria-hidden="true" />
                      <span>View</span>
                    </button>
                    <button
                      aria-label={getEmployeeId(employee) === currentUserId ? `Edit ${employee.name}` : `Edit unavailable for ${employee.name}`}
                      className="employee-directory-action employee-directory-edit"
                      disabled={getEmployeeId(employee) !== currentUserId}
                      onClick={() => setEditingEmployee({
                        ...employee,
                        dateOfBirth: formatDateInput(employee.dateOfBirth),
                      })}
                      title={getEmployeeId(employee) === currentUserId ? "Edit your employee details" : "You can only edit your own employee details"}
                      type="button"
                    >
                      <FiEdit2 aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <Link className="employee-directory-action employee-directory-salary" to="/employee-dashboard/salary">
                      Salary
                    </Link>
                    <Link className="employee-directory-action employee-directory-leave" to="/employee-dashboard/leaves">
                      Leave
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredEmployees.length === 0 && (
              <tr>
                <td className="text-gray-400">—</td>
                <td className="text-gray-500" colSpan={4}>
                  {search.trim() ? "No employees match your search." : "No employees found."}
                </td>
                <td>—</td>
              </tr>
            )}
            {loading && <tr><td className="py-8 text-gray-500" colSpan={6}>Loading employees...</td></tr>}
          </tbody>
        </table>
      </div>
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section
            aria-labelledby="employee-details-title"
            aria-modal="true"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="mb-0 text-xl font-semibold text-gray-900" id="employee-details-title">Employee Details</h2>
              <button
                aria-label="Close employee details"
                className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setSelectedEmployee(null)}
                type="button"
              >
                ✕
              </button>
            </div>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Employee Name</dt>
                <dd className="mb-0 mt-1 font-medium text-gray-900">{selectedEmployee.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="mb-0 mt-1 text-gray-700">{selectedEmployee.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Department</dt>
                <dd className="mb-0 mt-1 text-gray-700">{selectedEmployee.department || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Date of birth</dt>
                <dd className="mb-0 mt-1 text-gray-700">{selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString() : "—"}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            aria-labelledby="employee-profile-edit-title"
            aria-modal="true"
            className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-xl"
            onSubmit={handleEditEmployee}
            role="dialog"
          >
            <h2 className="text-xl font-semibold text-gray-900" id="employee-profile-edit-title">Edit Employee Details</h2>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            {[
              { name: "name", label: "Name", type: "text" },
              { name: "email", label: "Email", type: "email" },
              { name: "department", label: "Department", type: "text" },
              { name: "dateOfBirth", label: "Date of birth", type: "date" },
            ].map((field) => (
              <label className="grid gap-1 text-sm font-medium text-gray-700" key={field.name}>
                {field.label}
                {field.name === "department" ? (
                  <select
                    className="rounded border border-gray-300 px-3 py-2 font-normal"
                    onChange={(event) => setEditingEmployee((current) => ({ ...current, department: event.target.value }))}
                    value={editingEmployee.department || ""}
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department._id} value={department.dep_name}>{department.dep_name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="rounded border border-gray-300 px-3 py-2 font-normal"
                    onChange={(event) => setEditingEmployee((current) => ({ ...current, [field.name]: event.target.value }))}
                    required={field.name === "name" || field.name === "email"}
                    type={field.type}
                    value={editingEmployee[field.name] || ""}
                  />
                )}
              </label>
            ))}
            <div className="flex justify-end gap-3">
              <button className="rounded border border-gray-300 px-4 py-2" onClick={() => setEditingEmployee(null)} type="button">Cancel</button>
              <button className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-60" disabled={savingEdit} type="submit">
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default EmployeeDirectory;
