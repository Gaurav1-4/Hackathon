import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { BrainCircuit, TrendingUp, AlertCircle, Calendar, Download, RefreshCw } from 'lucide-react';

const forecastData = [
  { date: 'Mar 08', actual: 120, predicted: null },
  { date: 'Mar 09', actual: 132, predicted: null },
  { date: 'Mar 10', actual: 101, predicted: null },
  { date: 'Mar 11', actual: 145, predicted: null },
  { date: 'Mar 12', actual: 150, predicted: null },
  { date: 'Mar 13', actual: 142, predicted: 140 }, // Today
  { date: 'Mar 14', actual: null, predicted: 155 },
  { date: 'Mar 15', actual: null, predicted: 168 },
  { date: 'Mar 16', actual: null, predicted: 160 },
  { date: 'Mar 17', actual: null, predicted: 175 },
  { date: 'Mar 18', actual: null, predicted: 182 },
];

const featureImportance = [
  { feature: 'Historical Sales (Lag 7)', importance: 0.35 },
  { feature: 'Day of Week', importance: 0.22 },
  { feature: 'Active Promotions', importance: 0.18 },
  { feature: 'Price Changes', importance: 0.15 },
  { feature: 'Holiday Flag', importance: 0.10 },
];

export function DemandForecasting() {
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  const [isPredicting, setIsPredicting] = useState(false);

  const runPrediction = () => {
    setIsPredicting(true);
    setTimeout(() => setIsPredicting(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#111111] p-4 rounded-xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-500" />
            AI Demand Forecasting
          </h2>
          <p className="text-sm text-gray-400 mt-1">Powered by XGBoost Machine Learning Model</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="bg-[#1a1c23] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-purple-500 outline-none"
          >
            <option>All Products</option>
            <option>Electronics Category</option>
            <option>Product A (SKU-001)</option>
            <option>Product B (SKU-002)</option>
          </select>
          <button 
            onClick={runPrediction}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isPredicting ? 'animate-spin' : ''}`} /> 
            {isPredicting ? 'Running Model...' : 'Run Inference'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Forecast Chart */}
        <div className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-xl p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">7-Day Sales Forecast</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-gray-400"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Actual Sales</span>
              <span className="flex items-center gap-1 text-gray-400"><div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-dashed border-purple-500 bg-transparent"></div> Predicted (XGBoost)</span>
            </div>
          </div>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Actual Sales" />
                <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#a855f7' }} name="AI Prediction" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Insights & Feature Importance */}
        <div className="space-y-6">
          {/* Alert Card */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <h4 className="text-purple-100 font-medium">High Demand Expected</h4>
                <p className="text-sm text-purple-300/80 mt-1">
                  Model predicts a <strong>22% increase</strong> in sales over the next 3 days due to upcoming weekend promotions. Recommend increasing inventory for SKU-001.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Importance Chart */}
          <div className="bg-[#111111] border border-white/5 rounded-xl p-5 flex flex-col h-[230px]">
            <h3 className="font-semibold text-white mb-4 text-sm">Model Feature Importance (SHAP)</h3>
            <div className="flex-1 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureImportance} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="feature" type="category" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: '#1f2937', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="importance" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={12} name="Impact Weight" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
