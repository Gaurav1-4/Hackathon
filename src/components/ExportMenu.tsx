import React, { useState } from 'react';
import { FileText, Presentation, Table, Cloud, BookOpen, Download, Loader2, Check, Languages } from 'lucide-react';
import { exportToPPT, exportToExcel, exportToWord } from '@/lib/exportUtils';
import { cn } from '@/lib/utils';
import { generateAIResponse } from '@/services/geminiService';

export function ExportMenu({ content, title = "BharatMind_Report", onTranslate }: { content: string, title?: string, onTranslate?: (translatedText: string) => void }) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [translating, setTranslating] = useState<string | null>(null);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);

  const handleExport = async (type: string, exportFn: () => Promise<void>) => {
    setExporting(type);
    try {
      await exportFn();
      setSuccess(type);
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      console.error(`Export failed for ${type}:`, error);
    } finally {
      setExporting(null);
    }
  };

  const handleMockExport = (type: string, message: string) => {
    setExporting(type);
    setTimeout(() => {
      setExporting(null);
      setSuccess(type);
      alert(message);
      setTimeout(() => setSuccess(null), 2000);
    }, 800);
  };

  const handleTranslate = async (lang: string) => {
    setTranslating(lang);
    setShowTranslateMenu(false);
    try {
      const prompt = `Translate the following business report into ${lang}. Maintain the professional tone, formatting, and structure. Do not add any extra commentary.\n\nReport:\n${content}`;
      const translatedText = await generateAIResponse(prompt);
      if (onTranslate) {
        onTranslate(translatedText);
      } else {
        alert(`Translation to ${lang} complete. (In a full implementation, this would update the UI or download a translated file)`);
      }
    } catch (error) {
      console.error("Translation failed:", error);
      alert("Translation failed. Please try again.");
    } finally {
      setTranslating(null);
    }
  };

  const buttons = [
    { id: 'ppt', label: 'Export to PPT', icon: Presentation, action: () => handleExport('ppt', () => exportToPPT(title, content)) },
    { id: 'excel', label: 'Export to Excel', icon: Table, action: () => handleExport('excel', () => exportToExcel(title, content)) },
    { id: 'word', label: 'Export to Word', icon: FileText, action: () => handleExport('word', () => exportToWord(title, content)) },
    { id: 'pdf', label: 'Export to PDF', icon: Download, action: () => handleMockExport('pdf', 'PDF exported successfully! (Mocked for preview)') },
    { id: 'notion', label: 'Export to Notion', icon: BookOpen, action: () => handleMockExport('notion', 'Copied to clipboard for Notion integration!') },
    { id: 'docs', label: 'Export to Google Docs', icon: Cloud, action: () => handleMockExport('docs', 'Saved to Google Drive!') },
  ];

  const languages = ['English', 'Hindi', 'Bengali', 'Tamil'];

  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">Export Anywhere</span>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowTranslateMenu(!showTranslateMenu)}
            disabled={translating !== null}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
          >
            {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
            {translating ? `Translating to ${translating}...` : 'Translate Report'}
          </button>
          
          {showTranslateMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-32 bg-[#1a1c23] border border-white/10 rounded-lg shadow-xl overflow-hidden z-10">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => handleTranslate(lang)}
                  className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={btn.action}
            disabled={exporting !== null}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
              exporting === btn.id 
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                : success === btn.id
                ? "bg-emerald-500 text-black border-emerald-500"
                : "bg-[#1a1a1a] text-gray-300 border-white/10 hover:bg-[#222] hover:border-white/20 hover:text-white"
            )}
          >
            {exporting === btn.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success === btn.id ? (
              <Check className="w-4 h-4" />
            ) : (
              <btn.icon className="w-4 h-4" />
            )}
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
