import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaEye, FaPlus, FaSearch, FaTimesCircle } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import SummaryCard from "./SummaryCard";
import { useAuth } from "../../context/useAuth";
import "../employee/EmployeeDirectory.css";

const emptyForm = {
  employeeId: "",
  employeeName: "",
  department: "",
  leaveType: "Casual",
  startDate: "",
  endDate: "",
  reason: "",
  status: "Pending",
};

const LeaveDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` };
        const responses = await Promise.all([
          fetch("/api/leaves", { headers, signal: controller.signal }),
          ...(isAdmin ? [fetch("/api/users/employees", { headers, signal: controller.signal })] : []),
        ]);
        const results = await Promise.all(responses.map((response) => response.json()));
        if (!responses[0].ok) {
          throw new Error(results[0].message || "Unable to load leave requests.");
        }
        setRequests(Array.isArray(results[0].requests) ? results[0].requests : []);
        if (isAdmin) {
          if (!responses[1].ok) {
            throw new Error(results[1].message || "Unable to load employees.");
          }
          setEmployees(Array.isArray(results[1].employees) ? results[1].employees : []);
        }
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load leave requests.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => controller.abort();
  }, [isAdmin]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      const employeeName = (typeof request.employeeId === "object" ? request.employeeId?.name : "") || request.employeeName || "";
      const matchesStatus = !statusFilter || request.status === statusFilter;
      return matchesStatus && `${employeeName} ${request.department || ""} ${request.leaveType} ${request.status} ${request.reason}`
        .toLowerCase()
        .includes(query);
    });
  }, [requests, search, statusFilter]);

  const submitRequest = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to submit leave request.");
      }
      setRequests((current) => [result.request, ...current]);
      setForm(emptyForm);
      setShowForm(false);
      setNotice("Leave request submitted successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to submit leave request.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (request, status) => {
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/leaves/${request._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to update leave request.");
      }
      setRequests((current) => current.map((item) => item._id === result.request._id ? result.request : item));
      setNotice(`Leave request ${status.toLowerCase()}.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to update leave request.");
    }
  };

  const editLeaveRequest = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingEdit(true);
    try {
      const response = await fetch(`/api/leaves/${editingRequest._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: JSON.stringify(editingRequest.form),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to update leave request.");
      }
      setRequests((current) => current.map((item) =>
        item._id === result.request._id ? result.request : item,
      ));
      setEditingRequest(null);
      setNotice("Leave request updated.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update leave request.");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteRequest = async (request) => {
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/leaves/${request._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to remove leave request.");
      }
      setRequests((current) => current.filter((item) => item._id !== request._id));
      setNotice(isAdmin ? "Leave request removed." : "Pending leave request cancelled.");
    } catch (requestError) {
      setError(requestError.message || "Unable to remove leave request.");
    }
  };

  const counts = {
    total: requests.length,
    approved: requests.filter((request) => request.status === "Approved").length,
    pending: requests.filter((request) => request.status === "Pending").length,
    rejected: requests.filter((request) => request.status === "Rejected").length,
  };

  return (
    <section className="space-y-5 p-3 sm:p-5">
      <header className="employee-directory-heading">
        <label className="employee-directory-search">
          <span className="sr-only">Search leave requests</span>
          <FaSearch aria-hidden="true" className="employee-directory-search-icon" />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leave requests"
            type="search"
            value={search}
          />
        </label>
        <h1>Manage Leaves</h1>
        <div className="flex flex-col items-end justify-self-end gap-2">
          <button
            aria-label={showForm ? "Close leave form" : "Add leave request"}
            className="employee-directory-add-button"
            onClick={() => {
              setShowForm((visible) => {
                if (!visible) {
                  setForm({
                    ...emptyForm,
                    employeeName: isAdmin ? "" : user?.name || "",
                    department: isAdmin ? "" : user?.department || "",
                  });
                }
                return !visible;
              });
              setError("");
              setNotice("");
            }}
            type="button"
          >
            <FaPlus aria-hidden="true" />
            <span>{isAdmin ? "Add Leave" : "Apply Leave"}</span>
          </button>
          <div className="flex flex-wrap justify-end gap-2">
            {[
              { status: "Pending", className: "pending" },
              { status: "Approved", className: "approved" },
              { status: "Rejected", className: "rejected" },
            ].map(({ status, className }) => (
              <button
                aria-pressed={statusFilter === status}
                className={`leave-status-filter leave-status-filter--${className}`}
                key={status}
                onClick={() => setStatusFilter((current) => current === status ? "" : status)}
                type="button"
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<FaCalendarAlt />} text="Requests" number={counts.total} color="bg-sky-700" />
        <SummaryCard icon={<FaCheckCircle />} text="Approved" number={counts.approved} color="bg-emerald-700" />
        <SummaryCard icon={<FaClock />} text="Pending" number={counts.pending} color="bg-amber-600" />
        <SummaryCard icon={<FaTimesCircle />} text="Rejected" number={counts.rejected} color="bg-rose-700" />
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      {notice && <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{notice}</p>}

      {showForm && (
        <form
          className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-3"
          onSubmit={submitRequest}
        >
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Employee account
            {isAdmin ? (
              <select
                className="rounded border border-gray-300 px-3 py-2 font-normal"
                onChange={(event) => {
                  const employee = employees.find((item) => item._id === event.target.value);
                  setForm((current) => ({
                    ...current,
                    employeeId: event.target.value,
                    employeeName: employee?.name || "",
                    department: employee?.department || "",
                  }));
                }}
                required
                value={form.employeeId}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>{employee.name}</option>
                ))}
              </select>
            ) : (
              <input
                className="rounded border border-gray-300 bg-gray-50 px-3 py-2 font-normal"
                readOnly
                value={user?.email || ""}
              />
            )}
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Name
            <input
              className="rounded border border-gray-300 bg-gray-50 px-3 py-2 font-normal"
              readOnly
              value={form.employeeName}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Department
            <input
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              maxLength={100}
              onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
              value={form.department}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            Leave type
            <select
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              onChange={(event) => setForm((current) => ({ ...current, leaveType: event.target.value }))}
              value={form.leaveType}
            >
              <option>Casual</option>
              <option>Sick</option>
              <option>Annual</option>
              <option>Unpaid</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            From
            <input
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
              required
              type="date"
              value={form.startDate}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700">
            To
            <input
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              min={form.startDate || undefined}
              onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
              required
              type="date"
              value={form.endDate}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-gray-700 sm:col-span-2">
            Reason
            <textarea
              className="rounded border border-gray-300 px-3 py-2 font-normal"
              maxLength={500}
              onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
              required
              rows={2}
              value={form.reason}
            />
          </label>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-gray-700">Status</legend>
            {isAdmin ? (
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "Pending", selected: "border-amber-500 bg-amber-50 text-amber-800" },
                  { value: "Approved", selected: "border-emerald-600 bg-emerald-50 text-emerald-800" },
                  { value: "Rejected", selected: "border-rose-600 bg-rose-50 text-rose-800" },
                ].map((option) => (
                  <label className="cursor-pointer" key={option.value}>
                    <input
                      checked={form.status === option.value}
                      className="peer sr-only"
                      name="leaveStatus"
                      onChange={() => setForm((current) => ({ ...current, status: option.value }))}
                      type="radio"
                      value={option.value}
                    />
                    <span className={`inline-flex min-h-10 items-center rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
                      form.status === option.value
                        ? option.selected
                        : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    } peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-600`}>
                      {option.value}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <span className="inline-flex min-h-10 w-fit items-center rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                Pending
              </span>
            )}
          </fieldset>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded bg-teal-700 px-4 font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            <FaPlus aria-hidden="true" />
            {saving ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[1400px] table-auto text-center text-sm">
          <colgroup>
            <col className="w-16" />
            <col className="w-56" />
            <col />
            <col className="w-32" />
            <col />
            <col className="w-20" />
            <col className="w-[390px]" />
            <col className="w-[440px]" />
          </colgroup>
          <thead className="bg-gray-50 text-gray-800">
            <tr>
              <th className="px-4 py-4 font-extrabold">S.No</th>
              <th className="px-4 py-4 font-extrabold">Emp Id</th>
              <th className="px-4 py-4 font-extrabold">Name</th>
              <th className="px-4 py-4 font-extrabold">Leave Type</th>
              <th className="px-4 py-4 font-extrabold">Department</th>
              <th className="px-4 py-4 font-extrabold">Days</th>
              <th className="px-4 py-4 font-extrabold">Status</th>
              <th className="px-4 py-4 font-extrabold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request, index) => {
              const employee = typeof request.employeeId === "object" ? request.employeeId : null;
              const days = Math.round((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / 86400000) + 1;
              return (
                <tr className="border-t border-gray-100" key={request._id}>
                  <td className="px-4 py-4 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-4 text-gray-600">{employee?._id ?? request.employeeId?._id ?? request.employeeId ?? "—"}</td>
                  <td className="px-4 py-4 font-medium text-gray-900">{employee?.name || request.employeeName || user?.name || "—"}</td>
                  <td className="px-4 py-4 text-gray-600">{request.leaveType}</td>
                  <td className="px-4 py-4 text-gray-600">{request.department || employee?.department || "—"}</td>
                  <td className="px-4 py-4 text-gray-600">{days}</td>
                  <td className="px-4 py-4">
                    <div className="leave-status-actions">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        request.status === "Approved" ? "bg-emerald-50 text-emerald-700"
                          : request.status === "Rejected" ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                      }`}>
                        {request.status}
                      </span>
                      {isAdmin && (
                        <>
                          <button
                            aria-label={`Edit leave request for ${employee?.name || request.employeeName || "employee"}`}
                            className="leave-row-edit"
                            onClick={() => setEditingRequest({
                              _id: request._id,
                              form: {
                                employeeId: employee?._id ?? request.employeeId?._id ?? request.employeeId ?? "",
                                leaveType: request.leaveType,
                                startDate: String(request.startDate).slice(0, 10),
                                endDate: String(request.endDate).slice(0, 10),
                                department: request.department || employee?.department || "",
                                reason: request.reason || "",
                                status: request.status,
                              },
                            })}
                            type="button"
                          >
                            <FiEdit2 aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            aria-label={`Delete leave request for ${employee?.name || request.employeeName || "employee"}`}
                            className="leave-row-delete"
                            onClick={() => deleteRequest(request)}
                            type="button"
                          >
                            <FiTrash2 aria-hidden="true" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="leave-row-actions">
                      <button
                        aria-label={`View leave request for ${employee?.name || request.employeeName || user?.name || "employee"}`}
                        className="employee-directory-view shrink-0 whitespace-nowrap"
                        onClick={() => setSelectedRequest(request)}
                        type="button"
                      >
                        <FaEye aria-hidden="true" />
                        <span>View</span>
                      </button>
                      {!isAdmin && request.status === "Pending" && (
                        <button
                          className="shrink-0 rounded border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          onClick={() => deleteRequest(request)}
                          type="button"
                        >
                          Cancel
                        </button>
                      )}
                      {isAdmin && request.status === "Pending" && (
                        <>
                          <button
                            className="shrink-0 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            onClick={() => updateStatus(request, "Approved")}
                            type="button"
                          >
                            Approve
                          </button>
                          <button
                            className="shrink-0 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            onClick={() => updateStatus(request, "Rejected")}
                            type="button"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && filteredRequests.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-gray-500" colSpan={8}>
                  {statusFilter
                    ? `No ${statusFilter.toLowerCase()} leave requests found.`
                    : search.trim() ? "No leave requests match your search." : "No leave requests found."}
                </td>
              </tr>
            )}
            {loading && <tr><td className="px-4 py-8 text-gray-500" colSpan={8}>Loading leave requests...</td></tr>}
          </tbody>
        </table>
      </div>
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            aria-labelledby="edit-leave-request-title"
            aria-modal="true"
            className="my-auto grid w-full max-w-2xl gap-4 rounded-lg bg-white p-6 shadow-xl sm:grid-cols-2"
            onSubmit={editLeaveRequest}
            role="dialog"
          >
            <h2 className="mb-0 text-xl font-semibold text-gray-900 sm:col-span-2" id="edit-leave-request-title">
              Edit Leave Request
            </h2>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Employee
              <select
                className="rounded border border-gray-300 px-3 py-2 font-normal"
                onChange={(event) => setEditingRequest((current) => ({
                  ...current,
                  form: { ...current.form, employeeId: event.target.value },
                }))}
                required
                value={editingRequest.form.employeeId}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>{employee.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Leave type
              <select
                className="rounded border border-gray-300 px-3 py-2 font-normal"
                onChange={(event) => setEditingRequest((current) => ({
                  ...current,
                  form: { ...current.form, leaveType: event.target.value },
                }))}
                value={editingRequest.form.leaveType}
              >
                <option>Casual</option>
                <option>Sick</option>
                <option>Annual</option>
                <option>Unpaid</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              From
              <input
                className="rounded border border-gray-300 px-3 py-2 font-normal"
                onChange={(event) => setEditingRequest((current) => ({
                  ...current,
                  form: { ...current.form, startDate: event.target.value },
                }))}
                required
                type="date"
                value={editingRequest.form.startDate}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              To
              <input
                className="rounded border border-gray-300 px-3 py-2 font-normal"
                min={editingRequest.form.startDate || undefined}
                onChange={(event) => setEditingRequest((current) => ({
                  ...current,
                  form: { ...current.form, endDate: event.target.value },
                }))}
                required
                type="date"
                value={editingRequest.form.endDate}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Department
              <input
                className="rounded border border-gray-300 px-3 py-2 font-normal"
                maxLength={100}
                onChange={(event) => setEditingRequest((current) => ({
                  ...current,
                  form: { ...current.form, department: event.target.value },
                }))}
                value={editingRequest.form.department}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
              Status
              <select
                className="rounded border border-gray-300 px-3 py-2 font-normal"
                onChange={(event) => setEditingRequest((current) => ({
                  ...current,
                  form: { ...current.form, status: event.target.value },
                }))}
                value={editingRequest.form.status}
              >
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700 sm:col-span-2">
              Reason
              <textarea
                className="rounded border border-gray-300 px-3 py-2 font-normal"
                maxLength={500}
                onChange={(event) => setEditingRequest((current) => ({
                  ...current,
                  form: { ...current.form, reason: event.target.value },
                }))}
                required
                rows={3}
                value={editingRequest.form.reason}
              />
            </label>
            {error && <p className="text-sm text-red-700 sm:col-span-2" role="alert">{error}</p>}
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button
                className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setEditingRequest(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                disabled={savingEdit}
                type="submit"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section
            aria-labelledby="leave-request-details-title"
            aria-modal="true"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="mb-0 text-xl font-semibold text-gray-900" id="leave-request-details-title">
                Leave Request Details
              </h2>
              <button
                aria-label="Close leave request details"
                className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setSelectedRequest(null)}
                type="button"
              >
                ✕
              </button>
            </div>
            <dl className="space-y-3">
              {[
                ["Employee", (typeof selectedRequest.employeeId === "object" && selectedRequest.employeeId?.name) || selectedRequest.employeeName || user?.name || "—"],
                ["Employee ID", (typeof selectedRequest.employeeId === "object" && selectedRequest.employeeId?._id) || selectedRequest.employeeId || "—"],
                ["Department", selectedRequest.department || (typeof selectedRequest.employeeId === "object" && selectedRequest.employeeId?.department) || "—"],
                ["Leave type", selectedRequest.leaveType],
                ["From", new Date(selectedRequest.startDate).toLocaleDateString()],
                ["To", new Date(selectedRequest.endDate).toLocaleDateString()],
                ["Days", Math.round((new Date(selectedRequest.endDate).getTime() - new Date(selectedRequest.startDate).getTime()) / 86400000) + 1],
                ["Reason", selectedRequest.reason],
                ["Status", selectedRequest.status],
              ].map(([label, value]) => (
                <div className="grid grid-cols-[110px_1fr] gap-3" key={label}>
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="mb-0 break-words text-sm font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}
    </section>
  );
};

export default LeaveDashboard;
