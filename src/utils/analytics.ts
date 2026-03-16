import type {
  CurriculumGraph,
  RetentionBySubjectId,
} from '../types';

export interface RetentionMatrix {
  semesters: string[];
  subjectIds: string[];
  values: number[][];
}

export function buildRetentionMatrix(
  graph: CurriculumGraph,
  retentionBySemester: Record<number, RetentionBySubjectId>,
): RetentionMatrix {
  const semesters = graph.semesters.map((s) => s.label);
  const subjectIds = graph.subjects.map((s) => s.id);

  const values = graph.semesters.map((semester) => {
    const ret = retentionBySemester[semester.index] ?? {};
    return subjectIds.map((id) => (ret[id] ?? 0) * 100);
  });

  return { semesters, subjectIds, values };
}

