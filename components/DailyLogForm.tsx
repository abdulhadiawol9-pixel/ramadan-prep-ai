
import React, { useState, useRef } from 'react';
import { DailyLog } from '../types';
import { geminiService } from '../services/geminiService';

interface DailyLogFormProps {
  onSave: (log: Omit<DailyLog, 'id'>) => void;
}

const DailyLogForm: React.FC<DailyLogFormProps> = ({ onSave }) => {
  const [quranPages, setQuranPages] = useState<number>(0);
  const [prayers, setPrayers] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const prayerList = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const togglePrayer = (prayer: string) => {
    setPrayers(prev => prev.includes(prayer) ? prev.filter(p => p !== prayer) : [...prev, prayer]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const text = await geminiService.transcribeAudio(base64);
          setReflection(prev => prev + (prev ? ' ' : '') + text);
        };
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSave = () => {
    onSave({
      date: new Date().toISOString(),
      quranPages,
      prayers,
      dhikrCount: 0,
      sleepHours: 8,
      exerciseMinutes: 0,
      hydrationMl: 2000,
      kindnessNote: '',
      reflection
    });
    // Reset
    setQuranPages(0);
    setPrayers([]);
    setReflection('');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
      <h3 className="text-lg font-bold mb-4 text-emerald-900">Daily Spirit Log</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">Quran Pages Read</label>
          <input 
            type="number" 
            value={quranPages} 
            onChange={e => setQuranPages(Number(e.target.value))}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">Prayers Performed</label>
          <div className="flex flex-wrap gap-2">
            {prayerList.map(p => (
              <button
                key={p}
                onClick={() => togglePrayer(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  prayers.includes(p) ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-stone-600">Reflections & Goals</label>
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              {isRecording ? 'Recording...' : 'Hold to Speak'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <textarea
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            placeholder="How was your day spiritually? Any acts of kindness?"
            className="w-full h-32 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-700/20"
        >
          Save Entry
        </button>
      </div>
    </div>
  );
};

export default DailyLogForm;
