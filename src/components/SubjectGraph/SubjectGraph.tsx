import type { FC } from 'react';
import { useAppStore } from '../../state/store';

const COLUMN_WIDTH = 160;
const ROW_HEIGHT = 80;
const BASE_NODE_RADIUS = 10;

export const SubjectGraph: FC = () => {
  const graph = useAppStore((s) => s.graph);
  const selectedSubjectId = useAppStore((s) => s.selectedSubjectId);
  const selectSubject = useAppStore((s) => s.selectSubject);

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

  graph.semesters.forEach((sem, colIndex) => {
    const ids = sem.subjectIds;
    const count = Math.max(ids.length, 1);
    ids.forEach((id, rowIndex) => {
      const subj = subjectById.get(id);
      if (!subj) return;
      positionedNodes.push({
        id: subj.id,
        label: subj.label,
        domain: subj.domain,
        x: 80 + colIndex * COLUMN_WIDTH,
        y:
          140 +
          rowIndex * ROW_HEIGHT -
          ((count - 1) * ROW_HEIGHT) / 2,
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
      >
        {graph.semesters.map((sem, idx) => {
          const x = 80 + idx * COLUMN_WIDTH;
          return (
            <g key={sem.index}>
              <rect
                x={x - COLUMN_WIDTH / 2}
                y={0}
                width={COLUMN_WIDTH}
                height={height}
                fill="#020617"
                opacity={0.4}
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
          const { from, to, overlapWeight, type } = e;
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
          const w =
            type === 'prereq'
              ? 2.5 + overlapWeight * 2
              : 1.2 + overlapWeight;
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
              />
              <text
                y={r + 12}
                textAnchor="middle"
                fill="#f9fafb"
                fontSize={11}
                fontWeight={600}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

