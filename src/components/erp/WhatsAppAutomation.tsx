import React, { useState } from 'react';
import { MessageCircle, Send, Clock, AlertTriangle, CheckCircle2, Settings, Smartphone } from 'lucide-react';

export function WhatsAppAutomation() {
  const [automations, setAutomations] = useState({
    dailyReport: true,
    inventoryAlerts: true,
    paymentReminders: false,
  });

  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');

  const toggleAutomation = (key: keyof typeof automations) => {
    setAutomations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#111111] p-4 rounded-xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-emerald-500" />
            WhatsApp Cloud API Integration
          </h2>
          <p className="text-sm text-gray-400 mt-1">Manage automated alerts and business reports via WhatsApp</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1c23] border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/5">
          <Settings className="w-4 h-4" /> API Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Active Automations</h3>
            
            <div className="space-y-4">
              {/* Daily Report */}
              <div className="flex items-center justify-between p-4 bg-[#1a1c23] rounded-lg border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 mt-1">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Daily Business Report</h4>
                    <p className="text-sm text-gray-400 mt-1">Sends a summary of sales, orders, and top products every evening at 8:00 PM.</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleAutomation('dailyReport')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${automations.dailyReport ? 'bg-emerald-500' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${automations.dailyReport ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Inventory Alerts */}
              <div className="flex items-center justify-between p-4 bg-[#1a1c23] rounded-lg border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 mt-1">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Low Inventory Alerts</h4>
                    <p className="text-sm text-gray-400 mt-1">Instant notification when a product's stock falls below the minimum threshold.</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleAutomation('inventoryAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${automations.inventoryAlerts ? 'bg-emerald-500' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${automations.inventoryAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Payment Reminders */}
              <div className="flex items-center justify-between p-4 bg-[#1a1c23] rounded-lg border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 mt-1">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Payment Reminders</h4>
                    <p className="text-sm text-gray-400 mt-1">Automated reminders to clients for pending invoices 2 days before due date.</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleAutomation('paymentReminders')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${automations.paymentReminders ? 'bg-emerald-500' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${automations.paymentReminders ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recipient Settings</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Admin WhatsApp Number</label>
                <div className="relative">
                  <Smartphone className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-[#1a1c23] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-gray-400" />
            Message Preview
          </h3>
          
          <div className="flex-1 bg-[url('https://raw.githubusercontent.com/tailwindtoolbox/WhatsApp-Clone/master/img/bg-chat.png')] bg-cover bg-center rounded-xl p-4 flex flex-col gap-4 overflow-y-auto border border-white/10 relative">
            <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
            
            {/* Mock Daily Report Message */}
            <div className="relative bg-[#202c33] text-white p-3 rounded-lg rounded-tl-none max-w-[90%] self-start shadow-sm">
              <div className="text-emerald-400 font-medium text-sm mb-1">BharatMind ERP</div>
              <p className="text-sm whitespace-pre-line">
                📊 *Daily Business Report*
                
                *Sales:* ₹34,200
                *Orders:* 52
                *Top Product:* Running Shoes
                
                *Low Stock Alert:*
                ⚠️ Product A (Only 5 left)
                
                _Generated by AI at 8:00 PM_
              </p>
              <div className="text-[10px] text-gray-400 text-right mt-1">8:00 PM</div>
            </div>

            {/* Mock Payment Reminder Message */}
            <div className="relative bg-[#005c4b] text-white p-3 rounded-lg rounded-tr-none max-w-[90%] self-end shadow-sm">
              <p className="text-sm whitespace-pre-line">
                💳 *Payment Reminder*
                
                Dear Client,
                Your invoice #INV-2026-042 for ₹15,000 is due tomorrow. 
                
                Please process the payment to avoid late fees.
              </p>
              <div className="text-[10px] text-emerald-200 text-right mt-1 flex items-center justify-end gap-1">
                8:05 PM <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 py-2.5 bg-[#1a1c23] hover:bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Send Test Message
          </button>
        </div>
      </div>
    </div>
  );
}
