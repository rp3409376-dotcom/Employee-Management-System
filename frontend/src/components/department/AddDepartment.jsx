import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const AddDepartment = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const dashboardPath = user?.role === "employee" ? "/employee-dashboard" : "/admin-dashboard";
    const [department, setDepartment] = useState({ dep_name: "", description: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setDepartment((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSaving(true);

        try {
            const response = await fetch("/api/department", {
                method: "POST",
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
                throw new Error(result.error || "Unable to add department.");
            }

            navigate(`${dashboardPath}/departments`);
        } catch (requestError) {
            setError(requestError.message || "Unable to add department.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-xl p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Add Department</h1>
                <Link className="text-teal-800 underline" to={`${dashboardPath}/departments`}>
                    Back to departments
                </Link>
            </div>
            {error && <p className="mb-4 text-red-600" role="alert">{error}</p>}
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="mb-1 block" htmlFor="dep_name">Department Name</label>
                    <input
                        className="w-full rounded border px-3 py-2"
                        id="dep_name"
                        maxLength={100}
                        name="dep_name"
                        onChange={handleChange}
                        placeholder="Enter department name"
                        required
                        value={department.dep_name}
                    />
                </div>
                <div>
                    <label className="mb-1 block" htmlFor="description">Description</label>
                    <textarea
                        className="w-full rounded border px-3 py-2"
                        id="description"
                        maxLength={1000}
                        name="description"
                        onChange={handleChange}
                        placeholder="Add a short description"
                        rows={4}
                        value={department.description}
                    />
                </div>
                <button
                    className="rounded bg-teal-700 px-4 py-2 text-white disabled:opacity-60"
                    disabled={saving}
                    type="submit"
                >
                    {saving ? "Saving..." : "Add Department"}
                </button>
            </form>
        </div>
    );
};

export default AddDepartment;