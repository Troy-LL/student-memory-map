import type { FC } from 'react';
import { useRef, useState } from 'react';
import { useAppStore } from '../../state/store';

const COLUMN_WIDTH = 160;
const BASE_NODE_RADIUS = 10;

export const SubjectGraph: FC = () => {
  const graph = useAppStore((s) => s.graph);
  const selectedSubjectId = useAppStore((s) => s.selectedSubjectId);
  const selectSubject = useAppStore((s) => s.selectSubject);
  const currentSemesterIndex = useAppStore((s) => s.currentSemesterIndex);
  const isPlaying = useAppStore((s) => s.isPlaying);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  if (!graph) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
        Loading curriculum…
      </div>
    );
  }

  const subjectById = new Map(graph.subjects.map((s) => [s.id, s]));

  const positionedNodes: {
    id: string;
    label: string;
    domain: string;
    x: number;
    y: number;
  }[] = [];

  // Compute max number of subjects in any semester to scale rows to fit panel
  const maxPerSemester = graph.semesters.reduce(
    (max, sem) =>
      sem.subjectIds.length > max ? sem.subjectIds.length : max,
    1,
  );
  const topMargin = 80;
  const bottomMargin = 80;
  const availableHeight = Math.max(120, 520 - topMargin - bottomMargin);
  const baseRowGap =
    maxPerSemester > 1
      ? availableHeight / (maxPerSemester - 1)
      : 0;

  graph.semesters.forEach((sem, colIndex) => {
    const ids = sem.subjectIds;
    const count = Math.max(ids.length, 1);
    const rowGap = count > 1 ? baseRowGap : 0;
    ids.forEach((id, rowIndex) => {
      const subj = subjectById.get(id);
      if (!subj) return;
      const y =
        count === 1
          ? 260
          : topMargin + rowGap * rowIndex;
      positionedNodes.push({
        id: subj.id,
        label: subj.label,
        domain: subj.domain,
        x: 80 + colIndex * COLUMN_WIDTH,
        y,
      });
    });
  });

  const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));

  // degree = number of incident edges
  const degree = new Map<string, number>();
  graph.edges.forEach((e) => {
    degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
    degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
  });

  const edges = graph.edges
    .map((e) => {
      const from = nodeMap.get(e.from);
      const to = nodeMap.get(e.to);
      if (!from || !to) return null;
      return { ...e, from, to };
    })
    .filter(Boolean) as {
    from: (typeof positionedNodes)[number];
    to: (typeof positionedNodes)[number];
    overlapWeight: number;
    type?: string;
  }[];

  const width = Math.max(
    480,
    160 + (graph.semesters.length - 1) * COLUMN_WIDTH,
  );
  const height = 520;

  const domainColor = (domain: string) => {
    switch (domain) {
      case 'CS':
        return '#f97316';
      case 'Math':
        return '#22c55e';
      case 'GE':
        return '#38bdf8';
      default:
        return '#a855f7';
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        aria-label="Curriculum subject graph"
        onMouseDown={(e) => {
          setDragging(true);
          lastPos.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseMove={(e) => {
          if (!dragging || !lastPos.current) return;
          const dx = e.clientX - lastPos.current.x;
          const dy = e.clientY - lastPos.current.y;
          setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
          lastPos.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseUp={() => {
          setDragging(false);
          lastPos.current = null;
        }}
        onMouseLeave={() => {
          setDragging(false);
          lastPos.current = null;
        }}
      >
        <g transform={`translate(${pan.x},${pan.y})`}>
        {graph.semesters.map((sem, idx) => {
          const x = 80 + idx * COLUMN_WIDTH;
          const isActiveSemester = idx === currentSemesterIndex;
          return (
            <g key={sem.index}>
              <rect
                x={x - COLUMN_WIDTH / 2}
                y={0}
                width={COLUMN_WIDTH}
                height={height}
                fill={isActiveSemester ? '#020617' : '#020617'}
                opacity={isActiveSemester ? 0.7 : 0.35}
              />
              <line
                x1={x}
                x2={x}
                y1={24}
                y2={height - 24}
                stroke="#0b1120"
                strokeDasharray="4,6"
                strokeWidth={1.2}
              />
              <text
                x={x}
                y={16}
                textAnchor="middle"
                fill="#f9fafb"
                fontSize={11}
                fontWeight={600}
              >
                {sem.label}
              </text>
            </g>
          );
        })}

        {edges.map((e, i) => {
          const { from, to, type } = e;
          const fromDeg = degree.get(from.id) ?? 1;
          const toDeg = degree.get(to.id) ?? 1;
          const fromR = BASE_NODE_RADIUS + fromDeg * 2;
          const toR = BASE_NODE_RADIUS + toDeg * 2;
          const startX = from.x + fromR;
          const startY = from.y;
          const endX = to.x - toR;
          const endY = to.y;
          const midX = (startX + endX) / 2;
          const stroke = type === 'prereq' ? '#e5e7eb' : '#9ca3af';
          const w = type === 'prereq' ? 2.5 : 2; // unified per type
          const opacity =
            type === 'prereq'
              ? 0.95
              : 0.7;
          return (
            <path
              key={i}
              d={`M ${startX},${startY} C ${midX},${startY} ${midX},${endY} ${endX},${endY}`}
              fill="none"
              stroke={stroke}
              strokeWidth={w}
              strokeLinecap="round"
              opacity={opacity}
            />
          );
        })}

        {positionedNodes.map((n) => {
          const deg = degree.get(n.id) ?? 1;
          const r = BASE_NODE_RADIUS + deg * 2;
          const isSelected = selectedSubjectId === n.id;
          const isActiveThisSemester =
            graph.semesters[currentSemesterIndex]?.subjectIds.includes(
              n.id,
            ) ?? false;
          const dimmed = isPlaying && !isActiveThisSemester;
          const opacity = dimmed ? 0.25 : 1;

          // simple label wrapping: split long labels into two lines
          const label =
            n.label.length > 18
              ? [n.label.slice(0, 18), n.label.slice(18)]
              : [n.label];
          return (
            <g
              key={n.id}
              transform={`translate(${n.x},${n.y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => selectSubject(n.id)}
              onMouseEnter={() => selectSubject(n.id)}
            >
              <circle
                r={r}
                fill={domainColor(n.domain)}
                stroke={isSelected ? '#facc15' : '#020617'}
                strokeWidth={3}
                opacity={opacity}
              />
              <text
                textAnchor="middle"
                fill="#f9fafb"
                fontSize={10}
                fontWeight={600}
                opacity={opacity}
              >
                <tspan x={0} y={r + 10}>
                  {label[0]}
                </tspan>
                {label[1] ? (
                  <tspan x={0} y={r + 22}>
                    {label[1]}
                  </tspan>
                ) : null}
              </text>
            </g>
          );
        })}
        </g>
      </svg>
    </div>
  );
};

