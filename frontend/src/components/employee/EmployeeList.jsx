import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaSearch, FaUserPlus, FaUsers } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const emptyForm = { name: "", email: "", password: "" };

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Unable to load employees.");
        }
        setEmployees(Array.isArray(result.users) ? result.users.filter((user) => user.role === "employee") : []);
        setError("");
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load employees.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((employee) =>
      `${employee.name} ${employee.email}`.toLowerCase().includes(query),
    );
  }, [employees, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
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
        body: JSON.stringify({ ...form, role: "employee" }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to add employee.");
      }
      setEmployees((current) => [result.user, ...current]);
      setForm(emptyForm);
      setNotice("Employee account created successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to add employee.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setError("");
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
          dateOfBirth: editingEmployee.dateOfBirth
            ? new Date(editingEmployee.dateOfBirth).toISOString().slice(0, 10)
            : "",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to update employee.");
      }
      setEmployees((current) => current.map((employee) =>
        employee._id === result.user._id ? result.user : employee,
      ));
      setEditingEmployee(null);
      setNotice("Employee updated successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update employee.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Delete employee ${employee.name}?`)) {
      return;
    }
    setError("");
    setDeletingId(employee._id);
    try {
      const response = await fetch(`/api/users/${employee._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to delete employee.");
      }
      setEmployees((current) => current.filter((item) => item._id !== employee._id));
      setNotice("Employee deleted successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete employee.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="space-y-6 p-3 sm:p-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-800">People</p>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Employees</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <FaUsers className="text-teal-700" aria-hidden="true" />
            <span className="text-sm text-gray-600">Employees</span>
            <strong className="text-lg text-gray-900">{loading ? "—" : employees.length}</strong>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded bg-teal-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            onClick={() => document.getElementById("add-employee-form")?.scrollIntoView({ behavior: "smooth", block: "center" })}
            type="button"
          >
            <FaUserPlus aria-hidden="true" />
            <span>Add New Employee</span>
          </button>
        </div>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm" id="add-employee-form">
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-lg bg-teal-50 p-3 text-teal-800"><FaUserPlus aria-hidden="true" /></span>
          <div>
            <h2 className="mb-1 text-lg font-semibold text-gray-900">Add an employee</h2>
          </div>
        </div>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        {notice && <p className="mb-4 rounded bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{notice}</p>}
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Full name
            <input className="rounded border border-gray-300 px-3 py-2 font-normal" autoComplete="name" maxLength={100} name="name" onChange={handleChange} required value={form.name} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Email
            <input className="rounded border border-gray-300 px-3 py-2 font-normal" autoComplete="email" name="email" onChange={handleChange} required type="email" value={form.email} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Temporary password
            <input className="rounded border border-gray-300 px-3 py-2 font-normal" autoComplete="new-password" minLength={8} name="password" onChange={handleChange} required type="password" value={form.password} />
          </label>
          <button className="self-end rounded bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:opacity-60" disabled={saving} type="submit">
            {saving ? "Creating..." : "Create employee"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-gray-900">Employee directory</h2>
            <p className="mb-0 text-sm text-gray-500">Employee accounts registered in the system.</p>
          </div>
          <label className="relative">
            <span className="sr-only">Search employees</span>
            <FaSearch aria-hidden="true" className="absolute left-3 top-3 text-gray-400" />
            <input className="rounded border border-gray-300 py-2 pl-9 pr-3 text-sm" onChange={(event) => setSearch(event.target.value)} placeholder="Search employees" type="search" value={search} />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Role</th><th className="px-5 py-3 text-center">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee._id}>
                  <td className="px-5 py-4 font-medium text-gray-900">{employee.name}</td>
                  <td className="px-5 py-4 text-gray-600">{employee.email}</td>
                  <td className="px-5 py-4 text-gray-600">{employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-4 capitalize text-gray-600">{employee.role}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button className="rounded bg-sky-50 px-3 py-2 text-sky-800 hover:bg-sky-100" onClick={() => setSelectedEmployee(employee)} type="button">
                        <FaEye aria-hidden="true" /> View
                      </button>
                      <button className="rounded bg-teal-50 px-3 py-2 text-teal-800 hover:bg-teal-100" onClick={() => setEditingEmployee({ ...employee, dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().slice(0, 10) : "" })} type="button">
                        <FiEdit2 aria-hidden="true" /> Edit
                      </button>
                      <Link className="rounded bg-amber-50 px-3 py-2 text-amber-800 hover:bg-amber-100" to="/admin-dashboard/salary">Salary</Link>
                      <Link className="rounded bg-indigo-50 px-3 py-2 text-indigo-800 hover:bg-indigo-100" to="/admin-dashboard/leaves">Leave</Link>
                      <button className="rounded bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 disabled:opacity-50" disabled={deletingId === employee._id} onClick={() => handleDelete(employee)} type="button">
                        <FiTrash2 aria-hidden="true" /> {deletingId === employee._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredEmployees.length === 0 && (
                <tr><td className="px-5 py-10 text-center text-gray-500" colSpan={5}>{search ? "No employees match your search." : "No employee accounts yet. Add the first employee above."}</td></tr>
              )}
              {loading && <tr><td className="px-5 py-10 text-center text-gray-500" colSpan={5}>Loading employees...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section aria-labelledby="admin-employee-details" aria-modal="true" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" role="dialog">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="mb-0 text-xl font-semibold" id="admin-employee-details">Employee Details</h2>
              <button aria-label="Close" onClick={() => setSelectedEmployee(null)} type="button">✕</button>
            </div>
            <dl className="space-y-3">
              <div><dt className="text-sm text-gray-500">Name</dt><dd className="mb-0 font-medium">{selectedEmployee.name}</dd></div>
              <div><dt className="text-sm text-gray-500">Email</dt><dd className="mb-0">{selectedEmployee.email}</dd></div>
              <div><dt className="text-sm text-gray-500">Department</dt><dd className="mb-0">{selectedEmployee.department || "—"}</dd></div>
              <div><dt className="text-sm text-gray-500">Date of birth</dt><dd className="mb-0">{selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString() : "—"}</dd></div>
            </dl>
          </section>
        </div>
      )}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form aria-labelledby="edit-employee-title" className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-xl" onSubmit={handleEditSubmit}>
            <h2 className="text-xl font-semibold text-gray-900" id="edit-employee-title">Edit Employee</h2>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            {["name", "email", "department", "dateOfBirth"].map((field) => (
              <label className="grid gap-1 text-sm font-medium capitalize text-gray-700" key={field}>
                {field === "dateOfBirth" ? "Date of birth" : field}
                <input
                  className="rounded border border-gray-300 px-3 py-2 font-normal"
                  onChange={(event) => setEditingEmployee((current) => ({ ...current, [field]: event.target.value }))}
                  required={field === "name" || field === "email"}
                  type={field === "dateOfBirth" ? "date" : field === "email" ? "email" : "text"}
                  value={editingEmployee[field] || ""}
                />
              </label>
            ))}
            <div className="flex justify-end gap-3">
              <button className="rounded border border-gray-300 px-4 py-2" onClick={() => setEditingEmployee(null)} type="button">Cancel</button>
              <button className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-60" disabled={savingEdit} type="submit">{savingEdit ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default EmployeeList;
