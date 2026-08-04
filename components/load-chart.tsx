'use client';

// The load-over-time chart, split out so recharts sits behind a dynamic import
// rather than in the module graph of every screen.
//
// This is the only place in the app that uses recharts, and it is ~350 kB of a
// 790 kB bundle once its d3, lodash and react-smooth dependencies are counted —
// about 45%. Six of the seven screens never draw a chart.

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface LoadPoint {
  n: number;
  kg: number;
  volume: number;
}

export default function LoadChart({ data }: { data: LoadPoint[] }) {
  return (
    <div className="h-44 -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="n" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} stroke="var(--border)" />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} stroke="var(--border)" width={34} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 13,
            }}
            labelFormatter={(n) => `Session ${n}`}
            formatter={(v: number) => [`${v} kg`, 'Top set']}
          />
          <Line type="monotone" dataKey="kg" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
