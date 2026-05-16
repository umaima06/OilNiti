//NitiBot.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { transformSimulationResponse } from '../utils/transformers';

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
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>🤖</div>
    <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: 'rgba(245,158,11,0.6)',
          animation: `nitiBotDot 1.4s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
    <style>{`
      @keyframes nitiBotDot {
        0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
        40% { opacity: 1; transform: scale(1.2); }
      }
    `}</style>
  </div>
);

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '4px 16px',
      }}>
        <div style={{
          fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
          color: '#f59e0b', background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.15)',
          padding: '4px 12px', borderRadius: 999, letterSpacing: '0.05em',
        }}>
          ⚡ {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 8, padding: '4px 16px', alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, marginTop: 2,
        }}>🤖</div>
      )}
      {/* Message */}
      <div style={{
        maxWidth: '82%', padding: '10px 14px', borderRadius: 12,
        fontSize: 12.5, lineHeight: 1.55,
        fontFamily: isUser ? "'IBM Plex Mono', monospace" : "'Sora', sans-serif",
        ...(isUser ? {
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: '#fff', borderBottomRightRadius: 4,
        } : {
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#e8eaf2', borderBottomLeftRadius: 4,
        }),
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

  const {
    cpoDuty, setCpoDuty,
    rpoDuty, setRpoDuty,
    globalShock, setGlobalShock,
    simulationResult, setSimulationResult,
    runSimulation,
  } = useSimulation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      // Build current simulation data for context
      const currentSimData = simulationResult?._raw || null;

      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          current_simulation: currentSimData,
          current_cpo_duty: cpoDuty,
          current_rpo_duty: rpoDuty,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      // If NitiBot ran a simulation, update the dashboard
      if (data.auto_simulation) {
        const { cpo_duty, rpo_duty, result } = data.auto_simulation;

        // Add system message showing the simulation was triggered
        setMessages(prev => [...prev, {
          role: 'system',
          content: `Simulation triggered → CPO: ${cpo_duty}%, RPO: ${rpo_duty}%`
        }]);

        // Move the sliders
        setCpoDuty(cpo_duty);
        setRpoDuty(rpo_duty);
        setGlobalShock(0);

        // Update the dashboard with the simulation result
        const transformed = transformSimulationResponse(result, cpo_duty, rpo_duty);
        setSimulationResult(transformed);
      }

      // Add bot reply
      setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: "I'm having trouble connecting to my analysis engine. Please make sure the backend server is running on port 8000 and the GROQ_API_KEY is set."
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [cpoDuty, rpoDuty, simulationResult, setCpoDuty, setRpoDuty, setGlobalShock, setSimulationResult]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 10000,
          width: 420, maxWidth: 'calc(100vw - 48px)',
          height: 560, maxHeight: 'calc(100vh - 120px)',
          background: '#0d1325',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 16, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.08)',
          animation: 'nitiBotSlideUp 0.3s ease forwards',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>🤖</div>
              <div>
                <div style={{
                  fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 600,
                  color: '#e8eaf2',
                }}>NitiBot</div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                  color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em',
                }}>
                  AI POLICY ADVISOR · NITI AAYOG
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {simulationResult && (
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                  color: '#10b981', background: 'rgba(16,185,129,0.1)',
                  padding: '3px 8px', borderRadius: 999,
                  border: '1px solid rgba(16,185,129,0.2)',
                }}>
                  ● LIVE DATA
                </div>
              )}
              <button onClick={() => setIsOpen(false)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer', fontSize: 18, padding: 4,
                transition: 'color 0.2s',
              }} onMouseEnter={e => e.target.style.color = '#e8eaf2'}
                 onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 0',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {isTyping && <TypingIndicator />}

            {/* Suggested questions */}
            {showSuggestions && messages.length <= 1 && (
              <div style={{ padding: '8px 16px' }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                  color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em',
                  marginBottom: 8,
                }}>
                  TRY ASKING
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '6px 10px',
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                      color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                      transition: 'all 0.2s', textAlign: 'left',
                    }}
                      onMouseEnter={e => { e.target.style.borderColor = 'rgba(245,158,11,0.3)'; e.target.style.color = '#f59e0b'; }}
                      onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.color = 'rgba(255,255,255,0.5)'; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <div style={{
              display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about policy impacts, try a duty rate..."
                disabled={isTyping}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '10px 14px',
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                  color: '#e8eaf2', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isTyping || !input.trim()}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: input.trim() ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, transition: 'all 0.2s', flexShrink: 0,
                  opacity: isTyping ? 0.5 : 1,
                }}
              >
                →
              </button>
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 8,
              color: 'rgba(255,255,255,0.15)', marginTop: 6, textAlign: 'center',
              letterSpacing: '0.08em',
            }}>
              NitiBot reads your live simulation · Powered by LLaMA 3.1
            </div>
          </div>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 10001,
          width: 56, height: 56, borderRadius: '50%',
          background: isOpen
            ? 'linear-gradient(135deg, #374151, #1f2937)'
            : 'linear-gradient(135deg, #f59e0b, #d97706)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isOpen ? 20 : 24,
          boxShadow: isOpen
            ? '0 4px 16px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: isOpen ? 'none' : 'nitiBotPulse 3s ease-in-out infinite',
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Global animations */}
      <style>{`
        @keyframes nitiBotSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nitiBotPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.1); }
          50% { box-shadow: 0 8px 40px rgba(245,158,11,0.6), 0 0 80px rgba(245,158,11,0.15); }
        }
        @media print {
          .nitibot-container { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default NitiBot;
