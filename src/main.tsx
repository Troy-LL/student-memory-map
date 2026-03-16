import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useAppStore } from './state/store.ts';

const Root = () => {
  const loadCurriculum = useAppStore((s) => s.loadCurriculum);

  useEffect(() => {
    void loadCurriculum('/data/subjects/sample_cs_curriculum.json');
  }, [loadCurriculum]);

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
