
import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from '../types';

export async function generateHealthInsights(analysis: AnalysisResult): Promise<string> {
  if (!process.env.API_KEY) {
    return Promise.reject(new Error("API key not found."));
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
You are a public health expert analyzing data from India's National Family Health Survey (NFHS).
Based on the following summary data, provide key insights and actionable recommendations.
The data represents percentages of the population affected by various health indicators.

**National Averages:**
- Average Hypertension: ${analysis.averages.avgHypertension.toFixed(1)}%
- Average Diabetes: ${analysis.averages.avgDiabetes.toFixed(1)}%
- Average Anemia: ${analysis.averages.avgAnemia.toFixed(1)}%

**Top 5 High-Risk States (by overall health burden):**
${analysis.topRiskStates.map((state, i) => `
${i + 1}. ${state.state}
   - Overall Health Burden Score: ${state.totalBurden.toFixed(1)}%
   - Hypertension: ${state.avg_hypertension.toFixed(1)}%
   - Diabetes: ${state.avg_diabetes.toFixed(1)}%
   - Anemia: ${state.avg_anemia.toFixed(1)}%
   - Lifestyle Risk Score: ${state.lifestyle_risk.toFixed(1)}%
`).join('')}

**Your Task:**
1.  **Key Insights:** In 3-4 bullet points, summarize the most critical findings from this data. What are the overarching trends or concerns?
2.  **Actionable Recommendations:** Provide a list of 5-6 targeted, practical recommendations for public health officials and policymakers. These should be categorized (e.g., Policy Level, Community Initiatives, Healthcare System Strengthening).

Format your response clearly using Markdown. Use headings for "Key Insights" and "Actionable Recommendations".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Error: Could not generate AI insights. Please check the API key and network connection.";
  }
}
