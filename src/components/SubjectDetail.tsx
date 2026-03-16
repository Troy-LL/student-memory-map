import type { FC } from 'react';
import { useAppStore } from '../state/store';

export const SubjectDetail: FC = () => {
  const graph = useAppStore((s) => s.graph);
  const selectedSubjectId = useAppStore((s) => s.selectedSubjectId);
  const currentSemesterIndex = useAppStore((s) => s.currentSemesterIndex);
  const retentionBySemester = useAppStore((s) => s.retentionBySemester);

  if (!graph || !selectedSubjectId) {
    return (
      <div className="text-[11px] text-slate-500">
        Hover the heatmap or click a node to inspect a subject.
      </div>
    );
  }

  const subject = graph.subjects.find((s) => s.id === selectedSubjectId);
  if (!subject) return null;

  const semester = graph.semesters.find(
    (s) => s.index === currentSemesterIndex,
  );
  const currentRetention =
    retentionBySemester[currentSemesterIndex]?.[selectedSubjectId] ?? 0;

  const neighbors = graph.edges
    .filter((e) => e.from === subject.id || e.to === subject.id)
    .map((e) => {
      const otherId = e.from === subject.id ? e.to : e.from;
      const other = graph.subjects.find((s) => s.id === otherId);
      return {
        id: otherId,
        label: other?.label ?? otherId,
        weight: e.overlapWeight,
        type: e.type ?? 'overlap',
      };
    });

  return (
    <div className="text-[11px] text-slate-200 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{subject.label}</span>
        <span className="px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-slate-400">
          {subject.domain}
        </span>
      </div>
      <div className="text-slate-400 flex flex-wrap gap-3">
        <span>
          Semester:{' '}
          <span className="text-slate-200">
            {semester?.label ?? `Y${subject.semesterIndex + 1}`}
          </span>
        </span>
        <span>
          Retention:{' '}
          <span className="text-slate-200">
            {(currentRetention * 100).toFixed(1)}%
          </span>
        </span>
      </div>
      {neighbors.length > 0 && (
        <div className="mt-1 text-slate-400">
          <span className="block mb-0.5">Connected subjects:</span>
          <div className="flex flex-wrap gap-1.5">
            {neighbors.map((n) => (
              <span
                key={n.id}
                className="px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-slate-300"
              >
                {n.label}{' '}
                <span className="text-slate-500">
                  ({n.type}, w={n.weight.toFixed(1)})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

