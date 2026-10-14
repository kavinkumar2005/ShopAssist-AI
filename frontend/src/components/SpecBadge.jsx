import React from 'react';

export const SpecBadge = ({ label, value, color = "indigo" }) => {
  if (!value || value === "N/A") return null;

  const colorClasses = {
    indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  };

  const selectedClass = colorClasses[color] || colorClasses.indigo;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${selectedClass}`}>
      {label && <span className="opacity-60">{label}:</span>}
      <span className="font-semibold">{value}</span>
    </span>
  );
};

export default SpecBadge;
