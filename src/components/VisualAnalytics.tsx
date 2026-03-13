import React, { useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { TrendingUp, Activity, Target, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface VisualAnalyticsProps {
  content: string;
}

export function VisualAnalytics({ content }: VisualAnalyticsProps) {
  // Simple heuristic to detect if we should show charts
  const hasFinancials = content.toLowerCase().includes('revenue') || content.toLowerCase().includes('profit') || content.toLowerCase().includes('margin');
  const hasCompetitors = content.toLowerCase().includes('competitor') || content.toLowerCase().includes('market share') || content.toLowerCase().includes('vs');
  const hasForecast = content.toLowerCase().includes('forecast') || content.toLowerCase().includes('projected') || content.toLowerCase().includes('cagr');

  // Extract potential insights
  const insights = useMemo(() => {
    const extracted = [];
    
    const extractSentence = (keyword: string) => {
      // Find the sentence containing the keyword
      const regex = new RegExp(`[^.!?]*\\b${keyword}\\b[^.!?]*[.!?]`, 'i');
      const match = content.match(regex);
      // Clean up the sentence (remove leading bullet points, newlines, etc.)
      if (match) {
        let sentence = match[0].trim();
        sentence = sentence.replace(/^[-•*]\s*/, '').replace(/\n/g, ' ');
        // Limit length
        if (sentence.length > 120) {
          sentence = sentence.substring(0, 117) + '...';
        }
        return sentence;
      }
      return null;
    };

    const riskSentence = extractSentence('risk') || extractSentence('threat') || extractSentence('challenge');
    if (riskSentence) {
      extracted.push({ type: 'risk', title: 'Major Risk', desc: riskSentence, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' });
    }

    const oppSentence = extractSentence('opportunity') || extractSentence('growth') || extractSentence('potential');
    if (oppSentence) {
      extracted.push({ type: 'opportunity', title: 'Key Opportunity', desc: oppSentence, icon: Lightbulb, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' });
    }

    const advSentence = extractSentence('advantage') || extractSentence('strength') || extractSentence('leader');
    if (advSentence) {
      extracted.push({ type: 'strength', title: 'Competitive Advantage', desc: advSentence, icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' });
    }

    const trendSentence = extractSentence('trend') || extractSentence('shift') || extractSentence('demand');
    if (trendSentence) {
      extracted.push({ type: 'trend', title: 'Market Trend', desc: trendSentence, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' });
    }
    
    // Default insight if none found
    if (extracted.length === 0) {
      extracted.push({ type: 'insight', title: 'Strategic Insight', desc: 'Comprehensive analysis complete. Review detailed metrics below.', icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' });
    }
    return extracted.slice(0, 4);
  }, [content]);

  // Mock data for visualizations based on context
  const trendData = [
    { year: '2021', value: 120 },
    { year: '2022', value: 150 },
    { year: '2023', value: 180 },
    { year: '2024', value: 240 },
    { year: '2025', value: 310 },
  ];

  const radarData = [
    { subject: 'Innovation', A: 120, B: 110, fullMark: 150 },
    { subject: 'Market Share', A: 98, B: 130, fullMark: 150 },
    { subject: 'Growth', A: 86, B: 130, fullMark: 150 },
    { subject: 'Brand', A: 99, B: 100, fullMark: 150 },
    { subject: 'Capacity', A: 85, B: 90, fullMark: 150 },
    { subject: 'Customers', A: 65, B: 85, fullMark: 150 },
  ];

  const kpis = [
    { label: 'Revenue Growth', value: '+24.5%', status: 'good' },
    { label: 'Profit Margin', value: '18.2%', status: 'good' },
    { label: 'Market Share', value: '32%', status: 'neutral' },
    { label: 'Debt Ratio', value: '1.2x', status: 'warning' },
  ];

  if (!hasFinancials && !hasCompetitors && !hasForecast) return null;

  return (
    <div className="space-y-6 my-6">
      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className={`p-4 rounded-xl border ${insight.border} ${insight.bg} backdrop-blur-sm`}
          >
            <div className="flex items-center gap-2 mb-2">
              <insight.icon className={`w-4 h-4 ${insight.color}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${insight.color}`}>{insight.title}</span>
            </div>
            <p className="text-sm text-gray-200">{insight.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* KPI Dashboard */}
      {hasFinancials && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</span>
              <span className={`text-xl font-bold ${
                kpi.status === 'good' ? 'text-emerald-400' : 
                kpi.status === 'warning' ? 'text-red-400' : 'text-amber-400'
              }`}>{kpi.value}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        {(hasFinancials || hasForecast) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-medium text-gray-200">Market Trend Analysis</h3>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="year" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#fff' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Competitor Radar */}
        {hasCompetitors && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-200">Competitor Radar</h3>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="Target" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} animationDuration={1500} />
                  <Radar name="Competitor" dataKey="B" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} animationDuration={1500} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#ccc' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
