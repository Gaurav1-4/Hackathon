import { ChevronDown, Paperclip, Globe, Building2, PanelRightOpen, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const modes = ['Research', 'Compare', 'Forecast', 'Simulate'];

export function TopNav({ toggleRightPanel }: { toggleRightPanel: () => void }) {
  const [activeMode, setActiveMode] = useState('Research');
  const [lang, setLang] = useState('EN');
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="h-14 border-b border-white/5 bg-[#0f0f0f] flex items-center justify-between px-4 flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors">
          <Building2 className="w-4 h-4 text-emerald-500" />
          <span>Acme Corp Workspace</span>
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-2" />

        <div className="flex items-center bg-[#1a1a1a] rounded-lg p-0.5 border border-white/5">
          {modes.map(mode => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                activeMode === mode 
                  ? "bg-[#2a2a2a] text-white shadow-sm" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors">
          <Paperclip className="w-4 h-4" />
          <span>Upload Data</span>
        </button>

        <button 
          onClick={() => setLang(l => l === 'EN' ? 'HI' : 'EN')}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{lang}</span>
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        <button 
          onClick={toggleRightPanel}
          className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-white/5 transition-colors"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="text-gray-400 hover:text-white ml-1 focus:outline-none"
          >
            <UserCircle className="w-6 h-6" />
          </button>
          
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-[#212121] border border-white/10 rounded-lg shadow-xl py-1 z-50">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">My Account</button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">Billing</button>
              <div className="h-px bg-white/10 my-1"></div>
              <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors">Logout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
