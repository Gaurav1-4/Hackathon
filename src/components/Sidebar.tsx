import { MessageSquare, BarChart2, TrendingUp, Cpu, Bot, Database, LayoutDashboard, Activity, Settings, X, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { icon: MessageSquare, label: 'Chat Intelligence' },
  { icon: Briefcase, label: 'Personal Business Space' },
  { icon: LayoutDashboard, label: 'ERP & BI System' },
  { icon: BarChart2, label: 'Competitive Analysis' },
  { icon: TrendingUp, label: 'Financial Forecasting' },
  { icon: Cpu, label: 'Strategy Simulator' },
  { icon: Bot, label: 'Agent Builder' },
  { icon: Database, label: 'Data Connectors' },
  { icon: LayoutDashboard, label: 'Dashboard' },
];

const bottomItems = [
  { icon: Activity, label: 'Usage' },
  { icon: Settings, label: 'Settings' },
];

export function Sidebar({ activePage, setActivePage }: { activePage: string, setActivePage: (page: string) => void }) {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <div className="w-[260px] bg-[#171717] flex-shrink-0 flex flex-col h-full border-r border-white/5 relative">
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-wide text-gray-100">BharatMind</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item, i) => (
          <button
            key={i}
            onClick={() => setActivePage(item.label)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              activePage === item.label 
                ? "bg-[#212121] text-white font-medium" 
                : "text-gray-400 hover:bg-[#212121] hover:text-gray-200"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-white/5 space-y-1">
        {bottomItems.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              if (item.label === 'Settings') setOpenSettings(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-[#212121] hover:text-gray-200 transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {openSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <button onClick={() => setOpenSettings(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Workspace Name</label>
                <input type="text" defaultValue="Acme Corp Workspace" className="w-full bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                <select className="w-full bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50">
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                </select>
              </div>
              <button onClick={() => setOpenSettings(false)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition-colors mt-4">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
