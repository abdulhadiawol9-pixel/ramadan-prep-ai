
import React from 'react';
import { AIInsight, RamadanInfo } from '../types';

interface AIInsightsProps {
  insight: AIInsight | null;
  ramadanInfo: RamadanInfo | null;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insight, ramadanInfo }) => {
  if (!insight && !ramadanInfo) return (
    <div className="p-8 text-center text-stone-400 animate-pulse">
      Generating divine insights...
    </div>
  );

  return (
    <div className="space-y-6">
      {insight && (
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-stone-800">Spiritual Deep Analysis</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              insight.spiritualLevel === 'Improving' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {insight.spiritualLevel}
            </span>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            {insight.summary}
          </p>
          
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Recommended Goals</h4>
            {insight.suggestions.map((s, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {i+1}
                </div>
                <p className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">{s}</p>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <p className="text-emerald-800 text-sm italic">"{insight.motivation}"</p>
          </div>
        </div>
      )}

      {ramadanInfo && (
        <div className="bg-stone-900 p-6 rounded-2xl text-white shadow-xl">
           <h3 className="font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Expert Prep Tips
          </h3>
          <div className="space-y-4">
            {ramadanInfo.tips.map((tip, i) => (
              <div key={i} className="flex gap-3 items-start border-l-2 border-amber-400/30 pl-4 py-1">
                <p className="text-sm text-stone-300">{tip}</p>
              </div>
            ))}
          </div>
          
          {ramadanInfo.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-800">
               <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">Sources</h4>
               <div className="flex flex-wrap gap-2">
                 {ramadanInfo.sources.slice(0, 3).map((source, i) => (
                   <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-400 hover:underline truncate max-w-[200px]">
                     {source.title}
                   </a>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
