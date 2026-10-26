import { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import { loadMonthlySalary } from "./salaryMetrics";
import {
  FaBuilding,
  FaCheckCircle,
  FaFileAlt,
  FaHourglassHalf,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";

const AdminSummary = () => {
  const [metrics, setMetrics] = useState({ employees: "—", departments: "—", salary: "—" });
  const [leaveMetrics, setLeaveMetrics] = useState({ applied: "—", approved: "—", pending: "—", rejected: "—" });
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const headers = { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` };

    const loadMetrics = async () => {
      try {
        const [usersResponse, departmentsResponse, leavesResponse, salary] = await Promise.all([
          fetch("/api/users", { headers, signal: controller.signal }),
          fetch("/api/department", { headers, signal: controller.signal }),
          fetch("/api/leaves", { headers, signal: controller.signal }),
          loadMonthlySalary(controller.signal),
        ]);
        const [usersResult, departmentsResult, leavesResult] = await Promise.all([
          usersResponse.json(),
          departmentsResponse.json(),
          leavesResponse.json(),
        ]);

        if (!usersResponse.ok || !departmentsResponse.ok || !leavesResponse.ok) {
          throw new Error(usersResult.message || departmentsResult.error || leavesResult.message || "Unable to load dashboard metrics.");
        }

        const employees = Array.isArray(usersResult.users)
          ? usersResult.users.filter((user) => user.role === "employee")
          : [];
        const departments = Array.isArray(departmentsResult.department)
          ? departmentsResult.department
          : [];
        setMetrics({ employees: employees.length, departments: departments.length, salary });
        const leaveRequests = Array.isArray(leavesResult.requests) ? leavesResult.requests : [];
        setLeaveMetrics({
          applied: leaveRequests.length,
          approved: leaveRequests.filter((request) => request.status === "Approved").length,
          pending: leaveRequests.filter((request) => request.status === "Pending").length,
          rejected: leaveRequests.filter((request) => request.status === "Rejected").length,
        });
        setError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load dashboard metrics.");
        }
      }
    };

    loadMetrics();
    return () => controller.abort();
  }, []);

  return (
    <section className="p-6">
      <div className="mb-7">
        <p className="mb-2 text-sm font-semibold uppercase text-teal-800">
          Overview
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<FaUsers />}
          text="Total Employees"
          number={metrics.employees}
          color="bg-teal-700"
        />
        <SummaryCard
          icon={<FaBuilding />}
          text="Total Departments"
          number={metrics.departments}
          color="bg-amber-600"
        />
        <SummaryCard
          icon={<FaBuilding />}
          text="Monthly Salary"
          number={metrics.salary}
          color="bg-rose-700"
        />
      </div>
      <section className="mt-10">
        <h2 className="mb-5 text-xl font-bold text-gray-900">Leave Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<FaFileAlt />}
            text="Leave Applied"
            number={leaveMetrics.applied}
            color="bg-sky-700"
          />
          <SummaryCard
            icon={<FaCheckCircle />}
            text="Leave Approved"
            number={leaveMetrics.approved}
            color="bg-emerald-700"
          />
          <SummaryCard
            icon={<FaHourglassHalf />}
            text="Leave Pending"
            number={leaveMetrics.pending}
            color="bg-amber-600"
          />
          <SummaryCard
            icon={<FaTimesCircle />}
            text="Leave Rejected"
            number={leaveMetrics.rejected}
            color="bg-rose-700"
          />
        </div>
      </section>
    </section>
  );
};

export default AdminSummary;
