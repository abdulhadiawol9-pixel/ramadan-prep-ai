
import React from 'react';

interface CountdownProps {
  days: number;
  startDate: string;
}

const Countdown: React.FC<CountdownProps> = ({ days, startDate }) => {
  return (
    <div className="bg-emerald-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h3 className="text-emerald-100 text-sm font-semibold uppercase tracking-wider mb-1">Road to Ramadan 2025</h3>
          <p className="text-3xl font-bold">{days} Days Left</p>
          <p className="text-emerald-200 text-xs mt-1 italic">Expected start: {startDate}</p>
        </div>
        <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </div>
      </div>
      {/* Decorative patterns */}
      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-emerald-700/50 rounded-full blur-2xl"></div>
    </div>
  );
};

export default Countdown;
