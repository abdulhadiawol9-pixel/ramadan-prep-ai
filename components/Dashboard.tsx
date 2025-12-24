
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DailyLog } from '../types';

interface DashboardProps {
  logs: DailyLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs }) => {
  const chartData = logs.slice(-7).map(log => ({
    name: new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' }),
    pages: log.quranPages,
    prayers: log.prayers.length
  }));

  const stats = [
    { label: 'Total Pages', value: logs.reduce((acc, l) => acc + l.quranPages, 0), color: 'text-emerald-600' },
    { label: 'Avg Prayers', value: (logs.reduce((acc, l) => acc + l.prayers.length, 0) / (logs.length || 1)).toFixed(1), color: 'text-amber-600' },
    { label: 'Day Streak', value: logs.length, color: 'text-rose-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-center">
            <p className="text-xs text-stone-500 font-medium uppercase tracking-tighter">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
        <h4 className="text-sm font-bold text-stone-700 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          Quran Reading Progress
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="pages" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
        <h4 className="text-sm font-bold text-stone-700 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
          Prayer Consistency
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="prayers" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.prayers === 5 ? '#059669' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
