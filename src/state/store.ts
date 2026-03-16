import { create } from 'zustand';
import type {
  CurriculumGraph,
  RetentionBySubjectId,
} from '../types';
import { computeSemesterRetentions } from '../utils/retention';

interface AppState {
  graph: CurriculumGraph | null;
  currentSemesterIndex: number;
  retentionBySemester: Record<number, RetentionBySubjectId>;
  selectedSubjectId: string | null;
  isPlaying: boolean;
  loading: boolean;
  error: string | null;
  loadCurriculum: (path: string) => Promise<void>;
  setCurrentSemester: (index: number) => void;
  selectSubject: (id: string | null) => void;
  play: () => void;
  pause: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  graph: null,
  currentSemesterIndex: 0,
  retentionBySemester: {},
  selectedSubjectId: null,
  isPlaying: false,
  loading: false,
  error: null,

  async loadCurriculum(path: string) {
    set({ loading: true, error: null });
    try {
      const res = await fetch(path);
      if (!res.ok) {
        throw new Error(`Failed to load curriculum: ${res.statusText}`);
      }
      const graph = (await res.json()) as CurriculumGraph;

      const retentionBySemester: Record<number, RetentionBySubjectId> = {};
      for (const semester of graph.semesters) {
        retentionBySemester[semester.index] = computeSemesterRetentions(
          graph,
          semester.index,
        );
      }

      set({
        graph,
        retentionBySemester,
        currentSemesterIndex: 0,
        selectedSubjectId: null,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error loading curriculum';
      set({ loading: false, error: message });
    }
  },

  setCurrentSemester(index: number) {
    const { graph, retentionBySemester } = get();
    if (!graph) {
      return;
    }

    if (retentionBySemester[index] == null) {
      retentionBySemester[index] = computeSemesterRetentions(graph, index);
    }

    set({ currentSemesterIndex: index, retentionBySemester: { ...retentionBySemester } });
  },

  selectSubject(id: string | null) {
    set({ selectedSubjectId: id });
  },

  play() {
    set({ isPlaying: true });
  },

  pause() {
    set({ isPlaying: false });
  },
}));

