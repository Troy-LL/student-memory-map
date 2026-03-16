import './index.css';
import { useEffect } from 'react';
import { SubjectGraph } from './components/SubjectGraph/SubjectGraph';
import { useAppStore } from './state/store';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ProfileSelector } from './components/ProfileSelector';
import { SubjectDetail } from './components/SubjectDetail';

function App() {
  const currentSemesterIndex = useAppStore((s) => s.currentSemesterIndex);
  const setCurrentSemester = useAppStore((s) => s.setCurrentSemester);
  const graph = useAppStore((s) => s.graph);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const play = useAppStore((s) => s.play);
  const pause = useAppStore((s) => s.pause);
  const maxSemesterIndex = useAppStore((s) => s.maxSemesterIndex);
  const setMaxSemesterIndex = useAppStore((s) => s.setMaxSemesterIndex);

  useEffect(() => {
    if (!isPlaying || !graph) {
      return;
    }

    const interval = window.setInterval(() => {
      const upper =
        maxSemesterIndex ?? graph.semesters.length - 1;
      const next =
        currentSemesterIndex >= upper ? 0 : currentSemesterIndex + 1;
      setCurrentSemester(next);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [isPlaying, graph, currentSemesterIndex, maxSemesterIndex, setCurrentSemester]);

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      <header className="border-b border-neutral-900 px-6 py-3 flex items-center justify-between bg-black/95">
        <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Student Memory Map
          </span>
          <span className="text-sm text-neutral-300">
            Curriculum as a living fireworks brain
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <ProfileSelector />
          <span className="hidden sm:inline-flex items-center gap-2">
            <span>Y1–Y4 timeline</span>
            <span className="w-px h-4 bg-neutral-800" />
            <span>Graph · Fireworks · Analytics</span>
          </span>
        </div>
      </header>

      <main className="flex-1 grid grid-rows-[minmax(0,1fr)_auto] bg-gradient-to-b from-black via-neutral-950 to-black">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-4 p-4 lg:p-6">
          <section
            aria-label="Subject graph"
            className="bg-black/80 border border-neutral-900 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col"
          >
            <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-neutral-800/80">
              <h2 className="text-xs font-semibold tracking-wide text-neutral-300 uppercase">
                Subject Tree
              </h2>
              <span className="text-[11px] text-neutral-500">
                Static graph (Phase 1 placeholder)
              </span>
            </div>
            <SubjectGraph />
          </section>

          <section
            aria-label="Analytics"
            className="bg-black/80 border border-neutral-900 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col"
          >
            <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-neutral-800/80">
              <h2 className="text-xs font-semibold tracking-wide text-neutral-300 uppercase">
                Retention Analytics
              </h2>
              <span className="text-[11px] text-neutral-500">
                Area chart & heatmap
              </span>
            </div>
            <AnalyticsPanel />
          </section>
        </div>

        <section
          aria-label="Timeline & details"
          className="border-t border-neutral-900 bg-black/95 backdrop-blur px-4 py-3 lg:px-6 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-neutral-300">
              <span className="font-semibold">Semester</span>
              <div className="flex gap-1">
                {Array.from({ length: 8 }).map((_, i) => {
                  const disabled = !!graph && i > maxSemesterIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setCurrentSemester(i)}
                      className={`w-6 h-6 rounded-full border text-[11px] transition-colors ${
                        disabled
                          ? 'border-neutral-800 text-neutral-700 cursor-not-allowed'
                          : currentSemesterIndex === i
                          ? 'border-neutral-100 text-neutral-100 bg-neutral-50/5'
                          : 'border-neutral-700 text-neutral-500 hover:border-neutral-200 hover:text-neutral-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-400">
              <button
                type="button"
                onClick={play}
                className={`px-2 py-1 rounded-full border transition-colors ${
                  isPlaying
                    ? 'border-neutral-100 text-neutral-100 bg-neutral-50/5'
                    : 'border-neutral-700 text-neutral-500 hover:border-neutral-200 hover:text-neutral-100'
                }`}
              >
                Play
              </button>
              <button
                type="button"
                onClick={pause}
                className={`px-2 py-1 rounded-full border transition-colors ${
                  !isPlaying
                    ? 'border-neutral-100 text-neutral-100 bg-neutral-50/5'
                    : 'border-neutral-700 text-neutral-500 hover:border-neutral-200 hover:text-neutral-100'
                }`}
              >
                Pause
              </button>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wide text-[10px] text-sky-400 font-semibold">
                  Choose your phase
                </span>
                <select
                  id="student-phase"
                  name="student-phase"
                  className="bg-black border border-sky-500 rounded-full px-3 py-1 text-[11px] text-neutral-100 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                  value={maxSemesterIndex}
                  onChange={(e) => setMaxSemesterIndex(Number(e.target.value))}
                >
                  <option value={1}>Up to Year 1</option>
                  <option value={3}>Up to Year 2</option>
                  <option value={5}>Up to Year 3</option>
                  <option value={7}>Up to Year 4</option>
                </select>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-500">
                <span className="uppercase tracking-wide">Time</span>
                <span className="w-px h-3 bg-neutral-800" />
                <span>
                  {graph
                    ? graph.semesters[currentSemesterIndex]?.label
                    : `S${currentSemesterIndex + 1}`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SubjectDetail />
            </div>
            <div className="w-full lg:w-[320px] text-[10px] text-neutral-300 bg-black/80 border border-neutral-800 rounded-md px-3 py-2">
              <div className="font-semibold text-[10px] text-neutral-200 mb-1">
                Visual legend
              </div>
              <div className="flex flex-wrap gap-2 mb-1.5">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                  <span>CS</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Math</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-400" />
                  <span>GE / Core</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-violet-400" />
                  <span>Other</span>
                </span>
              </div>
              <ul className="space-y-0.5">
                <li>• Line = prereq / overlap between subjects</li>
                <li>• Bigger bubble = more connections</li>
                <li>• Bright bubble = active this semester</li>
                <li>• Heatmap color = retention (cool → hot)</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
