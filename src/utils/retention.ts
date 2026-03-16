import type {
  CurriculumGraph,
  RetentionBySubjectId,
  SubjectEdge,
} from '../types';

interface ComputeRetentionArgs {
  baseRetention: number;
  decayRate: number;
  semestersElapsed: number;
  connectionBoost: number;
}

const clamp01 = (value: number): number =>
  Math.max(0, Math.min(1, value));

export function computeRetention({
  baseRetention,
  decayRate,
  semestersElapsed,
  connectionBoost,
}: ComputeRetentionArgs): number {
  const exponential = baseRetention * Math.exp(-decayRate * semestersElapsed);
  return clamp01(exponential + connectionBoost);
}

function neighborsForSubject(
  subjectId: string,
  edges: SubjectEdge[],
): SubjectEdge[] {
  return edges.filter((e) => e.from === subjectId || e.to === subjectId);
}

export function computeConnectionBoost(
  nodeId: string,
  activeSubjectIds: Set<string>,
  graph: CurriculumGraph,
  boostPerNeighbor = 0.05,
): number {
  const neighborEdges = neighborsForSubject(nodeId, graph.edges);

  let boost = 0;
  for (const edge of neighborEdges) {
    const otherId = edge.from === nodeId ? edge.to : edge.from;
    if (activeSubjectIds.has(otherId)) {
      boost += boostPerNeighbor * edge.overlapWeight;
    }
  }

  return boost;
}

export function computeSemesterRetentions(
  graph: CurriculumGraph,
  semesterIndex: number,
): RetentionBySubjectId {
  const activeSemester = graph.semesters.find(
    (s) => s.index === semesterIndex,
  );
  const activeSet = new Set(activeSemester?.subjectIds ?? []);

  const nowIndex = semesterIndex;
  const result: RetentionBySubjectId = {};

  for (const subject of graph.subjects) {
    const semestersElapsed = Math.max(0, nowIndex - subject.semesterIndex);
    const connectionBoost = computeConnectionBoost(
      subject.id,
      activeSet,
      graph,
    );

    result[subject.id] = computeRetention({
      baseRetention: subject.baseRetention,
      decayRate: subject.decayRate,
      semestersElapsed,
      connectionBoost,
    });
  }

  return result;
}

