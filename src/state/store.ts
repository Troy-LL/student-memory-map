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
  maxSemesterIndex: number;
  chartMode: 'overall' | 'subject';
  chartSubjectId: string | null;
  loading: boolean;
  error: string | null;
  loadCurriculum: (path: string) => Promise<void>;
  setCurrentSemester: (index: number) => void;
  selectSubject: (id: string | null) => void;
  play: () => void;
  pause: () => void;
  setMaxSemesterIndex: (index: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  graph: null,
  currentSemesterIndex: 0,
  retentionBySemester: {},
  selectedSubjectId: null,
  isPlaying: false,
  maxSemesterIndex: 7,
  chartMode: 'overall',
  chartSubjectId: null,
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
        isPlaying: false,
        maxSemesterIndex: graph.semesters.length - 1,
        chartMode: 'overall',
        chartSubjectId: null,
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
    const { graph, retentionBySemester, maxSemesterIndex } = get();
    if (!graph) {
      return;
    }

    const clamped = Math.max(0, Math.min(index, maxSemesterIndex));

    if (retentionBySemester[clamped] == null) {
      retentionBySemester[clamped] = computeSemesterRetentions(
        graph,
        clamped,
      );
    }

    set({
      currentSemesterIndex: clamped,
      retentionBySemester: { ...retentionBySemester },
    });
  },

  selectSubject(id: string | null) {
    const { isPlaying } = get();
    set({
      selectedSubjectId: id,
      chartMode: !isPlaying && id ? 'subject' : 'overall',
      chartSubjectId: id,
    });
  },

  play() {
    set({ isPlaying: true, chartMode: 'overall' });
  },

  pause() {
    set({ isPlaying: false });
  },

  setMaxSemesterIndex(index: number) {
    const { graph, currentSemesterIndex } = get();
    if (!graph) return;
    const max = Math.max(0, Math.min(index, graph.semesters.length - 1));
    set({
      maxSemesterIndex: max,
      currentSemesterIndex: Math.min(currentSemesterIndex, max),
    });
  },
}));

