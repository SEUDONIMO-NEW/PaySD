
import { GoogleGenAI } from "@google/genai";

/**
 * Servicio de Inteligencia Financiera PaySD
 * Utiliza Gemini 3 Flash para análisis de bajo costo y alta velocidad.
 */
export const getFinancialAdvice = async (data: any) => {
  // Obtenemos la key directamente de process.env según las guías
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API Key no configurada en Vercel Environment Variables.");
    return "Configura tu API_KEY en Vercel para activar el asesor inteligente.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `Actúa como un Consultor Senior de Riesgos Fintech. Analiza los siguientes datos de cartera:
            - Cartera Total: ${data.totalPortfolio}
            - Recaudo Hoy: ${data.collectedToday}
            - En Mora: ${data.overdue}
            - Eficiencia: ${data.efficiency}%
            
            Proporciona 3 consejos ejecutivos breves para mejorar el recaudo hoy mismo. Responde en español.`
          }]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    return response.text || "Análisis no disponible actualmente.";
  } catch (error) {
    console.error("Error en Gemini AI Service:", error);
    return "El motor de IA está experimentando alta demanda. Intente más tarde.";
  }
};

export const getFaqResponse = async (query: string) => {
  return null;
};
