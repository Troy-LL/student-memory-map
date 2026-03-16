import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useAppStore } from '../../state/store';
import type { CurriculumGraph } from '../../types';

interface EditableGraphForm {
  graph: CurriculumGraph | null;
}

export const CourseEditor: FC<EditableGraphForm> = () => {
  const graph = useAppStore((s) => s.graph);

  const [label, setLabel] = useState(graph?.label ?? '');

  if (!graph) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // future: persist to localStorage and update store
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="text-xs text-slate-300 flex flex-wrap gap-3 items-end"
    >
      <div className="flex flex-col gap-1">
        <label className="text-[11px] uppercase tracking-wide text-slate-500">
          Curriculum label
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
        />
      </div>
      <button
        type="submit"
        className="px-2 py-1 rounded-full border border-slate-700 text-slate-300 hover:border-sky-500 hover:text-sky-300 transition-colors"
      >
        Save (local)
      </button>
    </form>
  );
};

