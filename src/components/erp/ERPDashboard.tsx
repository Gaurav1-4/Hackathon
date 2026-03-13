import React, { useState } from 'react';
import { LayoutDashboard, FileText, BarChart2, MessageCircle, Users, Package, ShoppingCart, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountingLedger } from './AccountingLedger';
import { BIDashboard } from './BIDashboard';
import { WhatsAppAutomation } from './WhatsAppAutomation';
import { DemandForecasting } from './DemandForecasting';

export function ERPDashboard() {
  const [activeTab, setActiveTab] = useState('bi-dashboard');

  const tabs = [
    { id: 'bi-dashboard', label: 'BI Dashboard', icon: BarChart2 },
    { id: 'forecast', label: 'AI Forecasting', icon: BrainCircuit },
    { id: 'accounting', label: 'Tally Accounting', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales & CRM', icon: ShoppingCart },
    { id: 'hr', label: 'Employees', icon: Users },
    { id: 'whatsapp', label: 'WhatsApp Automations', icon: MessageCircle },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden text-gray-200">
      {/* Top Navigation for ERP */}
      <div className="flex-shrink-0 border-b border-white/10 bg-[#111111] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ERP & BI System</h1>
            <p className="text-xs text-gray-400">Integrated Business Management Platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-lg border border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'bi-dashboard' && <BIDashboard />}
        {activeTab === 'forecast' && <DemandForecasting />}
        {activeTab === 'accounting' && <AccountingLedger />}
        {activeTab === 'inventory' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-semibold text-gray-300">Inventory Management</h2>
              <p className="mt-2">Module under construction. Will include stock tracking, low-stock alerts, and supplier management.</p>
            </div>
          </div>
        )}
        {activeTab === 'sales' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-semibold text-gray-300">Sales & CRM</h2>
              <p className="mt-2">Module under construction. Will include lead tracking, sales pipeline, and customer history.</p>
            </div>
          </div>
        )}
        {activeTab === 'hr' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-semibold text-gray-300">Employee Management</h2>
              <p className="mt-2">Module under construction. Will include payroll, attendance, and performance tracking.</p>
            </div>
          </div>
        )}
        {activeTab === 'whatsapp' && <WhatsAppAutomation />}
      </div>
    </div>
  );
}
