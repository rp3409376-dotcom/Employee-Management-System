import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaSearch } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./DepartmentActions.css";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
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

  const columns = [
    {
      name: "S.No",
      width: "100px",
      center: true,
      cell: (_row, index) => index + 1,
    },
    {
      name: "Department Name",
      selector: (row) => row.dep_name,
      sortable: true,
      grow: 1,
      center: true,
    },
    {
      name: "Action",
      width: "300px",
      center: true,
      cell: (row) => (
        <div className="department-actions">
          <Link
            aria-label={`Edit ${row.dep_name}`}
            className="department-action-button department-action-edit"
            title="Edit department"
            to={`/admin-dashboard/department/${row._id}`}
          >
            <FiEdit2 size={18} />
            <span>Edit</span>
          </Link>
          <button
            aria-label={`Delete ${row.dep_name}`}
            className="department-action-button department-action-delete"
            disabled={deletingId === row._id}
            onClick={() => handleDelete(row)}
            title="Delete department"
            type="button"
          >
            <FiTrash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="p-5">
      <div className="mb-5">
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
          <h1 className="mb-0 text-center text-2xl font-bold">Manage Departments</h1>
          <Link
            aria-label="Add new department"
            className="inline-flex items-center justify-self-end gap-2 rounded bg-teal-700 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-800"
            to="/admin-dashboard/add-department"
          >
            <FaPlus aria-hidden="true" />
            <span>Add New Department</span>
          </Link>
        </header>
      </div>
      {error && <p className="mb-4 text-red-600" role="alert">{error}</p>}
      <DataTable
        columns={columns}
        customStyles={{
          headCells: {
            style: {
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 800,
              color: "#111827",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              minHeight: "60px",
            },
          },
          cells: {
            style: {
              justifyContent: "center",
            },
          },
        }}
        data={filteredDepartments}
        keyField="_id"
        noDataComponent={loading ? "Loading departments..." : search.trim() ? "No departments match your search." : "No departments found."}
        pagination
        progressPending={loading}
      />
    </section>
  );
};

export default DepartmentList