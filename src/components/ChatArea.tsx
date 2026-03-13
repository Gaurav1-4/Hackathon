import { Bot, User, Search, FileText, Activity, CheckCircle2, ShieldAlert, LineChart, Network, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import { ResearchMessage } from './ResearchMessage';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ResearchProgress() {
  const [activeAgent, setActiveAgent] = useState(0);
  
  const agents = [
    { name: "Market Analyst Agent", role: "Analyzing industry trends & demand", icon: LineChart, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", output: "Evaluating market size and growth drivers..." },
    { name: "Risk Intelligence Agent", role: "Evaluating regulatory & financial risks", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", output: "Scanning macroeconomic exposure and threats..." },
    { name: "Strategy Consultant Agent", role: "Providing strategic recommendations", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", output: "Formulating competitive positioning models..." },
    { name: "Data Verification Agent", role: "Checking factual accuracy", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", output: "Validating sources and attaching citations..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent(s => (s < agents.length - 1 ? s + 1 : s));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 w-full max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="font-medium text-sm text-emerald-400 uppercase tracking-wider">AI Intelligence Council</span>
        </div>
        <span className="text-xs text-gray-500 font-mono">{activeAgent + 1} / {agents.length}</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {agents.map((agent, i) => {
          const isActive = i === activeAgent;
          const isDone = i < activeAgent;
          const isPending = i > activeAgent;
          
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isPending ? 0.4 : 1, y: 0 }}
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex gap-4 items-center",
                isActive ? cn(agent.bg, agent.border) : "bg-[#222] border-white/5",
                isDone && "border-emerald-500/30 bg-emerald-500/5"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              )}
              
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] shrink-0 border border-white/10 relative z-10">
                <agent.icon className={cn("w-5 h-5", isDone ? "text-emerald-500" : isActive ? agent.color : "text-gray-500")} />
              </div>
              
              <div className="flex-1 relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-sm font-semibold", isDone ? "text-gray-300" : isActive ? "text-white" : "text-gray-500")}>
                    {agent.name}
                  </span>
                  <span className={cn("text-[10px] uppercase tracking-wider font-medium", isActive ? agent.color : "text-gray-600")}>
                    {isDone ? "Complete" : isActive ? "Analyzing" : "Waiting"}
                  </span>
                </div>
                <span className={cn("block text-xs", isActive ? "text-gray-300" : "text-gray-600")}>
                  {isActive ? (
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ color: 'inherit' }} />
                      {agent.output}
                    </span>
                  ) : isDone ? (
                    "Analysis integrated into final report."
                  ) : (
                    agent.role
                  )}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function ChatArea({ messages, isGenerating, onTranslateMessage }: { messages: Message[], isGenerating: boolean, onTranslateMessage?: (id: string, translatedText: string) => void }) {
  // Filter out empty assistant messages that are just placeholders while generating
  const displayMessages = messages.filter(msg => msg.content.trim() !== '');

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-32 scroll-smooth">
      <div className="max-w-3xl mx-auto space-y-8">
        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-emerald-500" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed",
                msg.role === 'user'
                  ? "bg-[#2f2f2f] text-gray-100"
                  : "bg-transparent text-gray-300 w-full"
              )}
            >
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <ResearchMessage 
                  content={msg.content} 
                  onTranslate={onTranslateMessage ? (translatedText) => onTranslateMessage(msg.id, translatedText) : undefined} 
                />
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-5 h-5 text-emerald-500" />
            </div>
            <ResearchProgress />
          </div>
        )}
      </div>
    </div>
  );
}
