//NitiBot.jsx — Bottom bar style, not floating bubble
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { transformSimulationResponse } from '../utils/transformers';
import { API_BASE } from '../config';

const SUGGESTED_QUESTIONS = [
  "Who gets hurt the most by this duty?",
  "Which state's farmers benefit the most?",
  "What duty rate would you recommend?",
  "What if we set CPO duty to 50%?",
  "Give me a one-paragraph summary I can publish",
  "What's the most shocking finding?",
];

const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: 4, padding: '12px 16px', alignItems: 'center' }}>
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, color: '#fff' }}>✦</div>
    <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', animation: `nitiBotDot 1.4s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
    <style>{`@keyframes nitiBotDot { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1.2); } }`}</style>
  </div>
);

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 16px' }}>
        <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: 999 }}>⚡ {msg.content}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 8, padding: '4px 16px', alignItems: 'flex-start' }}>
      {!isUser && <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, marginTop: 2, color: '#fff' }}>✦</div>}
      <div style={{
        maxWidth: '82%', padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.55,
        ...(isUser ? { background: '#16a34a', color: '#fff', borderBottomRightRadius: 4 } : { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111', borderBottomLeftRadius: 4 }),
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  );
};

const NitiBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "I'm NitiBot — your AI Policy Advisor. I can see the simulation running on your dashboard right now. Ask me anything about the impacts, or tell me to try a different duty rate and I'll run it live." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { cpoDuty, setCpoDuty, rpoDuty, setRpoDuty, globalShock, setGlobalShock, simulationResult, setSimulationResult, runSimulation } = useSimulation();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text.trim() }]);
    setInput(''); setIsTyping(true); setShowSuggestions(false);
    try {
      const res = await fetch(`${API_BASE}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text.trim(), current_simulation: simulationResult?._raw || null, current_cpo_duty: cpoDuty, current_rpo_duty: rpoDuty }) });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.auto_simulation) {
        const { cpo_duty, rpo_duty, result } = data.auto_simulation;
        setMessages(prev => [...prev, { role: 'system', content: `Simulation triggered → CPO: ${cpo_duty}%, RPO: ${rpo_duty}%` }]);
        setCpoDuty(cpo_duty); setRpoDuty(rpo_duty); setGlobalShock(0);
        setSimulationResult(transformSimulationResponse(result, cpo_duty, rpo_duty));
      }
      setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "I'm having trouble connecting. Make sure the backend is running on port 8000." }]);
    } finally { setIsTyping(false); }
  }, [cpoDuty, rpoDuty, simulationResult, setCpoDuty, setRpoDuty, setGlobalShock, setSimulationResult]);

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };
  const lastBotMsg = [...messages].reverse().find(m => m.role === 'bot')?.content || '';

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div style={{ position: 'fixed', bottom: 56, left: 0, right: 0, zIndex: 10000, height: 480, maxHeight: 'calc(100vh - 80px)', background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.1)', animation: 'nitiBotSlideUp 0.3s ease forwards' }}>
          {/* Header */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>✦</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>NitiBot</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>AI Policy Advisor</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
          </div>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {isTyping && <TypingIndicator />}
            {showSuggestions && messages.length <= 1 && (
              <div style={{ padding: '8px 16px' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, fontWeight: 500 }}>Try asking:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#555', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}
                      onMouseEnter={e => { e.target.style.borderColor = '#16a34a'; e.target.style.color = '#16a34a'; }}
                      onMouseLeave={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.color = '#555'; }}
                    >{q}</button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div style={{ padding: '12px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about policy impacts..." disabled={isTyping}
              style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#111', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#16a34a'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            <button onClick={() => sendMessage(input)} disabled={isTyping || !input.trim()}
              style={{ padding: '10px 20px', borderRadius: 8, background: input.trim() ? '#16a34a' : '#e5e7eb', border: 'none', cursor: input.trim() ? 'pointer' : 'default', color: input.trim() ? '#fff' : '#9ca3af', fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Fixed bottom bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10001, height: 56, background: '#fff', borderTop: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 180px)' }}>
          {lastBotMsg.length > 80 ? lastBotMsg.slice(0, 80) + '...' : lastBotMsg}
        </div>
        <button onClick={() => setIsOpen(prev => !prev)}
          style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
          onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}>
          {isOpen ? 'Close' : 'Ask NitiBot ✦'}
        </button>
      </div>

      <style>{`
        @keyframes nitiBotSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media print { .nitibot-container { display: none !important; } }
      `}</style>
    </>
  );
};

export default NitiBot;
