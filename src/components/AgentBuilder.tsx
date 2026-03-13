import React, { useState } from 'react';
import { 
  Bot, LineChart, Search, FileText, Target, Lightbulb, Headphones, 
  Settings, Play, Plus, Check, ChevronRight, Save, X, Database, 
  Globe, Mic, BarChart2, MessageSquare, Cpu, ArrowRight, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { deployAgent, executeAgentPipeline, AgentConfig } from '../services/agentEngine';
import { ResearchMessage } from './ResearchMessage';

interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tools: string[];
  capabilities: string[];
  instructions?: string;
}

const templates: AgentTemplate[] = [
  {
    id: 'financial-analyst',
    name: 'Financial Analyst Agent',
    role: 'Financial Advisor',
    description: 'Analyzes company financial statements and forecasts growth.',
    icon: LineChart,
    color: 'text-blue-500',
    tools: ['Financial Analysis', 'Data Visualization', 'Document Analysis'],
    capabilities: ['Financial Data Analysis', 'Strategy Simulation']
  },
  {
    id: 'market-research',
    name: 'Market Research Agent',
    role: 'Research Specialist',
    description: 'Performs competitor and industry research.',
    icon: Search,
    color: 'text-purple-500',
    tools: ['Web Research', 'Data Visualization'],
    capabilities: ['Real-time Web Search', 'Competitor Benchmarking']
  },
  {
    id: 'gst-compliance',
    name: 'GST Compliance Agent',
    role: 'Tax Consultant',
    description: 'Automates tax calculations and GST filings.',
    icon: FileText,
    color: 'text-emerald-500',
    tools: ['Document Analysis', 'Financial Analysis'],
    capabilities: ['Financial Data Analysis']
  },
  {
    id: 'sales-strategy',
    name: 'Sales Strategy Agent',
    role: 'Sales Strategist',
    description: 'Recommends pricing and growth strategies.',
    icon: Target,
    color: 'text-red-500',
    tools: ['Web Research', 'Data Visualization'],
    capabilities: ['Strategy Simulation', 'Competitor Benchmarking']
  },
  {
    id: 'startup-advisor',
    name: 'Startup Advisor Agent',
    role: 'Business Mentor',
    description: 'Provides guidance for startups and business planning.',
    icon: Lightbulb,
    color: 'text-amber-500',
    tools: ['Web Research', 'Document Analysis', 'Voice Interaction'],
    capabilities: ['Real-time Web Search', 'Strategy Simulation']
  },
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    role: 'Support Representative',
    description: 'Automates support responses and workflows.',
    icon: Headphones,
    color: 'text-pink-500',
    tools: ['Document Analysis', 'Voice Interaction'],
    capabilities: ['Multi-language Support', 'Voice Interaction']
  }
];

const allTools = ['Web Research', 'Financial Analysis', 'Data Visualization', 'Document Analysis', 'Voice Interaction'];
const allCapabilities = ['Real-time Web Search', 'Financial Data Analysis', 'Strategy Simulation', 'Competitor Benchmarking', 'Voice Interaction', 'Multi-language Support'];

export function AgentBuilder() {
  const [selectedAgent, setSelectedAgent] = useState<AgentTemplate | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testMessages, setTestMessages] = useState<{id: string, role: 'user' | 'agent', content: string}[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testingStep, setTestingStep] = useState<number>(0);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const startFallbackVoiceRecognition = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          try {
            const { transcribeAudio } = await import('@/services/geminiService');
            const text = await transcribeAudio(base64data, mimeType);
            if (text) {
              setTestInput(prev => prev + (prev ? ' ' : '') + text);
            }
          } catch (e) {
            console.error("Transcription failed", e);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      
      // Stop recording after 5 seconds for fallback
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);
      
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim() || !selectedAgent) return;

    const currentInput = testInput;
    setTestInput('');
    setIsTesting(true);
    setTestingStep(1);

    const newUserMsg = { id: Date.now().toString(), role: 'user' as const, content: currentInput };
    const agentMsgId = (Date.now() + 1).toString();
    
    setTestMessages(prev => [...prev, newUserMsg, { id: agentMsgId, role: 'agent', content: '' }]);

    // Simulate steps
    let currentStep = 1;
    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep <= 3) {
        setTestingStep(currentStep);
      }
    }, 1500);

    await executeAgentPipeline(selectedAgent as AgentConfig, currentInput, (chunk) => {
      setTestMessages(prev => prev.map(msg => {
        if (msg.id === agentMsgId) {
          return { ...msg, content: msg.content + chunk };
        }
        return msg;
      }));
    });

    clearInterval(stepInterval);
    setTestingStep(4);
    setIsTesting(false);
    
    // Reset after a few seconds
    setTimeout(() => {
      setTestingStep(0);
    }, 3000);
  };

  const handleDeploy = () => {
    if (!selectedAgent) return;
    deployAgent(selectedAgent as AgentConfig);
    alert(`Agent "${selectedAgent.name}" deployed successfully!`);
  };

  if (!selectedAgent) {
    return (
      <div className="flex-1 overflow-y-auto p-8 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Agent Builder</h1>
              <p className="text-gray-400 mt-1">Create specialized AI agents for business intelligence.</p>
            </div>
            <button 
              onClick={() => setSelectedAgent({
                id: 'custom',
                name: 'Custom Agent',
                role: 'Custom Role',
                description: 'A brand new custom agent.',
                icon: Bot,
                color: 'text-emerald-500',
                tools: [],
                capabilities: []
              })}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Agent</span>
            </button>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Agent Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div 
                  key={template.id} 
                  className="bg-[#171717] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 hover:bg-[#1a1a1a] transition-all cursor-pointer group flex flex-col h-full"
                  onClick={() => setSelectedAgent({...template})}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-10 h-10 rounded-xl bg-[#212121] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", template.color)}>
                      <template.icon className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-1 group-hover:text-emerald-400 transition-colors">{template.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-1">
                      {template.tools.slice(0, 3).map((tool, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-gray-600" title={tool} />
                      ))}
                    </div>
                    <button className="text-xs font-medium text-emerald-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Create Agent <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom Chat Input for creating custom agents */}
          <div className="mt-12 bg-[#171717] rounded-2xl p-6 border border-white/5">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Or describe what you want to build...</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. I need an agent that monitors my competitors' pricing and alerts me..."
                className="flex-1 bg-[#212121] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
              />
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0f0f0f]">
      {/* Configuration Panel (Left) */}
      <div className="flex-1 overflow-y-auto border-r border-white/5 p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedAgent(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                Configure Agent
              </h1>
            </div>
            <button 
              onClick={handleDeploy}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Deploy Agent</span>
            </button>
          </div>

          {/* Basic Info */}
          <div className="bg-[#171717] rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Agent Name</label>
                <input 
                  type="text" 
                  value={selectedAgent.name}
                  onChange={(e) => setSelectedAgent({...selectedAgent, name: e.target.value})}
                  className="w-full bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Agent Role</label>
                <input 
                  type="text" 
                  value={selectedAgent.role}
                  onChange={(e) => setSelectedAgent({...selectedAgent, role: e.target.value})}
                  className="w-full bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea 
                value={selectedAgent.description}
                onChange={(e) => setSelectedAgent({...selectedAgent, description: e.target.value})}
                className="w-full bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50 resize-none" 
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Domain Knowledge & Instructions</label>
              <textarea 
                value={selectedAgent.instructions || ''}
                onChange={(e) => setSelectedAgent({...selectedAgent, instructions: e.target.value})}
                placeholder="Provide specific instructions, knowledge base, or rules for this agent..."
                className="w-full bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50 resize-none" 
                rows={4}
              />
            </div>
          </div>

          {/* Tools & Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#171717] rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                Tools Allowed
              </h3>
              <div className="space-y-2">
                {allTools.map(tool => {
                  const isActive = selectedAgent.tools.includes(tool);
                  return (
                    <label key={tool} className="flex items-center justify-between p-2.5 rounded-lg bg-[#212121] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                      <span className="text-sm text-gray-300">{tool}</span>
                      <div className={cn("w-8 h-4 rounded-full transition-colors relative", isActive ? "bg-emerald-500" : "bg-gray-600")}>
                        <div className={cn("absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform", isActive ? "translate-x-4" : "translate-x-0")} />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#171717] rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Capabilities
              </h3>
              <div className="space-y-2">
                {allCapabilities.map(cap => {
                  const isActive = selectedAgent.capabilities.includes(cap);
                  return (
                    <label key={cap} className="flex items-center justify-between p-2.5 rounded-lg bg-[#212121] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                      <span className="text-sm text-gray-300">{cap}</span>
                      <div className={cn("w-8 h-4 rounded-full transition-colors relative", isActive ? "bg-emerald-500" : "bg-gray-600")}>
                        <div className={cn("absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform", isActive ? "translate-x-4" : "translate-x-0")} />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Agent Status Visualization */}
          <div className="bg-[#171717] rounded-2xl p-6 border border-white/5 mb-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Agent Status
              </h3>
              {testingStep > 0 && testingStep < 4 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between relative px-4 pb-6">
              <div className="absolute left-4 right-4 top-5 -translate-y-1/2 h-0.5 bg-white/5 z-0" />
              <div 
                className="absolute left-4 top-5 -translate-y-1/2 h-0.5 bg-emerald-500/50 z-0 transition-all duration-500" 
                style={{ width: `calc(${(testingStep / 4) * 100}% - 2rem)` }}
              />
              
              {[
                { step: 0, label: 'Idle', icon: Bot, color: 'text-gray-400', bg: 'bg-[#212121]', border: 'border-gray-500/30' },
                { step: 1, label: 'Thinking', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/50' },
                { step: 2, label: 'Searching', icon: Search, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/50' },
                { step: 3, label: 'Analyzing', icon: LineChart, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/50' },
                { step: 4, label: 'Complete', icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50' }
              ].map((item) => {
                const isPast = testingStep >= item.step;
                const isActive = testingStep === item.step;
                
                return (
                  <div key={item.step} className="flex flex-col items-center gap-2 relative z-10">
                    <div className={cn(
                      "w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300",
                      isActive ? cn(item.bg, item.border, "scale-110 shadow-[0_0_15px_rgba(0,0,0,0.2)]") : 
                      isPast ? "bg-emerald-500/10 border-emerald-500/30" : "bg-[#1a1a1a] border-white/10"
                    )}>
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? item.color : 
                        isPast ? "text-emerald-500" : "text-gray-600",
                        isActive && item.step > 0 && item.step < 4 ? "animate-pulse" : ""
                      )} />
                    </div>
                    <span className={cn(
                      "text-[10px] uppercase font-medium transition-colors absolute -bottom-6 whitespace-nowrap",
                      isActive ? item.color : 
                      isPast ? "text-emerald-500" : "text-gray-600"
                    )}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Test Playground (Right) */}
      <div className="w-[400px] bg-[#171717] flex flex-col flex-shrink-0 border-l border-white/5">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-medium text-white">Test Playground</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {testMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
              <Bot className="w-12 h-12 text-gray-400" />
              <p className="text-sm text-gray-400">Chat with your agent before deployment to test its capabilities.</p>
            </div>
          ) : (
            testMessages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === 'user' 
                    ? "bg-emerald-600 text-white rounded-br-sm" 
                    : "bg-[#212121] text-gray-200 rounded-bl-sm border border-white/5 w-full"
                )}>
                  {msg.role === 'user' ? msg.content : <ResearchMessage content={msg.content} />}
                </div>
              </div>
            ))
          )}
          {isTesting && (
            <div className="flex justify-start">
              <div className="bg-[#212121] rounded-2xl rounded-bl-sm px-4 py-2.5 border border-white/5">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#1a1a1a]">
          <form onSubmit={handleTestSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Test your agent..."
                className="w-full bg-[#212121] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
              />
              <button 
                type="button"
                onClick={() => {
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (!SpeechRecognition) {
                    startFallbackVoiceRecognition();
                    return;
                  }
                  const recognition = new SpeechRecognition();
                  recognition.lang = 'en-IN';
                  recognition.continuous = false;
                  recognition.interimResults = false;
                  
                  recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setTestInput(prev => prev + (prev ? ' ' : '') + transcript);
                  };
                  
                  recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    if (event.error === 'network' || event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                      recognition.stop();
                      startFallbackVoiceRecognition();
                    }
                  };
                  
                  try {
                    recognition.start();
                  } catch (e) {
                    startFallbackVoiceRecognition();
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-emerald-500 transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <button 
              type="submit"
              disabled={!testInput.trim() || isTesting}
              className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Add Zap icon since it was missing from imports
function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
