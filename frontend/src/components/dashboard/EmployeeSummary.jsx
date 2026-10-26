import { useEffect, useState } from "react";
import { FaBuilding, FaCalendarAlt, FaMoneyBillWave, FaUser } from "react-icons/fa";
import { useAuth } from "../../context/useAuth";
import SummaryCard from "./SummaryCard";
import { loadMonthlySalary } from "./salaryMetrics";

const EmployeeSummary = () => {
  const { user } = useAuth();
  const [departmentCount, setDepartmentCount] = useState("—");
  const [monthlySalary, setMonthlySalary] = useState("—");
  const [leaveMetrics, setLeaveMetrics] = useState({ applied: "—", approved: "—", pending: "—", rejected: "—" });
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
        setDepartmentCount(Array.isArray(result.department) ? result.department.length : 0);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load departments.");
        }
      }
    };

    loadDepartments();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadMonthlySalary(controller.signal)
      .then(setMonthlySalary)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load monthly salary.");
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadLeaveMetrics = async () => {
      try {
        const response = await fetch("/api/leaves", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Unable to load leave details.");
        }
        const requests = Array.isArray(result.requests) ? result.requests : [];
        setLeaveMetrics({
          applied: requests.length,
          approved: requests.filter((request) => request.status === "Approved").length,
          pending: requests.filter((request) => request.status === "Pending").length,
          rejected: requests.filter((request) => request.status === "Rejected").length,
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load leave details.");
        }
      }
    };

    loadLeaveMetrics();
    return () => controller.abort();
  }, []);

  return (
    <section className="p-3 sm:p-6">
      <div className="mb-7">
        <p className="mb-2 text-sm font-semibold uppercase text-teal-800">Overview</p>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard icon={<FaUser />} text="My Account" number={user?.name || "Employee"} color="bg-teal-700" />
        <SummaryCard icon={<FaBuilding />} text="Total Departments" number={departmentCount} color="bg-amber-600" />
        <SummaryCard icon={<FaMoneyBillWave />} text="Monthly Salary" number={monthlySalary} color="bg-rose-700" />
      </div>
      <section className="mt-10">
        <h2 className="mb-5 text-xl font-bold text-gray-900">Leave Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={<FaCalendarAlt />} text="Leave Applied" number={leaveMetrics.applied} color="bg-sky-700" />
          <SummaryCard icon={<FaCalendarAlt />} text="Leave Approved" number={leaveMetrics.approved} color="bg-emerald-700" />
          <SummaryCard icon={<FaCalendarAlt />} text="Leave Pending" number={leaveMetrics.pending} color="bg-amber-600" />
          <SummaryCard icon={<FaCalendarAlt />} text="Leave Rejected" number={leaveMetrics.rejected} color="bg-rose-700" />
        </div>
      </section>
    </section>
  );
};

export default EmployeeSummary;
