import React from 'react';

export const AnalyticsCard = ({ title, value, subtitle, icon: Icon, color = "indigo" }) => {
  const colorMap = {
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/30",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30",
  };

  const currentTheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="glass-card rounded-2xl p-5 border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl bg-gradient-to-br ${currentTheme} border`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        {value}
      </div>

      {subtitle && (
        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;
