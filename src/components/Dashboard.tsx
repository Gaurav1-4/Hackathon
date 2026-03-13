import { useState, useEffect } from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { io } from 'socket.io-client';
import { TaskCalendar } from './TaskCalendar';

const revenueData = [
  { name: 'Jan', revenue: 4000, competitor: 2400 },
  { name: 'Feb', revenue: 3000, competitor: 1398 },
  { name: 'Mar', revenue: 2000, competitor: 9800 },
  { name: 'Apr', revenue: 2780, competitor: 3908 },
  { name: 'May', revenue: 1890, competitor: 4800 },
  { name: 'Jun', revenue: 2390, competitor: 3800 },
  { name: 'Jul', revenue: 3490, competitor: 4300 },
];

const marginData = [
  { name: 'Q1', margin: 38 },
  { name: 'Q2', margin: 42 },
  { name: 'Q3', margin: 41 },
  { name: 'Q4', margin: 45 },
];

export function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Initial fetch
    setData({
      revenueGrowth: "+24.5%",
      revenueStatus: "strong",
      profitMargin: "18.2%",
      profitStatus: "strong",
      marketShare: "32%",
      marketStatus: "moderate",
      debtRatio: "1.2x",
      debtStatus: "risk",
      risk: {
        inventory: "Medium",
        marketShare: "High",
        cashFlow: "Low"
      }
    });

    // Connect to WebSocket for real-time updates
    const socket = io();

    socket.on('kpi_update', (newData) => {
      setData((prev: any) => ({
        ...prev,
        ...newData
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-emerald-500">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === 'strong') return 'text-emerald-500 bg-emerald-500';
    if (status === 'moderate') return 'text-amber-500 bg-amber-500';
    if (status === 'risk') return 'text-red-500 bg-red-500';
    return 'text-gray-500 bg-gray-500';
  };

  const getStatusTextColor = (status: string) => {
    if (status === 'strong') return 'text-emerald-500';
    if (status === 'moderate') return 'text-amber-500';
    if (status === 'risk') return 'text-red-500';
    return 'text-gray-500';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'strong') return 'Strong';
    if (status === 'moderate') return 'Moderate';
    if (status === 'risk') return 'High Risk';
    return 'Unknown';
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#0f0f0f]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Executive Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time business intelligence and competitive overview.</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Growth */}
          <div className="bg-[#171717] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(data.revenueStatus).split(' ')[1]}`} />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Revenue Growth</span>
              <TrendingUp className={`w-5 h-5 ${getStatusTextColor(data.revenueStatus)}`} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{data.revenueGrowth}</span>
            </div>
            <p className={`text-sm mt-4 flex items-center gap-1 ${getStatusTextColor(data.revenueStatus)}`}>
              <ArrowUpRight className="w-4 h-4" /> {getStatusLabel(data.revenueStatus)}
            </p>
          </div>

          {/* Profit Margin */}
          <div className="bg-[#171717] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(data.profitStatus).split(' ')[1]}`} />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Profit Margin</span>
              <Target className={`w-5 h-5 ${getStatusTextColor(data.profitStatus)}`} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{data.profitMargin}</span>
            </div>
            <p className={`text-sm mt-4 flex items-center gap-1 ${getStatusTextColor(data.profitStatus)}`}>
              <ArrowUpRight className="w-4 h-4" /> {getStatusLabel(data.profitStatus)}
            </p>
          </div>

          {/* Market Share */}
          <div className="bg-[#171717] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(data.marketStatus).split(' ')[1]}`} />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Market Share</span>
              <Activity className={`w-5 h-5 ${getStatusTextColor(data.marketStatus)}`} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{data.marketShare}</span>
            </div>
            <p className={`text-sm mt-4 flex items-center gap-1 ${getStatusTextColor(data.marketStatus)}`}>
              <ArrowUpRight className="w-4 h-4" /> {getStatusLabel(data.marketStatus)}
            </p>
          </div>

          {/* Debt Ratio */}
          <div className="bg-[#171717] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(data.debtStatus).split(' ')[1]}`} />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Debt Ratio</span>
              <AlertTriangle className={`w-5 h-5 ${getStatusTextColor(data.debtStatus)}`} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{data.debtRatio}</span>
            </div>
            <p className={`text-sm mt-4 flex items-center gap-1 ${getStatusTextColor(data.debtStatus)}`}>
              <ArrowDownRight className="w-4 h-4" /> {getStatusLabel(data.debtStatus)}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#171717] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Revenue vs Competitor</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '14px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="competitor" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#171717] rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Profit Margin Trend</span>
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '14px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: '#222' }}
                  />
                  <Bar dataKey="margin" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-[#171717] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Risk Assessment</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#212121] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Inventory Turnover</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">{data.risk.inventory}</span>
            </div>
            <div className="bg-[#212121] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Market Share Erosion</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20">{data.risk.marketShare}</span>
            </div>
            <div className="bg-[#212121] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-gray-300">Cash Flow</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{data.risk.cashFlow}</span>
            </div>
          </div>
        </div>

        {/* Task Calendar */}
        <TaskCalendar />

      </div>
    </div>
  );
}
