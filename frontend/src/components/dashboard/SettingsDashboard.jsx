import { FaCogs, FaUserShield } from "react-icons/fa";
import { useAuth } from "../../context/useAuth";

const SettingsDashboard = () => {
  const { user } = useAuth();

  return (
    <section className="space-y-6 p-3 sm:p-5">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-800">Workspace</p>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Settings</h1>
      </header>
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-lg bg-teal-50 p-3 text-teal-800"><FaUserShield aria-hidden="true" /></span>
          <div>
            <h2 className="mb-1 text-lg font-semibold text-gray-900">Account information</h2>
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded border border-gray-100 p-4"><dt className="text-sm text-gray-500">Name</dt><dd className="mb-0 mt-1 font-medium text-gray-900">{user?.name || "—"}</dd></div>
          <div className="rounded border border-gray-100 p-4"><dt className="text-sm text-gray-500">Email</dt><dd className="mb-0 mt-1 font-medium text-gray-900">{user?.email || "—"}</dd></div>
          <div className="rounded border border-gray-100 p-4"><dt className="text-sm text-gray-500">Role</dt><dd className="mb-0 mt-1 font-medium capitalize text-gray-900">{user?.role || "—"}</dd></div>
          <div className="rounded border border-gray-100 p-4"><dt className="text-sm text-gray-500">Workspace</dt><dd className="mb-0 mt-1 flex items-center gap-2 font-medium text-gray-900"><FaCogs aria-hidden="true" className="text-teal-700" /> Employee MS</dd></div>
        </dl>
      </section>
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Profile editing and workspace preferences are not connected yet.</p>
    </section>
  );
};

export default SettingsDashboard;
