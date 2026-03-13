import React, { useState, useEffect, useRef } from 'react';
import { Upload, RefreshCw, BrainCircuit, Mic, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CEOBriefPanel, 
  BusinessHealthScore, 
  RevenueChart, 
  CashFlowStatus, 
  AIInsightsFeed, 
  SimulationLab, 
  CompetitorDashboard, 
  AlertPanel, 
  RecommendationPanel,
  AIDecisionEngine,
  CompanyDataBrain
} from './pbs/components';

export function PersonalBusinessSpace() {
  const [hasData, setHasData] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Voice Command State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'analyzing' | 'executing' | 'ready'>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  
  // Loading states for lazy loading
  const [loadingStates, setLoadingStates] = useState({
    brief: true,
    health: true,
    revenue: true,
    insights: true,
    alerts: true,
    recommendations: true,
    competitors: true,
    simulation: true,
    actions: true,
    dataBrain: true
  });

  const [businessData, setBusinessData] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.pdf')) {
      setUploadError("Unable to process file. Please check format. Only CSV, XLSX, or PDF are supported.");
      return;
    }
    
    // Validate file size (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploadError('');
    setIsUploading(true);
    
    // Simulate backend processing
    setTimeout(() => {
      setIsUploading(false);
      setHasData(true);
      
      // Mock structured JSON from backend
      setBusinessData({
        revenue: 52000,
        expenses: 31000,
        profit: 21000,
        healthScore: 82,
        alerts: [
          { title: 'Inventory shortage risk', message: 'Rice stock will run out in 3 days.', severity: 'High' },
          { title: 'Cash flow warning', message: 'Supplier payments rising.', severity: 'Medium' },
          { title: 'Competitor price drop', message: 'Competitor reduced price by 6%.', severity: 'Medium' },
        ],
        recommendations: [
          { title: 'Increase stock of rice', impact: '+9% Revenue', confidence: 'High', action: 'Restock Now' },
          { title: 'Run weekend promotion', impact: '+14% Sales', confidence: 'Medium', action: 'Create Campaign' },
          { title: 'Reduce supplier cost', impact: 'Save ₹8k/mo', confidence: 'High', action: 'Review Contracts' },
        ],
        insights: [
          { text: 'Sales increased 14% this week', source: 'Sales Data', confidence: 'High' },
          { text: 'Cooking oil demand rising', source: 'Inventory Data', confidence: 'High' },
          { text: 'Transport costs increased 8%', source: 'Expense Data', confidence: 'Medium' },
          { text: 'Weekend demand expected to spike', source: 'Market Trends', confidence: 'Medium' },
        ],
        actions: [
          'Restock Rice inventory',
          'Increase cooking oil stock',
          'Launch weekend promotion'
        ]
      });

      // Simulate lazy loading of components
      setTimeout(() => setLoadingStates(prev => ({ ...prev, brief: false })), 500);
      setTimeout(() => setLoadingStates(prev => ({ ...prev, health: false, revenue: false })), 1000);
      setTimeout(() => setLoadingStates(prev => ({ ...prev, insights: false, simulation: false })), 1500);
      setTimeout(() => setLoadingStates(prev => ({ ...prev, alerts: false, recommendations: false, competitors: false, actions: false, dataBrain: false })), 2000);
      
    }, 2000);
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startFallbackVoiceCommand = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          try {
            const { transcribeAudio } = await import('@/services/geminiService');
            const text = await transcribeAudio(base64data, mimeType);
            if (text) {
              setVoiceTranscript(text);
              processVoiceCommand(text);
            } else {
              setIsVoiceActive(false);
              setVoiceState('idle');
            }
          } catch (e) {
            console.error("Transcription failed", e);
            setIsVoiceActive(false);
            setVoiceState('idle');
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      
      // Stop recording after 5 seconds for fallback
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);
      
    } catch (err) {
      console.error("Microphone access denied", err);
      setIsVoiceActive(false);
      setVoiceState('idle');
    }
  };

  const startVoiceCommand = () => {
    setIsVoiceActive(true);
    setVoiceState('listening');
    setVoiceTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      startFallbackVoiceCommand();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setVoiceTranscript(finalTranscript);
        processVoiceCommand(finalTranscript);
      } else {
        setVoiceTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'network' || event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        recognition.stop();
        startFallbackVoiceCommand();
      } else {
        setVoiceState('idle');
        setIsVoiceActive(false);
      }
    };

    recognition.onend = () => {
      setVoiceState(prev => {
        if (prev === 'listening' && !voiceTranscript) {
          setIsVoiceActive(false);
          return 'idle';
        }
        return prev;
      });
    };

    try {
      recognition.start();
    } catch (e) {
      startFallbackVoiceCommand();
    }
  };

  const processVoiceCommand = (command: string) => {
    setVoiceState('analyzing');
    
    // Simulate AI Intent Detection and Processing
    setTimeout(() => {
      setVoiceState('executing');
      
      setTimeout(() => {
        setVoiceState('ready');
        
        // Auto-close after showing ready state
        setTimeout(() => {
          setIsVoiceActive(false);
          setVoiceState('idle');
        }, 3000);
      }, 1500);
    }, 1500);
  };

  const stopVoiceCommand = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsVoiceActive(false);
    setVoiceState('idle');
  };

  if (!hasData) {
    return (
      <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a] flex flex-col items-center justify-center min-h-full relative">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BrainCircuit className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Personal Business Space</h1>
          <p className="text-gray-400 text-sm">
            Upload your company data (financial reports, Excel sheets, invoices, POS data) to generate your personalized AI business command center.
          </p>
          
          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
              {uploadError}
            </div>
          )}
          
          <label className="relative cursor-pointer bg-[#111111] hover:bg-[#1a1a1a] text-white px-6 py-8 rounded-2xl font-medium transition-colors flex flex-col items-center justify-center gap-4 w-full border border-white/10 hover:border-emerald-500/50 group">
            {isUploading ? (
              <>
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="text-emerald-500">Analyzing your business data...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <span>Upload Business Data</span>
                <span className="text-xs text-gray-500 font-normal">Supports .xlsx, .csv, .pdf (Max 10MB)</span>
              </>
            )}
            <input type="file" className="hidden" accept=".csv,.xlsx,.xls,.pdf" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] text-gray-200 p-6 md:p-8 relative">
      
      {/* Voice Command Overlay */}
      {isVoiceActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
            <button 
              onClick={stopVoiceCommand}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
                voiceState === 'listening' ? "bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.4)]" :
                voiceState === 'analyzing' ? "bg-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.4)]" :
                voiceState === 'executing' ? "bg-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.4)]" :
                voiceState === 'ready' ? "bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.4)]" :
                "bg-gray-800"
              )}>
                <Mic className={cn(
                  "w-10 h-10 transition-colors duration-500",
                  voiceState === 'listening' ? "text-emerald-500 animate-pulse" :
                  voiceState === 'analyzing' ? "text-blue-500" :
                  voiceState === 'executing' ? "text-purple-500" :
                  voiceState === 'ready' ? "text-emerald-500" :
                  "text-gray-400"
                )} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white capitalize tracking-wide">
                  {voiceState}...
                </h2>
                <p className="text-gray-400 min-h-[3rem] text-lg">
                  {voiceTranscript || "Listening for command..."}
                </p>
              </div>
              
              {/* Waveform visualizer simulation */}
              <div className="flex items-center justify-center gap-1 h-12">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1.5 rounded-full transition-all duration-150",
                      voiceState === 'listening' ? "bg-emerald-500 animate-pulse" :
                      voiceState === 'analyzing' ? "bg-blue-500 animate-bounce" :
                      voiceState === 'executing' ? "bg-purple-500 animate-pulse" :
                      voiceState === 'ready' ? "bg-emerald-500 h-2" :
                      "bg-gray-700 h-1"
                    )}
                    style={{ 
                      height: voiceState === 'listening' ? `${Math.random() * 100 + 20}%` : undefined,
                      animationDelay: `${i * 0.1}s` 
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-emerald-500" />
              Personal Business Space
            </h1>
            <p className="text-sm text-gray-400 mt-1">AI Business Command Center</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#111111] px-3 py-1.5 rounded-lg border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-500">AI Active</span>
            </div>
            <button 
              onClick={startVoiceCommand}
              className="bg-[#111111] hover:bg-[#1a1a1a] border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 group"
            >
              <Mic className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
              Voice Command
            </button>
          </div>
        </div>

        {/* Top Section: CEO Daily Brief */}
        <CEOBriefPanel data={businessData} isLoading={loadingStates.brief} />

        {/* Second Section: Business Health + Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <BusinessHealthScore score={businessData?.healthScore} isLoading={loadingStates.health} />
          </div>
          <div className="md:col-span-1">
            <RevenueChart isLoading={loadingStates.revenue} />
          </div>
          <div className="md:col-span-1">
            <CashFlowStatus isLoading={loadingStates.revenue} />
          </div>
        </div>

        {/* Third Section: AI Insights Feed and Simulation Lab */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AIInsightsFeed insights={businessData?.insights} isLoading={loadingStates.insights} />
          </div>
          <div className="lg:col-span-2">
            <SimulationLab isLoading={loadingStates.simulation} />
          </div>
        </div>

        {/* Fourth Section: Competitor War Room + Alerts + Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CompetitorDashboard isLoading={loadingStates.competitors} />
          <AlertPanel alerts={businessData?.alerts} isLoading={loadingStates.alerts} />
          <RecommendationPanel recommendations={businessData?.recommendations} isLoading={loadingStates.recommendations} />
        </div>

        {/* Fifth Section: AI Decision Engine + Company Data Brain */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AIDecisionEngine actions={businessData?.actions} isLoading={loadingStates.actions} />
          <CompanyDataBrain isLoading={loadingStates.dataBrain} />
        </div>

      </div>
    </div>
  );
}
