import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { ChevronDown, ChevronUp, Search, FileText, Database, CheckCircle, ExternalLink, Link2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisualAnalytics } from './VisualAnalytics';
import { ExportMenu } from './ExportMenu';

interface ResearchSections {
  thinking: string | null;
  sources: string | null;
  evidence: string | null;
  report: string | null;
  citations: string | null;
}

function parseResearchContent(content: string): ResearchSections {
  const sections: ResearchSections = {
    thinking: null,
    sources: null,
    evidence: null,
    report: null,
    citations: null,
  };

  // Simple regex to match sections. The sections are separated by headings.
  // We look for the exact headings as specified in the prompt.
  
  const extractSection = (startHeading: string, nextHeadings: string[]) => {
    const startIdx = content.indexOf(startHeading);
    if (startIdx === -1) return null;

    let endIdx = content.length;
    for (const nextHeading of nextHeadings) {
      const idx = content.indexOf(nextHeading, startIdx + startHeading.length);
      if (idx !== -1 && idx < endIdx) {
        endIdx = idx;
      }
    }

    return content.slice(startIdx + startHeading.length, endIdx).trim();
  };

  sections.thinking = extractSection('THINKING', ['SOURCES', 'EVIDENCE', 'RESEARCH REPORT', 'CITATIONS']);
  sections.sources = extractSection('SOURCES', ['EVIDENCE', 'RESEARCH REPORT', 'CITATIONS']);
  sections.evidence = extractSection('EVIDENCE', ['RESEARCH REPORT', 'CITATIONS']);
  sections.report = extractSection('RESEARCH REPORT', ['CITATIONS']);
  sections.citations = extractSection('CITATIONS', []);

  // If no sections are found, treat the whole content as the report
  if (!sections.thinking && !sections.sources && !sections.evidence && !sections.report && !sections.citations) {
    sections.report = content;
  }

  return sections;
}

export function ResearchMessage({ content, onTranslate }: { content: string, onTranslate?: (translatedText: string) => void }) {
  const sections = parseResearchContent(content);
  
  // If no structured sections are found, fallback to standard markdown
  if (!sections.thinking && !sections.sources && !sections.evidence && !sections.citations) {
    return (
      <div className="space-y-6 w-full max-w-3xl">
        <VisualAnalytics content={content} />
        <div className="markdown-body">
          <Markdown>{content}</Markdown>
        </div>
        <ExportMenu content={content} onTranslate={onTranslate} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-3xl">
      {sections.thinking && <ThinkingSection content={sections.thinking} />}
      {sections.sources && <SourcesSection content={sections.sources} />}
      {sections.evidence && <EvidenceSection content={sections.evidence} />}
      
      {/* Insert Visual Analytics before the report text */}
      {sections.report && <VisualAnalytics content={sections.report} />}
      
      {sections.report && (
        <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-white/5 shadow-lg">
          <div className="markdown-body">
            <Markdown>{sections.report}</Markdown>
          </div>
        </div>
      )}
      {sections.citations && <CitationsSection content={sections.citations} />}
      
      {/* Add Export Menu at the bottom */}
      {sections.report && <ExportMenu content={sections.report} onTranslate={onTranslate} />}
    </div>
  );
}

function ThinkingSection({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Parse steps from thinking content
  const steps = content.split('\n').filter(line => line.trim().startsWith('•') || line.trim().startsWith('-')).map(line => line.replace(/^[•-]\s*/, '').trim());

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#1a1a1a]">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 text-emerald-400">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="font-medium text-sm tracking-wide uppercase">Researching</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-white/5 space-y-3">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
              {idx === 0 ? <Search className="w-4 h-4 mt-0.5 text-blue-400" /> : 
               idx === 1 ? <Database className="w-4 h-4 mt-0.5 text-purple-400" /> :
               idx === 2 ? <FileText className="w-4 h-4 mt-0.5 text-amber-400" /> :
               <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-400" />}
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SourcesSection({ content }: { content: string }) {
  // Parse sources. Format is typically:
  // 1. Website name — Article Title
  // URL
  const sources: { name: string, title: string, url: string }[] = [];
  
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+\./.test(line)) {
      // It's a source title line
      const parts = line.replace(/^\d+\.\s*/, '').split('—');
      const name = parts[0]?.trim() || 'Source';
      const title = parts.slice(1).join('—').trim() || name;
      
      // Look ahead for URL
      let url = '';
      if (i + 1 < lines.length && (lines[i+1].startsWith('http') || lines[i+1].startsWith('www'))) {
        url = lines[i+1];
        i++; // Skip the URL line
      }
      
      sources.push({ name, title, url });
    }
  }

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400 uppercase tracking-wider px-1">
        <BookOpen className="w-4 h-4" />
        <span>Sources Discovered</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sources.map((source, idx) => (
          <a 
            key={idx} 
            href={source.url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              "block p-4 rounded-xl border border-white/10 bg-[#1e1e1e] hover:bg-[#252525] transition-all group",
              !source.url && "pointer-events-none"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-medium text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                {source.title}
              </div>
              {source.url && <ExternalLink className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5 group-hover:text-emerald-400" />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-gray-300">
                {source.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{source.name}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function EvidenceSection({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const points = content.split('\n').filter(line => line.trim().startsWith('•') || line.trim().startsWith('-')).map(line => line.replace(/^[•-]\s*/, '').trim());

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden bg-[#151515]">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>Evidence Extracted</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-white/5 space-y-2">
          {points.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 flex-shrink-0" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CitationsSection({ content }: { content: string }) {
  const citations: { id: string, text: string, url: string }[] = [];
  
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\[(\d+)\]\s*(.*)/);
    if (match) {
      const id = match[1];
      const text = match[2];
      
      let url = '';
      if (i + 1 < lines.length && (lines[i+1].startsWith('http') || lines[i+1].startsWith('www'))) {
        url = lines[i+1];
        i++;
      }
      
      citations.push({ id, text, url });
    }
  }

  if (citations.length === 0) {
    return null;
  }

  return (
    <div className="pt-4 border-t border-white/10">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 px-1">
        <Link2 className="w-4 h-4" />
        <span>References</span>
      </div>
      <div className="space-y-2">
        {citations.map((citation, idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm">
            <span className="text-emerald-500/70 font-mono text-xs mt-0.5">[{citation.id}]</span>
            <div className="flex-1">
              <span className="text-gray-400">{citation.text}</span>
              {citation.url && (
                <a href={citation.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-emerald-400/70 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors">
                  <span className="truncate max-w-[200px] inline-block align-bottom">{citation.url.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
