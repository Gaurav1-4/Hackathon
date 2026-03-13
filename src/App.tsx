import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { ChatArea } from './components/ChatArea';
import { InputArea } from './components/InputArea';
import { RightPanel } from './components/RightPanel';
import { Dashboard } from './components/Dashboard';
import { DataConnectors } from './components/DataConnectors';
import { AgentBuilder } from './components/AgentBuilder';
import { FloatingAssistant } from './components/FloatingAssistant';
import { CommandCenter } from './components/CommandCenter';
import { PersonalBusinessSpace } from './components/PersonalBusinessSpace';
import { Message } from './types';
import { generateBusinessInsightStream } from './services/geminiService';

import { ERPDashboard } from './components/erp/ERPDashboard';

export default function App() {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [activePage, setActivePage] = useState('Chat Intelligence');
  const [tier, setTier] = useState('advanced');
  
  const [moduleMessages, setModuleMessages] = useState<Record<string, Message[]>>({
    'Chat Intelligence': [{ id: '1', role: 'assistant', content: 'Welcome to BharatMind – India’s AI Business Intelligence & Strategy Operating System. How can I assist you today?' }],
    'Competitive Analysis': [{ id: '1', role: 'assistant', content: 'Welcome to Competitive Analysis. Which competitors would you like to analyze?' }],
    'Financial Forecasting': [{ id: '1', role: 'assistant', content: 'Welcome to Financial Forecasting. Please provide your historical data or assumptions.' }],
    'Strategy Simulator': [{ id: '1', role: 'assistant', content: 'Welcome to Strategy Simulator. What scenario would you like to simulate?' }],
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const messages = moduleMessages[activePage] || [];

  const handleSendMessage = async (content: string) => {
    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content };
    const assistantMessageId = (Date.now() + 1).toString();
    
    setModuleMessages(prev => ({
      ...prev,
      [activePage]: [...(prev[activePage] || []), newUserMessage, { id: assistantMessageId, role: 'assistant', content: '' }]
    }));
    
    setIsGenerating(true);

    try {
      await generateBusinessInsightStream(content, activePage, tier, (chunkText) => {
        setModuleMessages(prev => {
          const currentMessages = prev[activePage] || [];
          const updatedMessages = currentMessages.map(msg => {
            if (msg.id === assistantMessageId) {
              return { ...msg, content: msg.content + chunkText };
            }
            return msg;
          });
          return { ...prev, [activePage]: updatedMessages };
        });
      });
    } catch (error: any) {
      setModuleMessages(prev => {
        const currentMessages = prev[activePage] || [];
        const updatedMessages = currentMessages.map(msg => {
          if (msg.id === assistantMessageId) {
            return { ...msg, content: error.message || 'Error: Unable to connect to the intelligence engine. Please check your API key and connection.' };
          }
          return msg;
        });
        return { ...prev, [activePage]: updatedMessages };
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslateMessage = (messageId: string, translatedText: string) => {
    setModuleMessages(prev => {
      const currentMessages = prev[activePage] || [];
      const updatedMessages = currentMessages.map(msg => {
        if (msg.id === messageId) {
          return { ...msg, content: translatedText };
        }
        return msg;
      });
      return { ...prev, [activePage]: updatedMessages };
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#0f0f0f] text-gray-200 font-sans overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex flex-col flex-1 min-w-0 relative">
        <TopNav toggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)} />
        
        {activePage === 'Dashboard' ? (
          <Dashboard />
        ) : activePage === 'ERP & BI System' ? (
          <ERPDashboard />
        ) : activePage === 'Data Connectors' ? (
          <DataConnectors />
        ) : activePage === 'Agent Builder' ? (
          <AgentBuilder />
        ) : activePage === 'Personal Business Space' ? (
          <PersonalBusinessSpace />
        ) : (
          <>
            {messages.length <= 1 ? (
              <CommandCenter onAction={handleSendMessage} setActivePage={setActivePage} />
            ) : (
              <ChatArea 
                messages={messages} 
                isGenerating={isGenerating} 
                onTranslateMessage={handleTranslateMessage}
              />
            )}
            <InputArea 
              onSendMessage={handleSendMessage} 
              isGenerating={isGenerating} 
              tier={tier}
              setTier={setTier}
            />
          </>
        )}
      </div>
      {isRightPanelOpen && activePage !== 'Dashboard' && activePage !== 'ERP & BI System' && activePage !== 'Data Connectors' && activePage !== 'Agent Builder' && activePage !== 'Personal Business Space' && (
        <RightPanel 
          onClose={() => setIsRightPanelOpen(false)} 
          onResearchTopic={(topic) => {
            setActivePage('Chat Intelligence');
            handleSendMessage(topic);
          }}
        />
      )}
      <FloatingAssistant />
    </div>
  );
}
