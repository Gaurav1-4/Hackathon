import { Paperclip, Send, Mic, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function InputArea({ 
  onSendMessage, 
  isGenerating,
  tier,
  setTier
}: { 
  onSendMessage: (msg: string) => void, 
  isGenerating: boolean,
  tier: string,
  setTier: (tier: string) => void
}) {
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      onSendMessage(`I have uploaded a file: ${data.filename}. Please analyze it.`);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isFallbackRecording, setIsFallbackRecording] = useState(false);

  const startFallbackRecording = async () => {
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
              setInput(prev => {
                const space = prev && !prev.endsWith(' ') ? ' ' : '';
                return prev + space + text;
              });
            }
          } catch (e) {
            console.error("Transcription failed", e);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsFallbackRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
      setIsRecording(false);
    }
  };

  const toggleVoice = () => {
    if (isRecording) {
      if (isFallbackRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsFallbackRecording(false);
      } else if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      startFallbackRecording();
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

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
        startFallbackRecording();
      } else {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      setIsFallbackRecording(prev => {
        if (!prev) {
          setIsRecording(false);
        }
        return prev;
      });
    };

    try {
      recognition.start();
    } catch (e) {
      startFallbackRecording();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent pt-10 pb-6 px-4 md:px-8">
      <div className="max-w-3xl mx-auto relative">
        <div className="flex gap-2 mb-3">
          {["basic", "advanced", "deep_research"].map((m) => (
            <button
              key={m}
              onClick={() => setTier(m)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize",
                tier === m 
                  ? "bg-emerald-500 text-black" 
                  : "bg-[#222] text-gray-300 hover:bg-[#333]"
              )}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className={cn(
          "relative flex items-end gap-2 bg-[#212121] border rounded-2xl p-2 shadow-xl transition-all",
          isRecording ? "border-red-500/50 ring-1 ring-red-500/20" : "border-white/10 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20"
        )}>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".csv,.xlsx,.pdf"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isGenerating || isRecording}
            className={cn(
              "p-2 rounded-xl transition-colors shrink-0",
              isUploading ? "text-emerald-500 animate-pulse" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            )}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : "Analyze Tally report, compare competitor, forecast growth..."}
            className={cn(
              "w-full max-h-[200px] bg-transparent placeholder:text-gray-500 resize-none outline-none py-2.5 px-1 text-[15px] leading-relaxed",
              isRecording ? "text-red-400" : "text-gray-100"
            )}
            rows={1}
            disabled={isGenerating || isUploading}
          />
          
          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={toggleVoice}
              disabled={isGenerating || isUploading}
              className={cn(
                "p-2 rounded-xl transition-colors",
                isRecording 
                  ? "text-red-500 bg-red-500/10 hover:bg-red-500/20 animate-pulse" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              {isRecording ? <Square className="w-5 h-5" fill="currentColor" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating || isUploading}
              className={cn(
                "p-2 rounded-xl transition-all flex items-center justify-center",
                input.trim() && !isGenerating && !isUploading
                  ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                  : "bg-white/5 text-gray-500 cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">BharatMind can make mistakes. Verify critical financial data.</p>
        </div>
      </div>
    </div>
  );
}
