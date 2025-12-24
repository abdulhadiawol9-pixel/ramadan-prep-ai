
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { encode, decode, decodeAudioData, floatTo16BitPCM } from '../utils/audioHelpers';

const LiveCoach: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  const startSession = async () => {
    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputAudioCtx;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: 'You are a warm, supportive spiritual coach for someone preparing for Ramadan. Help them with routine, motivation, and spiritual guidance. Keep responses encouraging and short.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus('connected');
            setIsActive(true);
            const source = inputAudioCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = floatTo16BitPCM(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({
                media: { data: encode(pcmData), mimeType: 'audio/pcm;rate=16000' }
              }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtx.destination);
          },
          onmessage: async (msg: any) => {
            if (msg.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev, `AI: ${msg.serverContent.outputTranscription.text}`]);
            }
            if (msg.serverContent?.inputTranscription) {
              setTranscription(prev => [...prev, `You: ${msg.serverContent.inputTranscription.text}`]);
            }

            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const buf = await decodeAudioData(decode(audioData), outputAudioCtx, 24000, 1);
              const source = outputAudioCtx.createBufferSource();
              source.buffer = buf;
              source.connect(outputAudioCtx.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buf.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => console.error("Live API Error", e)
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start coach session", err);
      setStatus('idle');
    }
  };

  return (
    <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl min-h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">AI Spiritual Coach</h3>
          <p className="text-emerald-300 text-sm">Real-time voice guidance</p>
        </div>
        <div className={`h-3 w-3 rounded-full ${status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-stone-500'}`} />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar max-h-64">
        {transcription.length === 0 && (
          <div className="text-center text-emerald-400/50 mt-12 italic">
            Start a conversation to get guidance for your Ramadan prep.
          </div>
        )}
        {transcription.map((t, i) => (
          <div key={i} className={`p-3 rounded-lg text-sm ${t.startsWith('AI:') ? 'bg-white/10 ml-0 mr-8' : 'bg-emerald-700 ml-8 mr-0 text-right'}`}>
            {t}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        {!isActive ? (
          <button
            onClick={startSession}
            disabled={status === 'connecting'}
            className="group relative flex items-center justify-center bg-white text-emerald-900 px-8 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            {status === 'connecting' ? 'Warming up...' : 'Start Session'}
            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 -z-10 group-hover:block hidden"></div>
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2"
          >
            End Conversation
            <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveCoach;
