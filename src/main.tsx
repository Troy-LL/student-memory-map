import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useAppStore } from './state/store.ts';
import sampleCurriculum from '../data/subjects/sample_cs_curriculum.json';
import type { CurriculumGraph } from './types.ts';

const Root = () => {
  const loadCurriculumFromGraph = useAppStore(
    (s) => s.loadCurriculumFromGraph,
  );

  useEffect(() => {
    loadCurriculumFromGraph(sampleCurriculum as unknown as CurriculumGraph);
  }, [loadCurriculumFromGraph]);

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
