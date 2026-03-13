import { X, TrendingUp, AlertTriangle, Activity, Target, ArrowUpRight, ArrowDownRight, Zap, Globe, ShieldCheck, Lightbulb, Newspaper, Briefcase, Bookmark, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Signal {
  id: number;
  type: string;
  title: string;
  desc: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  confidenceScore: number;
  timestamp: string;
}

const initialSignals: Signal[] = [
  {
    id: 1,
    type: 'news',
    title: 'Breaking News',
    desc: 'RBI announces new regulatory framework for digital lending platforms. Expected to impact fintech margins.',
    icon: Newspaper,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    confidenceScore: 92,
    timestamp: 'Just now'
  },
  {
    id: 2,
    type: 'trend',
    title: 'Trending Industry',
    desc: 'Agentic AI and autonomous workflows are seeing a 300% YoY search volume increase in enterprise SaaS.',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    confidenceScore: 88,
    timestamp: '10 mins ago'
  },
  {
    id: 3,
    type: 'opportunity',
    title: 'Investment Signal',
    desc: 'Renewable energy storage sector shows strong buy signals. Government subsidies expected next quarter.',
    icon: Briefcase,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    confidenceScore: 85,
    timestamp: '1 hour ago'
  },
  {
    id: 4,
    type: 'risk',
    title: 'Competitor Move',
    desc: 'Major competitor just acquired an AI startup to bolster their data analytics capabilities.',
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    confidenceScore: 95,
    timestamp: '2 hours ago'
  }
];

export function RightPanel({ onClose, onResearchTopic }: { onClose: () => void, onResearchTopic?: (topic: string) => void }) {
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [researchingId, setResearchingId] = useState<number | null>(null);

  // Background intelligence scanner simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newSignal: Signal = {
        id: Date.now(),
        type: 'insight',
        title: 'Supply Chain Optimization',
        desc: 'Logistics costs from Western India to Southern hubs have decreased by 8% due to new freight corridors.',
        icon: Lightbulb,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        confidenceScore: 82,
        timestamp: 'Just now'
      };
      setSignals(prev => [newSignal, ...prev.slice(0, 4)]);
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleResearch = (signal: Signal) => {
    setResearchingId(signal.id);
    // Simulate API delay
    setTimeout(() => {
      if (onResearchTopic) {
        onResearchTopic(`Analyze the impact of: ${signal.desc}`);
      }
      setResearchingId(null);
    }, 800);
  };

  return (
    <div className="w-[340px] bg-[#171717] border-l border-white/5 flex flex-col h-full flex-shrink-0 shadow-2xl">
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="font-semibold text-sm tracking-wide text-gray-200">Market Intelligence Radar</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-xs text-gray-400 mb-4">Live AI monitoring scanning global web sources for research opportunities.</p>
        
        <AnimatePresence>
          {signals.map((signal, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1 }}
              key={signal.id} 
              className="bg-[#212121] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all group shadow-lg hover:shadow-emerald-500/5 relative overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border", signal.bg, signal.border)}>
                  <signal.icon className={cn("w-3 h-3", signal.color)} />
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", signal.color)}>
                    {signal.type}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500">{signal.timestamp}</span>
              </div>
              
              <div className="relative z-10 mb-3">
                <h4 className="text-sm font-semibold text-gray-200 mb-1 leading-tight">{signal.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {signal.desc}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center"><Globe className="w-3 h-3 text-blue-400" /></div>
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center"><Activity className="w-3 h-3 text-purple-400" /></div>
                  </div>
                  <span className="text-[10px] text-gray-500">Multiple sources</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Confidence:</span>
                  <span className={cn("text-xs font-bold", signal.confidenceScore > 90 ? "text-emerald-400" : "text-amber-400")}>{signal.confidenceScore}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <button 
                  onClick={() => handleResearch(signal)}
                  disabled={researchingId === signal.id}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-xs font-medium text-emerald-400 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {researchingId === signal.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3" />
                      Research Topic
                    </>
                  )}
                </button>
                <button className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] border border-white/5 text-gray-400 hover:text-white transition-colors">
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
                <button className="p-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] border border-white/5 text-gray-400 hover:text-white transition-colors">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <Globe className="w-6 h-6 text-emerald-500 mx-auto mb-2 relative z-10" />
          <span className="block text-sm font-medium text-emerald-400 mb-1 relative z-10">Radar Active</span>
          <span className="block text-xs text-gray-400 relative z-10">Scanning millions of data points across the web.</span>
        </div>
      </div>
    </div>
  );
}
