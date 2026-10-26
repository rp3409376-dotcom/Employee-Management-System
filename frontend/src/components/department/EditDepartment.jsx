import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboardPath = user?.role === "employee" ? "/employee-dashboard" : "/admin-dashboard";
  const [department, setDepartment] = useState({
    dep_name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadDepartment = async () => {
      try {
        const response = await fetch(`/api/department/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to load department.");
        }

        setDepartment({
          dep_name: result.department.dep_name ?? "",
          description: result.department.description ?? "",
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load department.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDepartment();
    return () => controller.abort();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDepartment((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`/api/department/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: JSON.stringify({
          dep_name: department.dep_name.trim(),
          description: department.description.trim(),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update department.");
      }

      navigate(`${dashboardPath}/departments`, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to update department.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="p-5" role="status">
        Loading department...
      </p>
    );
  }

  return (
    <div className="max-w-xl p-5">
      <h1 className="mb-5 text-2xl font-bold">Edit Department</h1>
      {error && (
        <p className="mb-4 text-red-600" role="alert">
          {error}
        </p>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block" htmlFor="dep_name">
            Department Name
          </label>
          <input
            className="w-full rounded border px-3 py-2"
            id="dep_name"
            name="dep_name"
            onChange={handleChange}
            required
            value={department.dep_name}
          />
        </div>
        <div>
          <label className="mb-1 block" htmlFor="description">
            Description
          </label>
          <textarea
            className="w-full rounded border px-3 py-2"
            id="description"
            name="description"
            onChange={handleChange}
            rows={4}
            value={department.description}
          />
        </div>
        <button
          className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditDepartment;
