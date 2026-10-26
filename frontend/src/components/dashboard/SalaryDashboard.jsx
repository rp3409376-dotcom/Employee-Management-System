import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useAuth } from "../../context/useAuth";
import "../employee/EmployeeDirectory.css";

const emptyForm = {
  employeeId: "",
  salary: "",
  allowance: "0",
  deduction: "0",
  payDate: "",
};

const SalaryDashboard = () => {
  const { user } = useAuth();
  const isAdmin = String(user?.role ?? "").trim().toLowerCase() === "admin";
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` };
        const responses = await Promise.all([
          fetch("/api/salaries", { headers, signal: controller.signal }),
          ...(isAdmin ? [fetch("/api/users/employees", { headers, signal: controller.signal })] : []),
        ]);
        const results = await Promise.all(responses.map((response) => response.json()));
        if (!responses[0].ok) {
          throw new Error(results[0].message || "Unable to load salary records.");
        }
        setRecords(Array.isArray(results[0].records) ? results[0].records : []);
        if (isAdmin) {
          if (!responses[1].ok) {
            throw new Error(results[1].message || "Unable to load employees.");
          }
          setEmployees(Array.isArray(results[1].employees) ? results[1].employees : []);
        }
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load salary records.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => controller.abort();
  }, [isAdmin]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const employeeEmail = typeof record.employeeId === "object" ? record.employeeId?.email ?? "" : "";
      return String(employeeEmail).toLowerCase().includes(query);
    });
  }, [records, search]);

  const addSalary = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await fetch("/api/salaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: JSON.stringify({
          employeeId: form.employeeId,
          salary: Number(form.salary),
          allowance: Number(form.allowance),
          deduction: Number(form.deduction),
          payDate: form.payDate,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to save salary record.");
      }
      setRecords((current) => [result.record, ...current]);
      setForm(emptyForm);
      setShowForm(false);
      setNotice("Salary record saved successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to save salary record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5 p-3 sm:p-5">
      <header className="employee-directory-heading">
        <label className="employee-directory-search">
          <span className="sr-only">Search by employee email</span>
          <FaSearch aria-hidden="true" className="employee-directory-search-icon" />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by employee email"
            type="search"
            value={search}
          />
        </label>
        <h1>Salary Records</h1>
        <button
          aria-expanded={isAdmin ? showForm : undefined}
          aria-label={isAdmin && showForm ? "Close add salary form" : "Add new salary"}
          className="employee-directory-add-button"
          onClick={() => {
            setError("");
            setNotice("");
            if (!isAdmin) {
              setError("Only an admin can add salary records. Please sign in with an admin account.");
              return;
            }
            setShowForm((visible) => !visible);
          }}
          type="button"
        >
          <FaPlus aria-hidden="true" />
          <span>{isAdmin && showForm ? "Close Salary Form" : "Add New Salary"}</span>
        </button>
      </header>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      {notice && <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{notice}</p>}
      {showForm && (
        <form
          className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-3"
          onSubmit={addSalary}
        >
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Employee
            <select
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}
              required
              value={form.employeeId}
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} ({employee.email})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Salary
            <input
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, salary: event.target.value }))}
              required
              step="0.01"
              type="number"
              value={form.salary}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Allowance
            <input
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, allowance: event.target.value }))}
              required
              step="0.01"
              type="number"
              value={form.allowance}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Deduction
            <input
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, deduction: event.target.value }))}
              required
              step="0.01"
              type="number"
              value={form.deduction}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            PayDate
            <input
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              onChange={(event) => setForm((current) => ({ ...current, payDate: event.target.value }))}
              required
              type="date"
              value={form.payDate}
            />
          </label>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded bg-teal-700 px-4 font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
            disabled={saving || employees.length === 0}
            type="submit"
          >
            <FaPlus aria-hidden="true" />
            {saving ? "Saving..." : "Save Salary"}
          </button>
          {employees.length === 0 && (
            <p className="text-sm text-amber-700 sm:col-span-2 xl:col-span-3">
              Add an employee before creating a salary record.
            </p>
          )}
        </form>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-center text-sm">
          <colgroup>
            <col className="w-20" />
            <col className="w-56" />
            <col className="w-36" />
            <col className="w-36" />
            <col className="w-36" />
            <col className="w-36" />
            <col className="w-36" />
          </colgroup>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Employee Email</th>
              <th>Salary</th>
              <th>Allowance</th>
              <th>Deduction</th>
              <th>Total</th>
              <th>PayDate</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, index) => {
              const employeeEmail = typeof record.employeeId === "object" ? record.employeeId?.email ?? "—" : "—";
              return (
                <tr key={record._id}>
                  <td>{index + 1}</td>
                  <td className="font-medium text-gray-900">{employeeEmail}</td>
                  <td>{record.salary}</td>
                  <td>{record.allowance}</td>
                  <td>{record.deduction}</td>
                  <td>{record.total}</td>
                  <td>{new Date(record.payDate).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {!loading && filteredRecords.length === 0 && (
              <tr>
                <td className="text-gray-400">—</td>
                <td className="text-gray-500" colSpan={5}>
                  {search.trim() ? "No salary records match this employee email." : "No salary records found."}
                </td>
                <td>—</td>
              </tr>
            )}
            {loading && <tr><td className="py-8 text-gray-500" colSpan={7}>Loading salary records...</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SalaryDashboard;
