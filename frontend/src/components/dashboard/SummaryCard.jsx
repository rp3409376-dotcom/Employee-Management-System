const SummaryCard = ({ icon, text, number, color }) => (
  <article className="flex min-h-24 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <div
      className={`flex w-16 shrink-0 items-center justify-center text-2xl text-white ${color}`}
    >
      {icon}
    </div>
    <div className="flex min-w-0 flex-col justify-center px-4 py-3">
      <p className="mb-1 truncate text-sm font-medium text-gray-600">{text}</p>
      <p className="mb-0 text-2xl font-bold text-gray-900">{number}</p>
    </div>
  </article>
);

export default SummaryCard;
