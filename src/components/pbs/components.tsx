import React from 'react';
import { Mic, Activity, Wallet, Zap, FlaskConical, Play, Crosshair, AlertTriangle, Lightbulb, ChevronRight, Database, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function CEOBriefPanel({ data, isLoading }: { data: any, isLoading: boolean }) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePlayVoice = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!data) return;

    const text = `Good morning. Your business generated ${data.revenue.toLocaleString()} rupees yesterday. Your best selling product is Cooking Oil. Inventory for Rice is running low. Today's focus: Restock Rice and launch a weekend promotion.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (isLoading) {
    return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-32"></div>;
  }
  if (!data) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 text-gray-500">No data available yet.</div>;

  return (
    <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CEO Daily Brief
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed max-w-3xl">
            Good morning. Your business generated <span className="text-white font-semibold">₹{data.revenue.toLocaleString()}</span> yesterday. 
            Your best selling product is <span className="text-white font-semibold">Cooking Oil</span>. 
            Inventory for Rice is running low. 
            Today's focus: <span className="text-emerald-400">Restock Rice and launch a weekend promotion.</span>
          </p>
        </div>
        <button 
          onClick={handlePlayVoice}
          className="w-10 h-10 rounded-full bg-[#222] border border-white/10 flex items-center justify-center hover:bg-[#333] hover:border-emerald-500/50 transition-all group shrink-0"
        >
          {isPlaying ? (
            <div className="flex gap-1">
              <span className="w-1 h-3 bg-emerald-500 animate-pulse"></span>
              <span className="w-1 h-3 bg-emerald-500 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1 h-3 bg-emerald-500 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
            </div>
          ) : (
            <Play className="w-4 h-4 text-gray-400 group-hover:text-emerald-400" />
          )}
        </button>
      </div>
    </div>
  );
}

export function BusinessHealthScore({ score, isLoading }: { score: number, isLoading: boolean }) {
  if (isLoading) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-64"></div>;
  if (score === undefined) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 text-gray-500">No data available yet.</div>;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center relative">
      <h3 className="text-xs font-medium text-gray-400 absolute top-6 left-6 flex items-center gap-2">
        <Activity className="w-4 h-4" /> Health Score
      </h3>
      
      <div className="relative w-32 h-32 mt-6 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="8" />
          <circle 
            cx="50" cy="50" r="45" fill="none" 
            stroke="currentColor" strokeWidth="8" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${color}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-light text-white">{score}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      
      <div className="w-full mt-6 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Revenue Growth</span>
          <span className="text-emerald-500">Strong</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Profit Margin</span>
          <span className="text-emerald-500">Strong</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Cash Flow</span>
          <span className="text-yellow-500">Moderate</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Inventory</span>
          <span className="text-red-500">Risk</span>
        </div>
      </div>
    </div>
  );
}

const revenueData = [
  { name: 'Mon', revenue: 40000 },
  { name: 'Tue', revenue: 45000 },
  { name: 'Wed', revenue: 42000 },
  { name: 'Thu', revenue: 50000 },
  { name: 'Fri', revenue: 48000 },
  { name: 'Sat', revenue: 55000 },
  { name: 'Sun', revenue: 52000 },
];

export function RevenueChart({ isLoading }: { isLoading: boolean }) {
  if (isLoading) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-64"></div>;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-medium text-gray-400">Revenue Radar</h3>
        <div className="text-right">
          <div className="text-xl font-semibold text-white">₹3,32,000</div>
          <div className="text-xs text-emerald-500">+12.5% this week</div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide />
            <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CashFlowStatus({ isLoading }: { isLoading: boolean }) {
  if (isLoading) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-64"></div>;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
      <h3 className="text-xs font-medium text-gray-400 flex items-center gap-2 mb-6">
        <Wallet className="w-4 h-4" /> Cash Flow AI
      </h3>
      
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">Inflow (30d)</span>
            <span className="text-emerald-500">₹4,20,000</span>
          </div>
          <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[75%]"></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">Outflow (30d)</span>
            <span className="text-red-500">₹2,80,000</span>
          </div>
          <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-[45%]"></div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="text-xs text-gray-500 mb-1">AI Prediction</div>
          <div className="text-sm text-gray-200">Cash reserves sufficient for <span className="text-white font-semibold">4.2 months</span> of runway.</div>
        </div>
      </div>
    </div>
  );
}

export function AIInsightsFeed({ insights, isLoading }: { insights: any[], isLoading: boolean }) {
  if (isLoading) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-80"></div>;
  if (!insights?.length) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 text-gray-500">No insights available.</div>;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
      <h3 className="text-xs font-medium text-gray-400 flex items-center gap-2 mb-6">
        <Zap className="w-4 h-4 text-blue-500" /> AI Insights Feed
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
        {insights.map((insight, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#1a1a1a] border border-white/5 hover:border-white/10 transition-colors">
            <p className="text-sm text-gray-300 mb-3">{insight.text}</p>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
              <span className="text-gray-500">Source: {insight.source}</span>
              <span className="text-blue-500">{insight.confidence} Confidence</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SimulationLab({ isLoading }: { isLoading: boolean }) {
  if (isLoading) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-80"></div>;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
      <h3 className="text-xs font-medium text-gray-400 flex items-center gap-2 mb-6">
        <FlaskConical className="w-4 h-4 text-purple-500" /> Business Simulation Lab
      </h3>
      
      <div className="flex-1 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-5">
          <div>
            <label className="block text-xs text-gray-500 mb-2">Scenario</label>
            <select className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50">
              <option>Open New Store</option>
              <option>Increase Product Price</option>
              <option>Increase Marketing Spend</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-2">Investment Budget</label>
            <input type="range" className="w-full accent-purple-500" />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>₹1L</span>
              <span>₹15L</span>
              <span>₹50L</span>
            </div>
          </div>
          
          <button className="w-full py-2 bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Play className="w-4 h-4" /> Run Simulation
          </button>
        </div>
        
        <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex flex-col justify-center space-y-4">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Revenue Impact</div>
            <div className="text-lg text-emerald-500 font-medium">+₹3,20,000/mo</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Break-even Time</div>
            <div className="text-lg text-white font-medium">14 Months</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Risk Level</div>
            <div className="text-sm text-yellow-500 font-medium">Medium</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompetitorDashboard({ isLoading }: { isLoading: boolean }) {
  if (isLoading) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-64"></div>;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
      <h3 className="text-xs font-medium text-gray-400 flex items-center gap-2 mb-6">
        <Crosshair className="w-4 h-4 text-orange-500" /> Competitor War Room
      </h3>
      
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-sm text-white font-medium">Competitor A</div>
            <div className="text-xs text-gray-500 mt-1">Price: ₹110 (You: ₹120)</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-orange-500 uppercase tracking-wider bg-orange-500/10 px-2 py-1 rounded">Promotion Active</div>
          </div>
        </div>
        
        <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-sm text-white font-medium">Market Share</div>
            <div className="text-xs text-gray-500 mt-1">You: 42% | Comp A: 37%</div>
          </div>
          <div className="w-16 h-1.5 bg-[#222] rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 w-[42%]"></div>
            <div className="h-full bg-orange-500 w-[37%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertPanel({ alerts, isLoading }: { alerts: any[], isLoading: boolean }) {
  if (isLoading) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-64"></div>;
  if (!alerts?.length) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 text-gray-500">No alerts.</div>;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
      <h3 className="text-xs font-medium text-gray-400 flex items-center gap-2 mb-6">
        <AlertTriangle className="w-4 h-4 text-red-500" /> Smart Alerts
      </h3>
      
      <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide">
        {alerts.map((alert, i) => (
          <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${
            alert.severity === 'Critical' ? 'bg-red-500/10 border-red-500/20' :
            alert.severity === 'High' ? 'bg-orange-500/10 border-orange-500/20' :
            'bg-yellow-500/10 border-yellow-500/20'
          }`}>
            <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
              alert.severity === 'Critical' ? 'text-red-500 animate-pulse' :
              alert.severity === 'High' ? 'text-orange-500' :
              'text-yellow-500'
            }`} />
            <div>
              <h4 className={`text-sm font-medium ${
                alert.severity === 'Critical' ? 'text-red-500' :
                alert.severity === 'High' ? 'text-orange-500' :
                'text-yellow-500'
              }`}>{alert.title}</h4>
              <p className="text-xs text-gray-400 mt-1">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecommendationPanel({ recommendations, isLoading }: { recommendations: any[], isLoading: boolean }) {
  if (isLoading) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-64"></div>;
  if (!recommendations?.length) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 text-gray-500">No recommendations.</div>;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
      <h3 className="text-xs font-medium text-gray-400 flex items-center gap-2 mb-6">
        <Lightbulb className="w-4 h-4 text-emerald-500" /> AI Recommendations
      </h3>
      
      <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide">
        {recommendations.map((rec, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#1a1a1a] border border-white/5 hover:border-emerald-500/30 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm text-white font-medium group-hover:text-emerald-400 transition-colors">{rec.title}</h4>
              <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">{rec.impact}</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{rec.confidence} Confidence</span>
              <div className="text-xs text-emerald-500 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {rec.action} <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIDecisionEngine({ actions, isLoading }: { actions: any[], isLoading: boolean }) {
  if (isLoading) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-64"></div>;
  if (!actions?.length) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 text-gray-500">No actions.</div>;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <h3 className="text-xs font-medium text-gray-400 flex items-center gap-2 mb-6 relative z-10">
        <Zap className="w-4 h-4 text-blue-500" /> AI Decision Engine
      </h3>
      <div className="text-sm font-semibold text-white mb-4 relative z-10">Top Actions Today</div>
      <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide relative z-10">
        {actions.map((action, i) => (
          <div key={i} className="p-3 rounded-xl bg-[#1a1a1a] border border-white/5 flex items-start gap-3 group hover:border-blue-500/30 transition-colors cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500/20 transition-colors">
              <span className="text-xs font-bold text-blue-500">{i + 1}</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{action}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompanyDataBrain({ isLoading }: { isLoading: boolean }) {
  if (isLoading) return <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 animate-pulse h-64"></div>;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <h3 className="text-xs font-medium text-gray-400 flex items-center gap-2 mb-6 relative z-10">
        <Database className="w-4 h-4 text-purple-500" /> Company Data Brain
      </h3>
      
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="space-y-4">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Active Inputs</div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300">Sales Records</span>
              <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300">Bank Txns</span>
              <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300">Inventory</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Learning Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-500 font-medium">Continuously Syncing</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Generated Outputs</div>
          <div className="p-2 rounded-lg bg-[#1a1a1a] border border-white/5 text-xs text-gray-300 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Trend Detection
          </div>
          <div className="p-2 rounded-lg bg-[#1a1a1a] border border-white/5 text-xs text-gray-300 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-red-500" /> Risk Prediction
          </div>
          <div className="p-2 rounded-lg bg-[#1a1a1a] border border-white/5 text-xs text-gray-300 flex items-center gap-2">
            <Lightbulb className="w-3 h-3 text-yellow-500" /> Business Insights
          </div>
        </div>
      </div>
    </div>
  );
}
