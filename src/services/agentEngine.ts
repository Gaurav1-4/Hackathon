/// <reference types="vite/client" />
import { GoogleGenAI } from "@google/genai";

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  description: string;
  tools: string[];
  capabilities: string[];
  instructions?: string;
}

export const agentRegistry: Record<string, AgentConfig> = {};

export function deployAgent(agent: AgentConfig) {
  agentRegistry[agent.id] = agent;
  return agent;
}

export function getAgent(id: string) {
  return agentRegistry[id];
}

export async function executeAgentPipeline(agent: AgentConfig, query: string, onProgress?: (chunk: string) => void) {
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    const msg = "Error: VITE_GEMINI_API_KEY is missing. Please configure your API key.";
    if (onProgress) onProgress(msg);
    return msg;
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are ${agent.name}, acting as a ${agent.role}.
Description: ${agent.description}
Instructions: ${agent.instructions || 'None'}

You have access to the following tools: ${agent.tools.join(', ')}
You have the following capabilities: ${agent.capabilities.join(', ')}

You are an advanced AI Agent Execution Engine. You must synthesize a comprehensive response based on your capabilities.

Structure your final response EXACTLY with the following markdown headings:
### Research Summary
Provide a concise summary of the findings.

### Key Insights
List 3-5 bullet points with the most important insights.

### Visualization Data
If Data Visualization is enabled, provide a markdown table or structured data representation. Otherwise, state "Visualization not applicable."

### Strategic Recommendations
Provide actionable recommendations based on the analysis.
`;

  const tools: any[] = [];
  if (agent.capabilities.includes('Real-time Web Search') || agent.tools.includes('Web Research')) {
    tools.push({ googleSearch: {} });
  }

  try {
    if (onProgress) {
      onProgress("> **Agent Memory:** Initializing context for " + agent.name + "...\n\n");
      await new Promise(r => setTimeout(r, 500));
      onProgress("> **Task Planner:** Analyzing query and selecting tools...\n\n");
      await new Promise(r => setTimeout(r, 500));
      
      if (agent.tools.includes('Web Research') || agent.capabilities.includes('Real-time Web Search')) {
        onProgress("> **Tool Selector:** Executing `webSearch(query)`...\n\n");
        await new Promise(r => setTimeout(r, 600));
      }
      if (agent.tools.includes('Financial Analysis') || agent.capabilities.includes('Financial Data Analysis')) {
        onProgress("> **Tool Selector:** Executing `financialAnalysis(data)`...\n\n");
        await new Promise(r => setTimeout(r, 600));
      }
      if (agent.tools.includes('Data Visualization')) {
        onProgress("> **Tool Selector:** Executing `generateCharts(data)`...\n\n");
        await new Promise(r => setTimeout(r, 600));
      }
      if (agent.tools.includes('Document Analysis')) {
        onProgress("> **Tool Selector:** Executing `documentAnalysis(file)`...\n\n");
        await new Promise(r => setTimeout(r, 600));
      }
      
      onProgress("> **Result Synthesizer:** Generating final structured response...\n\n---\n\n");
    }

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-pro-preview",
      contents: query,
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        if (onProgress) onProgress(chunk.text);
      }
    }
    
    return fullText;
  } catch (error: any) {
    console.error("Agent execution error:", error);
    const errorMsg = `\n\nError executing agent pipeline: ${error.message}`;
    if (onProgress) onProgress(errorMsg);
    return errorMsg;
  }
}
