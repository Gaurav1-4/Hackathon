import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Bot, FileText, Zap, Mic, X, Send, Paperclip, 
  ChevronRight, Activity, AlertTriangle, TrendingUp, Calendar, 
  Camera, Calculator, Database, Smartphone, Search, Bell, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateBusinessInsightStream, generateVoiceResponse } from '../services/geminiService';
import { ResearchMessage } from './ResearchMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'agents' | 'documents' | 'quick'>('chat');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Namaste! I am BharatMind AI. How can I assist your business today?' }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [alerts, setAlerts] = useState([
    "⚠️ GST due in 8 days — ₹23,400",
    "📈 Cotton prices up 4% today",
    "💰 Sharma Traders payment overdue"
  ]);

  const [runningWorkflow, setRunningWorkflow] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Preload Voice Engine
  useEffect(() => {
    const initVoiceEngine = () => {
      if ('speechSynthesis' in window) {
        // Load voices
        window.speechSynthesis.getVoices();
      }
      // Initialize AudioContext for potential future use or to unlock audio
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
        }
      }
    };
    
    initVoiceEngine();
    
    // Some browsers require voices to be loaded asynchronously
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = initVoiceEngine;
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-dismiss alerts
  useEffect(() => {
    if (alerts.length > 0) {
      const timer = setTimeout(() => {
        setAlerts(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isGenerating) return;
    
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const assistantMsgId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, newUserMsg, { id: assistantMsgId, role: 'assistant', content: '' }]);
    setInput('');
    setIsGenerating(true);
    setActiveTab('chat'); // Switch to chat if sent from Quick tab

    try {
      await generateBusinessInsightStream(text, 'Assistant', 'advanced', (chunk) => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: msg.content + chunk } : msg
        ));
      });
    } catch (error: any) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId ? { ...msg, content: error.message || 'Error connecting to AI engine.' } : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoicePressStart = () => {
    pressTimer.current = setTimeout(() => {
      setVoiceState('listening');
      startVoiceRecognition();
    }, 500);
  };

  const handleVoicePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startFallbackVoiceRecognition = async () => {
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
              setInput(text);
              handleVoiceQuery(text);
            } else {
              setVoiceState('idle');
            }
          } catch (e) {
            console.error("Transcription failed", e);
            setVoiceState('idle');
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setVoiceState('listening');
      
      // Stop recording after 5 seconds for fallback
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);
      
    } catch (err) {
      console.error("Microphone access denied", err);
      setVoiceState('idle');
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      startFallbackVoiceRecognition();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      finalTranscript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'network' || event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        recognition.stop();
        startFallbackVoiceRecognition();
      } else {
        setVoiceState('idle');
      }
    };

    recognition.onend = () => {
      if (finalTranscript.trim()) {
        handleVoiceQuery(finalTranscript);
      } else {
        setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      startFallbackVoiceRecognition();
    }
  };

  const handleVoiceQuery = async (text: string) => {
    setVoiceState('processing');
    setIsGenerating(true);
    
    // Ensure audio context is resumed on user interaction
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    try {
      const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
      setMessages(prev => [...prev, newUserMsg]);
      setInput('');

      const response = await generateVoiceResponse(text);

      const assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: response.text + (response.action_suggestion ? `\n\nSuggestion: ${response.action_suggestion}` : '')
      }]);

      setVoiceState('speaking');
      speakText(response.text, response.tts_code);
    } catch (error) {
      console.error("Voice processing error:", error);
      setVoiceState('idle');
      // Fallback: show text response if voice fails
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I encountered an error processing your voice request. Please try typing it."
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const speakText = (text: string, ttsCode: string) => {
    // Stop any previous audio
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ttsCode || 'en-IN';

    // Voice Language Mapping
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang === ttsCode);
    
    // Fallback logic for Indian languages if exact match not found
    if (!selectedVoice) {
      if (ttsCode.startsWith('hi')) selectedVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
      else if (ttsCode.startsWith('bn')) selectedVoice = voices.find(v => v.lang.includes('bn') || v.name.toLowerCase().includes('bengali'));
      else if (ttsCode.startsWith('ta')) selectedVoice = voices.find(v => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      else if (ttsCode.startsWith('te')) selectedVoice = voices.find(v => v.lang.includes('te') || v.name.toLowerCase().includes('telugu'));
      else if (ttsCode.startsWith('mr')) selectedVoice = voices.find(v => v.lang.includes('mr') || v.name.toLowerCase().includes('marathi'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setVoiceState('idle');
    };
    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      setVoiceState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setVoiceState('idle');
  };

  const runWorkflow = async (name: string, prompt: string) => {
    setRunningWorkflow(name);
    // Simulate workflow execution delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRunningWorkflow(null);
    handleSend(prompt);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // In a real app, we would upload the file and parse it here.
    // For now, we simulate the analysis by sending a prompt.
    handleSend(`I have uploaded a document named "${file.name}". Please analyze it and extract key business insights, GST implications, and risks.`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 assistant-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === 'user' 
                      ? "bg-[#ff4500] text-white rounded-br-sm" 
                      : "bg-[#1a1c23] text-gray-200 rounded-bl-sm border border-white/5 w-full"
                  )}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ResearchMessage content={msg.content} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-white/10 bg-[#080910]/90">
              <div className={cn(
                "flex items-end gap-2 bg-[#1a1c23] rounded-xl p-1.5 border transition-colors",
                voiceState === 'listening' ? "border-red-500/50 ring-1 ring-red-500/20" : "border-white/10 focus-within:border-[#ff4500]/50"
              )}>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={voiceState === 'listening'}
                  className="p-2 text-gray-400 hover:text-[#ff4500] transition-colors rounded-lg"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={voiceState === 'listening' ? "Listening..." : "Ask BharatMind..."}
                  className={cn(
                    "w-full bg-transparent text-sm resize-none outline-none py-2 max-h-32 assistant-scrollbar",
                    voiceState === 'listening' ? "text-red-400" : "text-gray-200"
                  )}
                  rows={1}
                  disabled={isGenerating || voiceState === 'listening'}
                />
                <button 
                  onClick={() => {
                    if (voiceState === 'listening') {
                      setVoiceState('idle');
                    } else {
                      setVoiceState('listening');
                      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                      if (!SpeechRecognition) {
                        startFallbackVoiceRecognition();
                        return;
                      }
                      const recognition = new SpeechRecognition();
                      recognition.lang = 'en-IN';
                      recognition.continuous = true;
                      recognition.interimResults = true;
                      
                      recognition.onresult = (event: any) => {
                        let finalTranscript = '';
                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                          if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                          }
                        }
                        if (finalTranscript) {
                          setInput(prev => {
                            const space = prev && !prev.endsWith(' ') ? ' ' : '';
                            return prev + space + finalTranscript;
                          });
                        }
                      };
                      
                      recognition.onerror = (event: any) => {
                        console.error("Speech recognition error", event.error);
                        if (event.error === 'network' || event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                          recognition.stop();
                          startFallbackVoiceRecognition();
                        } else {
                          setVoiceState('idle');
                        }
                      };

                      recognition.onend = () => {
                        setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
                      };
                      
                      try {
                        recognition.start();
                      } catch (e) {
                        startFallbackVoiceRecognition();
                      }
                    }
                  }}
                  disabled={isGenerating}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    voiceState === 'listening' 
                      ? "text-red-500 bg-red-500/10 hover:bg-red-500/20 animate-pulse" 
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  )}
                >
                  {voiceState === 'listening' ? <X className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isGenerating || voiceState === 'listening'}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    input.trim() && !isGenerating && voiceState !== 'listening' ? "bg-[#ff4500] text-white" : "text-gray-500 bg-white/5"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      case 'agents':
        return (
          <div className="p-4 space-y-4 overflow-y-auto h-full assistant-scrollbar">
            <h3 className="font-syne text-[#ff4500] text-sm uppercase tracking-wider font-bold mb-2">Agent Workflows</h3>
            
            {/* Workflow 1 */}
            <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-200">Invoice to Excel Pipeline</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">READY</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 overflow-x-auto pb-2 assistant-scrollbar">
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Camera className="w-3 h-3 text-[#ff4500]" /></div><span>Scan</span></div>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Calculator className="w-3 h-3 text-[#ff4500]" /></div><span>GST</span></div>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Database className="w-3 h-3 text-[#ff4500]" /></div><span>Ledger</span></div>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Smartphone className="w-3 h-3 text-[#ff4500]" /></div><span>Alert</span></div>
              </div>
              <button 
                onClick={() => runWorkflow('invoice', 'Run the Invoice to Excel Pipeline. Scan the latest invoice, calculate GST, add to ledger, and send WhatsApp alert.')}
                disabled={runningWorkflow === 'invoice'}
                className="w-full mt-2 py-1.5 bg-white/5 hover:bg-[#ff4500]/20 hover:text-[#ff4500] text-gray-300 text-xs rounded-lg transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {runningWorkflow === 'invoice' ? 'Running...' : 'Run Workflow'}
              </button>
            </div>

            {/* Workflow 2 */}
            <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-200">Daily Business Report</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">ACTIVE</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 overflow-x-auto pb-2 assistant-scrollbar">
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Calendar className="w-3 h-3 text-[#ff4500]" /></div><span>9 AM</span></div>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Activity className="w-3 h-3 text-[#ff4500]" /></div><span>Fetch</span></div>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Bot className="w-3 h-3 text-[#ff4500]" /></div><span>AI</span></div>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Smartphone className="w-3 h-3 text-[#ff4500]" /></div><span>Send</span></div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-gray-500">Runs every morning at 9 AM</p>
                <button 
                  onClick={() => runWorkflow('daily', 'Generate the Daily Business Report now.')}
                  disabled={runningWorkflow === 'daily'}
                  className="px-2 py-1 bg-white/5 hover:bg-[#ff4500]/20 hover:text-[#ff4500] text-gray-300 text-[10px] rounded transition-colors border border-white/5 disabled:opacity-50"
                >
                  {runningWorkflow === 'daily' ? 'Running...' : 'Run Now'}
                </button>
              </div>
            </div>

            {/* Workflow 3 */}
            <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-200">Competitor Monitor</span>
                <span className="text-[10px] bg-[#ff4500]/20 text-[#ff4500] px-2 py-0.5 rounded-full border border-[#ff4500]/30 animate-pulse">MONITORING</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 overflow-x-auto pb-2 assistant-scrollbar">
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Search className="w-3 h-3 text-[#ff4500]" /></div><span>Monitor</span></div>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><TrendingUp className="w-3 h-3 text-[#ff4500]" /></div><span>Detect</span></div>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Bot className="w-3 h-3 text-[#ff4500]" /></div><span>Strategy</span></div>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                <div className="flex flex-col items-center gap-1 shrink-0"><div className="bg-[#2a2d35] p-1.5 rounded-md"><Bell className="w-3 h-3 text-[#ff4500]" /></div><span>Alert</span></div>
              </div>
              <button 
                onClick={() => runWorkflow('competitor', 'Check competitor pricing and update strategy.')}
                disabled={runningWorkflow === 'competitor'}
                className="w-full mt-2 py-1.5 bg-white/5 hover:bg-[#ff4500]/20 hover:text-[#ff4500] text-gray-300 text-xs rounded-lg transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {runningWorkflow === 'competitor' ? 'Running...' : 'Force Check Now'}
              </button>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="p-4 h-full flex flex-col">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group",
                isDragging 
                  ? "border-[#ff4500] bg-[#ff4500]/10" 
                  : "border-white/20 hover:border-[#ff4500]/50 hover:bg-[#ff4500]/5"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
              />
              <div className={cn(
                "bg-[#1a1c23] p-3 rounded-full mb-3 transition-transform",
                isDragging ? "scale-110" : "group-hover:scale-110"
              )}>
                <FileText className="w-6 h-6 text-[#ff4500]" />
              </div>
              <p className="text-sm font-bold text-gray-200 mb-1">Drop PDF, Excel, Image, Invoice here</p>
              <p className="text-xs text-gray-500 mb-4">or click to browse</p>
              <div className="flex gap-2">
                {['PDF', 'Excel', 'Image', 'Invoice'].map(tag => (
                  <span key={tag} className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/10">{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Scans</h4>
              <div className="space-y-2">
                <div className="bg-[#1a1c23] p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-200">audit-2024.pdf</p>
                      <p className="text-[10px] text-gray-500">Analyzed 2 mins ago</p>
                    </div>
                  </div>
                  <button className="text-[10px] text-[#ff4500] hover:underline">View Report</button>
                </div>
                <div className="bg-[#1a1c23] p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs text-gray-200">sales-march.xlsx</p>
                      <p className="text-[10px] text-emerald-500">Health Score: 84</p>
                    </div>
                  </div>
                  <button className="text-[10px] text-[#ff4500] hover:underline">View Report</button>
                </div>
                <div className="bg-[#1a1c23] p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-200">invoice-sharma.jpg</p>
                      <p className="text-[10px] text-gray-500">GST: ₹4,320</p>
                    </div>
                  </div>
                  <button className="text-[10px] text-[#ff4500] hover:underline">View Report</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'quick':
        return (
          <div className="p-4 h-full flex flex-col">
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[
                { icon: Activity, label: "Health Score", prompt: "Show me the current business health score and key metrics." },
                { icon: TrendingUp, label: "Compare Rival", prompt: "Compare our performance against top competitors." },
                { icon: Calculator, label: "GST Calculate", prompt: "Help me calculate GST for a new transaction." },
                { icon: Search, label: "Market Research", prompt: "Provide a quick market research overview for our industry." },
                { icon: Calendar, label: "Festival Plan", prompt: "Create a marketing and sales plan for the upcoming festival." },
                { icon: Database, label: "MSME Loan", prompt: "What are the requirements for an MSME loan?" },
                { icon: FileSpreadsheet, label: "Make Excel", prompt: "generate excel report for this month's sales" },
                { icon: Zap, label: "Deep Research", prompt: "Conduct a deep research analysis on emerging market trends." }
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  className="bg-[#1a1c23] hover:bg-[#ff4500]/10 border border-white/5 hover:border-[#ff4500]/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all group"
                >
                  <action.icon className="w-5 h-5 text-gray-400 group-hover:text-[#ff4500] transition-colors" />
                  <span className="text-xs text-gray-300 font-medium text-center">{action.label}</span>
                </button>
              ))}
            </div>
            
            {/* Live Ticker */}
            <div className="mt-4 bg-[#1a1c23] border border-white/10 rounded-lg p-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="marquee-container text-xs font-mono text-gray-400">
                <div className="marquee-content">
                  Cotton ₹8,234/q <span className="text-emerald-500">↑</span> &nbsp;&nbsp;|&nbsp;&nbsp; 
                  GST Due: 8 days &nbsp;&nbsp;|&nbsp;&nbsp; 
                  Diwali: 43 days &nbsp;&nbsp;|&nbsp;&nbsp; 
                  SENSEX: 72,847 <span className="text-emerald-500">↑</span> &nbsp;&nbsp;|&nbsp;&nbsp;
                  Cotton ₹8,234/q <span className="text-emerald-500">↑</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Draggable logic for bubble (simplified fixed position for reliability, but visually draggable)
  // In a real app, we'd use framer-motion or a robust drag hook.

  return (
    <div className="fixed z-50 bottom-6 right-6 flex flex-col items-end">
      
      {/* Live Alerts Panel */}
      {!isOpen && alerts.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 items-end">
          {alerts.map((alert, i) => (
            <div key={i} className="bg-[#080910]/90 backdrop-blur-md border border-white/10 text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-300">
              {alert}
            </div>
          ))}
        </div>
      )}

      {/* Main Panel */}
      {isOpen && (
        <div className="mb-4 w-[420px] h-[600px] bg-[#080910]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff4500] to-orange-600 flex items-center justify-center font-syne font-bold text-white shadow-lg shadow-[#ff4500]/20">
                BM
              </div>
              <div>
                <h2 className="font-syne font-bold text-white text-sm">BharatMind</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-gray-400 font-medium">AI Assistant Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {[
              { id: 'chat', icon: MessageSquare, label: 'Chat' },
              { id: 'agents', icon: Bot, label: 'Agents' },
              { id: 'documents', icon: FileText, label: 'Documents' },
              { id: 'quick', icon: Zap, label: 'Quick' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2",
                  activeTab === tab.id 
                    ? "border-[#ff4500] text-[#ff4500]" 
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {renderTabContent()}
          </div>
        </div>
      )}

      {/* Floating Bubble */}
      <div className="relative group cursor-pointer">
        {/* Pulsing Rings */}
        <div className="absolute inset-0 rounded-full bg-[#ff4500] animate-pulse-ring pointer-events-none" />
        <div className="absolute inset-0 rounded-full bg-[#ff4500] animate-pulse-ring-delayed pointer-events-none" />
        
        {/* Bubble Button */}
        <button
          onMouseDown={handleVoicePressStart}
          onMouseUp={handleVoicePressEnd}
          onMouseLeave={handleVoicePressEnd}
          onClick={() => {
            if (voiceState === 'speaking') {
              stopSpeaking();
            } else if (voiceState === 'idle') {
              setIsOpen(!isOpen);
            }
          }}
          className={cn(
            "relative z-10 rounded-full bg-gradient-to-br from-[#ff4500] to-orange-600 flex items-center justify-center shadow-lg shadow-[#ff4500]/30 transition-all duration-300 border border-white/20",
            voiceState !== 'idle' ? "w-[120px] h-[120px]" : "w-16 h-16 hover:scale-105"
          )}
        >
          {voiceState !== 'idle' ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-1 h-10">
                {voiceState === 'listening' || voiceState === 'speaking' ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-white rounded-full waveform-bar" 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))
                ) : (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <span className="text-xs font-medium text-white font-syne capitalize">{voiceState}...</span>
            </div>
          ) : (
            <span className="font-syne font-bold text-2xl text-white">BM</span>
          )}
        </button>

        {/* Notification Dot */}
        {!isOpen && voiceState === 'idle' && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#080910] flex items-center justify-center z-20">
            <span className="text-[10px] font-bold text-white">3</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Dummy icon component for FileSpreadsheet since it might not be in the older lucide-react version
function FileSpreadsheet(props: any) {
  return <FileText {...props} />;
}
