import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaPlus, FaSearch } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./DepartmentActions.css";

const EmployeeDepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadDepartments = async () => {
      try {
        const response = await fetch("/api/department", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Unable to load departments.");
        }
        setDepartments(Array.isArray(result.department) ? result.department : []);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load departments.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDepartments();
    return () => controller.abort();
  }, []);

  const handleDelete = async (department) => {
    if (!window.confirm(`Delete ${department.dep_name}?`)) {
      return;
    }

    setError("");
    setDeletingId(department._id);
    try {
      const response = await fetch(`/api/department/${department._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to delete department.");
      }
      setDepartments((current) => current.filter((item) => item._id !== department._id));
    } catch (requestError) {
      setError(requestError.message || "Unable to delete department.");
    } finally {
      setDeletingId("");
    }
  };

  const filteredDepartments = departments.filter((department) =>
    department.dep_name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <section className="space-y-5 p-3 sm:p-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <label className="relative block w-full max-w-56">
          <span className="sr-only">Search by department name</span>
          <FaSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by dep name"
            type="search"
            value={search}
          />
        </label>
        <div className="text-center">
          <h1 className="mb-0 text-3xl font-bold text-gray-900">Manage Departments</h1>
        </div>
        <Link
          aria-label="Add new department"
          className="inline-flex items-center justify-self-end gap-2 rounded bg-teal-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 sm:px-4"
          to="/employee-dashboard/add-department"
        >
          <FaPlus aria-hidden="true" />
          <span className="hidden sm:inline">Add New Department</span>
        </Link>
      </header>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-center text-sm">
          <colgroup>
            <col className="w-20" />
            <col />
            <col className="w-80" />
          </colgroup>
          <thead className="text-center text-sm uppercase tracking-wide text-gray-900">
            <tr>
              <th className="px-5 py-4 font-extrabold">S.No</th>
              <th className="px-5 py-4 font-extrabold">Department Name</th>
              <th className="px-5 py-4 font-extrabold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDepartments.map((department, index) => (
              <tr key={department._id}>
                <td className="px-5 py-4 text-gray-600">{index + 1}</td>
                <td className="px-5 py-4 font-medium text-gray-900">{department.dep_name}</td>
                <td className="px-5 py-4">
                  <div className="department-actions">
                    <button
                      aria-label={`View ${department.dep_name}`}
                      className="department-action-button department-action-view"
                      onClick={() => setSelectedDepartment(department)}
                      title="View department"
                      type="button"
                    >
                      <FaEye aria-hidden="true" />
                      <span>View</span>
                    </button>
                    <Link
                      aria-label={`Edit ${department.dep_name}`}
                      className="department-action-button department-action-edit"
                      title="Edit department"
                      to={`/employee-dashboard/department/${department._id}`}
                    >
                      <FiEdit2 aria-hidden="true" />
                      <span>Edit</span>
                    </Link>
                    <button
                      aria-label={`Delete ${department.dep_name}`}
                      className="department-action-button department-action-delete"
                      disabled={deletingId === department._id}
                      onClick={() => handleDelete(department)}
                      title="Delete department"
                      type="button"
                    >
                      <FiTrash2 aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredDepartments.length === 0 && (
              <tr>
                <td className="px-5 py-4 text-gray-400">—</td>
                <td className="px-5 py-4 text-gray-500">
                  {search.trim() ? "No departments match your search." : "No departments found."}
                </td>
                <td className="px-5 py-3">
                  <div className="department-actions">
                    <button
                      aria-label="Edit unavailable: no departments"
                      className="department-action-button department-action-edit"
                      disabled
                      title="Add a department before editing"
                      type="button"
                    >
                      <FiEdit2 aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      aria-label="Delete unavailable: no departments"
                      className="department-action-button department-action-delete"
                      disabled
                      title="Add a department before deleting"
                      type="button"
                    >
                      <FiTrash2 aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {loading && <tr><td className="px-5 py-8 text-center text-gray-500" colSpan={3}>Loading departments...</td></tr>}
          </tbody>
        </table>
      </div>
      {selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section
            aria-labelledby="department-details-title"
            aria-modal="true"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="mb-0 text-xl font-semibold text-gray-900" id="department-details-title">Department Details</h2>
              <button
                aria-label="Close department details"
                className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setSelectedDepartment(null)}
                type="button"
              >
                ✕
              </button>
            </div>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Department Name</dt>
                <dd className="mb-0 mt-1 font-medium text-gray-900">{selectedDepartment.dep_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Description</dt>
                <dd className="mb-0 mt-1 text-gray-700">{selectedDepartment.description || "No description available."}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </section>
  );
};

export default EmployeeDepartmentList;
