
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, DailyLog, AIInsight, RamadanInfo } from './types';
import { geminiService } from './services/geminiService';
import Countdown from './components/Countdown';
import Dashboard from './components/Dashboard';
import DailyLogForm from './components/DailyLogForm';
import AIInsights from './components/AIInsights';
import LiveCoach from './components/LiveCoach';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [ramadanInfo, setRamadanInfo] = useState<RamadanInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    const saved = localStorage.getItem('ramadan_logs');
    if (saved) {
      setLogs(JSON.parse(saved));
    }

    const fetchRamadanInfo = async () => {
      try {
        const info = await geminiService.getRamadanPrepInfo();
        setRamadanInfo(info);
      } catch (e) {
        console.error("Failed to fetch search grounding", e);
      }
    };
    fetchRamadanInfo();
  }, []);

  // Update AI insights when logs change
  useEffect(() => {
    if (logs.length > 0) {
      const getAnalysis = async () => {
        setLoading(true);
        try {
          const res = await geminiService.analyzeLogs(logs);
          setInsight(res);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      getAnalysis();
    }
  }, [logs]);

  const handleSaveLog = (newLog: Omit<DailyLog, 'id'>) => {
    const log: DailyLog = { ...newLog, id: Date.now().toString() };
    const updated = [...logs, log];
    setLogs(updated);
    localStorage.setItem('ramadan_logs', JSON.stringify(updated));
    setActiveTab(AppTab.DASHBOARD);
  };

  const clearLogs = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setLogs([]);
      localStorage.removeItem('ramadan_logs');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-arabic text-xl">ر</div>
             <h1 className="font-bold text-emerald-900 tracking-tight">RamadanPrep</h1>
          </div>
          <button 
            onClick={clearLogs}
            className="text-[10px] text-stone-400 font-bold uppercase hover:text-red-500 transition-colors"
          >
            Reset All
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Stats & Log */}
          <div className="lg:col-span-7 space-y-8">
            <Countdown 
              days={ramadanInfo?.daysRemaining || 0} 
              startDate={ramadanInfo?.startDate || "Loading..."} 
            />

            {activeTab === AppTab.DASHBOARD && (
              <>
                <Dashboard logs={logs} />
                {logs.length === 0 && (
                  <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center">
                    <p className="text-emerald-800 font-medium mb-4">Start your spiritual journey today</p>
                    <button 
                      onClick={() => setActiveTab(AppTab.LOGS)}
                      className="bg-emerald-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-md"
                    >
                      Log Your First Day
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === AppTab.LOGS && (
              <DailyLogForm onSave={handleSaveLog} />
            )}

            {activeTab === AppTab.COACH && (
              <LiveCoach />
            )}
            
            {activeTab === AppTab.INSIGHTS && (
              <AIInsights insight={insight} ramadanInfo={ramadanInfo} />
            )}
          </div>

          {/* Right Column: AI Sidebar (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-5">
             <div className="sticky top-24 space-y-8">
                <AIInsights insight={insight} ramadanInfo={ramadanInfo} />
                <div className="bg-stone-100 p-6 rounded-2xl">
                   <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Quick Tip</h4>
                   <p className="text-sm text-stone-600">Prepare for suhoor hydration by drinking at least 2L of water throughout the evening. AI can help you track this!</p>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 lg:static lg:border-t-0 lg:bg-transparent lg:max-w-4xl lg:mx-auto lg:px-6 lg:mb-12">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between lg:bg-white lg:rounded-3xl lg:shadow-xl lg:border lg:border-stone-100 lg:px-12">
          <NavButton 
            active={activeTab === AppTab.DASHBOARD} 
            onClick={() => setActiveTab(AppTab.DASHBOARD)} 
            label="Home"
            icon={<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
          />
          <NavButton 
            active={activeTab === AppTab.LOGS} 
            onClick={() => setActiveTab(AppTab.LOGS)} 
            label="Log"
            icon={<path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
          />
          <NavButton 
            active={activeTab === AppTab.COACH} 
            onClick={() => setActiveTab(AppTab.COACH)} 
            label="Coach"
            icon={<path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />}
          />
          <NavButton 
            active={activeTab === AppTab.INSIGHTS} 
            onClick={() => setActiveTab(AppTab.INSIGHTS)} 
            label="AI"
            icon={<path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
          />
        </div>
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all px-4 py-2 rounded-2xl ${active ? 'text-emerald-700 bg-emerald-50 lg:bg-stone-50' : 'text-stone-400 hover:text-stone-600'}`}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icon}
    </svg>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
