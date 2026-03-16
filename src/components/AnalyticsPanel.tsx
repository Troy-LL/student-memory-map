import type { FC } from 'react';
import { RetentionAreaChart } from './Analytics/RetentionAreaChart';
import { RetentionHeatmap } from './Analytics/RetentionHeatmap';

export const AnalyticsPanel: FC = () => {
  return (
    <div className="flex-1 flex flex-col p-3 gap-2">
      <RetentionAreaChart />
      <RetentionHeatmap />
    </div>
  );
};

