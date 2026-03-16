export type SubjectDomain = 'CS' | 'Math' | 'GE' | 'Other';

export interface SubjectNode {
  id: string;
  label: string;
  domain: SubjectDomain;
  semesterIndex: number; // 0–7 for 8 semesters
  baseRetention: number; // 0–1
  decayRate: number; // per-semester exponent coefficient
  position?: {
    x: number;
    y: number;
  };
}

export type EdgeType = 'prereq' | 'overlap';

export interface SubjectEdge {
  from: string;
  to: string;
  overlapWeight: number; // 0–1
  type?: EdgeType;
}

export interface Semester {
  index: number;
  label: string;
  subjectIds: string[];
}

export interface CurriculumGraph {
  id: string;
  label: string;
  subjects: SubjectNode[];
  edges: SubjectEdge[];
  semesters: Semester[];
}

export type RetentionBySubjectId = Record<string, number>;

