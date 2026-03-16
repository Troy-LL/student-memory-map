import type { FC } from 'react';

export const ProfileSelector: FC = () => {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span className="uppercase tracking-wide text-[10px] text-slate-500">
        Profile
      </span>
      <select className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-500">
        <option value="sample_cs">Sample CS</option>
      </select>
    </div>
  );
};

