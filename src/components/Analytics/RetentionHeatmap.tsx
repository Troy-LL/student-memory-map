import type { FC } from 'react';
import { useAppStore } from '../../state/store';
import { buildRetentionMatrix } from '../../utils/analytics';
import { retentionToColor } from '../../utils/color';

export const RetentionHeatmap: FC = () => {
  const graph = useAppStore((s) => s.graph);
  const retentionBySemester = useAppStore((s) => s.retentionBySemester);
  const setCurrentSemester = useAppStore((s) => s.setCurrentSemester);
  const selectSubject = useAppStore((s) => s.selectSubject);
  const selectedSubjectId = useAppStore((s) => s.selectedSubjectId);

  if (!graph) return null;

  const matrix = buildRetentionMatrix(graph, retentionBySemester);

  return (
    <div className="mt-3 border border-neutral-900 rounded-lg overflow-hidden bg-black/80">
      <div className="max-h-44 overflow-auto text-[10px]">
        <table className="w-full border-collapse">
          <thead className="bg-black sticky top-0">
            <tr>
              <th className="px-2 py-1 text-left text-neutral-400 font-medium">
                Subject
              </th>
              {matrix.semesters.map((label) => (
                <th
                  key={label}
                  className="px-1 py-1 text-center text-neutral-500 font-normal"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.subjectIds.map((subjectId, rowIdx) => {
              const isSelected = selectedSubjectId === subjectId;
              return (
                <tr
                  key={subjectId}
                  className={
                    isSelected
                      ? 'bg-neutral-800'
                      : 'odd:bg-black even:bg-neutral-950'
                  }
                >
                  <td className="px-2 py-1 text-neutral-200 whitespace-nowrap">
                  {subjectId}
                  </td>
                  {matrix.semesters.map((_, colIdx) => {
                  const value = matrix.values[colIdx][rowIdx];
                  const color = retentionToColor(value);
                  return (
                    <td key={colIdx} className="px-0.5 py-0.5">
                      <button
                        type="button"
                        className="w-full h-3 rounded-sm border border-neutral-800/60"
                        style={{ backgroundColor: color }}
                        onMouseEnter={() => {
                          setCurrentSemester(colIdx);
                          selectSubject(subjectId);
                        }}
                        title={`${subjectId} – ${value.toFixed(
                          1,
                        )}% at ${matrix.semesters[colIdx]}`}
                      />
                    </td>
                  );
                })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

