'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type Point = { date: string; nav: number };

export default function FundChart({ data }: { data: { date: string; nav: string }[] }) {
  const points: Point[] =
    data?.slice(-180).map((d) => ({ date: d.date, nav: parseFloat(d.nav) })) ?? [];

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <AreaChart data={points}>
          <defs>
            <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2e7d32" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" hide />
          <YAxis domain={['dataMin', 'dataMax']} width={40} />
          <Tooltip />
          <Area type="monotone" dataKey="nav" stroke="#2e7d32" fill="url(#c)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}