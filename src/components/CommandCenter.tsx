import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, BarChart2, TrendingUp, Target, Bot, 
  Zap, ArrowRight, Activity, Globe, Cpu, LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandCenterProps {
  onAction: (query: string) => void;
  setActivePage: (page: string) => void;
}

export function CommandCenter({ onAction, setActivePage }: CommandCenterProps) {
  const suggestedResearch = [
    { title: "Analyze Tata Motors Strategy", icon: Target, color: "text-blue-400" },
    { title: "Compare Reliance vs Adani", icon: BarChart2, color: "text-purple-400" },
    { title: "Forecast EV Market Growth", icon: TrendingUp, color: "text-emerald-400" },
    { title: "Simulate Startup Pricing Model", icon: Activity, color: "text-amber-400" },
  ];

  const smartActions = [
    { title: "Research", desc: "Analyze industries and companies", icon: Search, action: () => onAction("Conduct a deep research analysis on the current state of the Indian IT sector.") },
    { title: "Compare", desc: "Compare competitors and models", icon: BarChart2, action: () => onAction("Compare the business models of Zomato and Swiggy.") },
    { title: "Forecast", desc: "Predict revenue and growth", icon: TrendingUp, action: () => onAction("Forecast the revenue growth of the Indian renewable energy sector for the next 5 years.") },
    { title: "Simulate", desc: "Test strategic scenarios", icon: Target, action: () => onAction("Simulate a scenario where a new competitor enters the quick commerce market.") },
    { title: "Agent Builder", desc: "Create specialized AI agents", icon: Bot, action: () => setActivePage('Agent Builder') },
  ];

  const trendingInsights = [
    "AI industry funding reached $50B this year.",
    "Nvidia demand for AI chips surged 20%.",
    "Indian EV market projected to grow 35% CAGR."
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
      <div className="max-w-4xl mx-auto space-y-12 mt-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            BharatMind Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
            What would you like to analyze?
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Access deep research, financial forecasting, and strategic simulations powered by advanced AI.
          </p>
        </motion.div>

        {/* Smart Action Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {smartActions.map((action, i) => (
            <button
              key={i}
              onClick={action.action}
              className="group relative flex flex-col items-center text-center p-4 rounded-2xl bg-[#171717] border border-white/5 hover:border-emerald-500/30 hover:bg-[#1a1a1a] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-xl bg-[#212121] border border-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <action.icon className="w-5 h-5 text-gray-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-sm font-medium text-gray-200 mb-1">{action.title}</h3>
              <p className="text-[10px] text-gray-500 leading-tight">{action.desc}</p>
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Suggested Research */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-4"
          >
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Suggested Research
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedResearch.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onAction(item.title)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#171717] border border-white/5 hover:border-white/10 hover:bg-[#1a1a1a] transition-all group text-left"
                >
                  <div className={cn("w-8 h-8 rounded-lg bg-[#212121] flex items-center justify-center shrink-0", item.color)}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">{item.title}</span>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Trending Intelligence Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Trending Insights
            </h2>
            <div className="space-y-3">
              {trendingInsights.map((insight, i) => (
                <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-[#171717] to-[#111] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                  <p className="text-sm text-gray-300 relative z-10 mb-3">{insight}</p>
                  <button 
                    onClick={() => onAction(`Analyze this trend: ${insight}`)}
                    className="text-xs font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    Explore Analysis <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
