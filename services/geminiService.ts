
import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, AIInsight, RamadanInfo } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async transcribeAudio(base64Audio: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/wav',
              data: base64Audio,
            },
          },
          { text: "Transcribe this audio recording of a personal reflection log. Focus on spiritual activities, prayers, and personal health habits mentioned." }
        ]
      },
    });
    return response.text || "";
  }

  async analyzeLogs(logs: DailyLog[]): Promise<AIInsight> {
    const logData = JSON.stringify(logs);
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze these daily logs for a user preparing for Ramadan. 
      Logs: ${logData}
      Provide a summary of their progress, achievable goal suggestions, and a motivational message.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestions: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            motivation: { type: Type.STRING },
            spiritualLevel: { type: Type.STRING, enum: ['Improving', 'Stable', 'Needs Focus'] }
          },
          required: ["summary", "suggestions", "motivation", "spiritualLevel"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return {
        summary: "Analysis failed. Keep up your routine!",
        suggestions: ["Continue logging your daily activities."],
        motivation: "Every small step counts towards a better Ramadan.",
        spiritualLevel: "Stable"
      };
    }
  }

  async getRamadanPrepInfo(): Promise<RamadanInfo> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "What are the predicted dates for Ramadan 2025? Provide 5 practical physical and spiritual preparation tips based on Islamic scholars and health experts.",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || "Search Result",
        uri: chunk.web?.uri || "#"
      })) || [];

    // Simple parsing for structured output or fallback
    const text = response.text || "";
    const tips = text.split('\n').filter(l => l.match(/^\d\./)).map(l => l.replace(/^\d\.\s*/, ''));

    return {
      daysRemaining: this.calculateDaysToRamadan2025(),
      startDate: "February 28, 2025", // Hardcoded fallback or based on search if parsed
      tips: tips.length > 0 ? tips : ["Start fasting Mondays and Thursdays", "Read Quran for 15 mins daily", "Begin reducing caffeine", "Prepare a prayer space", "Start nightly Dhikr"],
      sources
    };
  }

  private calculateDaysToRamadan2025() {
    const target = new Date('2025-02-28');
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}

export const geminiService = new GeminiService();
