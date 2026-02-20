
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Attachment } from "../types";

export class GeminiService {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async sendMessage(
    prompt: string, 
    history: { role: 'user' | 'model', text: string, attachment?: Attachment }[],
    currentAttachment?: Attachment
  ) {
    try {
      const contents = history.map(h => {
        const parts: any[] = [{ text: h.text }];
        if (h.attachment) {
          parts.push({
            inlineData: {
              mimeType: h.attachment.mimeType,
              data: h.attachment.data
            }
          });
        }
        return { role: h.role, parts };
      });

      // Current turn
      const currentParts: any[] = [{ text: prompt }];
      if (currentAttachment) {
        currentParts.push({
          inlineData: {
            mimeType: currentAttachment.mimeType,
            data: currentAttachment.data
          }
        });
      }
      contents.push({ role: 'user', parts: currentParts });

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          // Use maximum thinking budget for extreme detail and error reduction
          thinkingConfig: { thinkingBudget: 32768 },
          temperature: 0.1, // Lower temperature for higher precision and factual consistency
        }
      });
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const urls = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title,
          uri: chunk.web.uri
        }));

      return {
        text: response.text || "Desculpe, ocorreu um erro na geração da resposta.",
        urls
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
