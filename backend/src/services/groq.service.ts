import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class GroqService {
  static async forecastDemand(product: any, movements: any[]) {
    const prompt = `
      You are an expert inventory analyst. Based on the following product details and historical sales data, predict the demand for the next month.
      
      Product: ${JSON.stringify(product)}
      Recent Sales Movements: ${JSON.stringify(movements)}
      
      Provide your response in JSON format with the following keys:
      - predictedDemand: (number) The estimated number of units to be sold next month.
      - confidence: (number between 0 and 1) Your confidence level in this prediction.
      - period: (string, YYYY-MM) The month this prediction is for.
      - reasoning: (string) A brief explanation of your prediction.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3-70b-8192',
      response_format: { type: 'json_object' },
    });

    return JSON.parse(chatCompletion.choices[0].message.content || '{}');
  }

  static async chatQuery(orgContext: any, message: string, history: any[]) {
    const systemPrompt = `
      You are the Intellistock AI Assistant. You have access to the current inventory state of the organization.
      Organization Context: ${JSON.stringify(orgContext)}
      
      Help the user manage their inventory, answer questions about stock levels, and provide business insights.
      Be concise, professional, and data-driven.
    `;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((h: any) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3-70b-8192',
    });

    return chatCompletion.choices[0].message.content;
  }

  static async detectAnomalies(movements: any[]) {
    const prompt = `
      Analyze the following inventory movements for anomalies such as unusual spikes in sales, potential theft (large adjustments), or data entry errors.
      Movements: ${JSON.stringify(movements)}
      
      Return a JSON array of insights, each with:
      - type: "stock_alert" | "turnover" | "anomaly" | "optimization"
      - content: (string, markdown) The insight description.
      - severity: "low" | "medium" | "high"
      - metadata: (object) Any relevant data (e.g., productId).
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3-70b-8192',
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(chatCompletion.choices[0].message.content || '{"insights": []}');
    return result.insights || [];
  }
}
