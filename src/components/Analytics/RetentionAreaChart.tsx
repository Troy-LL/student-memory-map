import type { FC } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAppStore } from '../../state/store';
import { buildRetentionMatrix } from '../../utils/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

export const RetentionAreaChart: FC = () => {
  const graph = useAppStore((s) => s.graph);
  const retentionBySemester = useAppStore((s) => s.retentionBySemester);

  if (!graph) {
    return null;
  }

  const matrix = buildRetentionMatrix(graph, retentionBySemester);

  // Collapse into a single \"life load\" curve (average retention across all subjects)
  const averaged = matrix.values.map((row) => {
    if (!row.length) return 0;
    const sum = row.reduce((acc, v) => acc + v, 0);
    return sum / row.length;
  });

  const data = {
    labels: matrix.semesters,
    datasets: [
      {
        label: 'Overall retention',
        data: averaged,
        borderColor: '#f9fafb',
        backgroundColor: 'rgba(15,23,42,0.6)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label(context: any) {
            const label = context.dataset.label ?? '';
            const value = context.parsed.y ?? 0;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(15,23,42,0.7)',
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
        },
      },
      y: {
        stacked: true,
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(15,23,42,0.9)',
        },
        ticks: {
          color: '#6b7280',
          font: { size: 9 },
          callback(value: any) {
            return `${value}%`;
          },
        },
      },
    },
  };

  return (
    <div className="h-40">
      <Line data={data} options={options} />
    </div>
  );
};

