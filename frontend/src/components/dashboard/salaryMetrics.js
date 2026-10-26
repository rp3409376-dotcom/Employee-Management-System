export const loadMonthlySalary = async (signal) => {
  const response = await fetch("/api/salaries", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` },
    signal,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Unable to load monthly salary.");
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyTotal = (Array.isArray(result.records) ? result.records : [])
    .filter((record) => String(record.payDate ?? "").slice(0, 7) === currentMonth)
    .reduce((sum, record) => {
      const total = Number(record.total);
      return Number.isFinite(total) ? sum + total : sum;
    }, 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(monthlyTotal);
};
