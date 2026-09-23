import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ExternalLink,
  Phone,
  MapPin,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  link?: {
    label: string;
    url: string;
  };
}

export const AIChatbot: React.FC = () => {
  const { t, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: t.aiChatbot.welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [language, t.aiChatbot.welcomeMsg]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const getAutomatedResponse = (query: string): { text: string; link?: { label: string; url: string } } => {
    const q = query.toLowerCase();

    // Owner / Contact / WhatsApp queries
    if (
      q.includes('raviraj') ||
      q.includes('owner') ||
      q.includes('whatsapp') ||
      q.includes('phone') ||
      q.includes('contact') ||
      q.includes('નંબર') ||
      q.includes('વોટ્સએપ') ||
      q.includes('માલિક') ||
      q.includes('સંપર્ક') ||
      q.includes('મકવાણા')
    ) {
      if (language === 'gu') {
        return {
          text: 'શિવ કમ્પ્યુટરના માલિક શ્રી રવિરાજ મકવાણા છે. તેમનો સત્તાવાર વોટ્સએપ નંબર +91 92134 88440 છે. તમે નીચેના બટન પર ક્લિક કરીને સીધા જ તેમની સાથે વોટ્સએપ પર વાત કરી શકો છો:',
          link: {
            label: 'વોટ્સએપ પર ચેટ કરો (+91 92134 88440)',
            url: 'https://wa.me/919213488440',
          },
        };
      }
      return {
        text: 'The owner of Shiv Computer is Mr. Raviraj Makwana. His official WhatsApp and contact number is +91 92134 88440. You can reach out directly via WhatsApp:',
        link: {
          label: 'Chat on WhatsApp (+91 92134 88440)',
          url: 'https://wa.me/919213488440',
        },
      };
    }

    // Address / Location queries
    if (
      q.includes('address') ||
      q.includes('location') ||
      q.includes('where') ||
      q.includes('office') ||
      q.includes('keshod') ||
      q.includes('crossing') ||
      q.includes('સરનામું') ||
      q.includes('ક્યાં') ||
      q.includes('ઓફિસ') ||
      q.includes('કેશોદ') ||
      q.includes('રેલવે')
    ) {
      if (language === 'gu') {
        return {
          text: 'શિવ કમ્પ્યુટરનું અધિકૃત સરનામું:\nજૂના રેલવે ક્રોસિંગ પાસે, ચાર ચોક, કેશોદ – ૩૬૨૨૨૦, જૂનાગઢ જિલ્લો, ગુજરાત, ભારત.\nઓફિસ સમય: સોમવાર થી શનિવાર સવારે ૦૯:૦૦ થી રાત્રે ૦૮:૩૦ સુધી.',
          link: {
            label: 'ગૂગલ મેપ્સ પર સરનામું જુઓ',
            url: 'https://maps.google.com/?q=Near+Old+Railway+Crossing+Char+Chok+Keshod+Gujarat+362220',
          },
        };
      }
      return {
        text: 'Official Office Address of Shiv Computer:\nNear Old Railway Crossing, Char Chok, Keshod – 362220, Gujarat, India.\nOffice Hours: Monday to Saturday 09:00 AM – 08:30 PM.',
        link: {
          label: 'Open in Google Maps',
          url: 'https://maps.google.com/?q=Near+Old+Railway+Crossing+Char+Chok+Keshod+Gujarat+362220',
        },
      };
    }

    // Income Certificate queries
    if (
      q.includes('income') ||
      q.includes('certificate') ||
      q.includes('દાખલો') ||
      q.includes('આવક') ||
      q.includes('ડોક્યુમેન્ટ') ||
      q.includes('દસ્તાવેજ')
    ) {
      if (language === 'gu') {
        return {
          text: 'આવકના દાખલા (Income Certificate) માટે જરૂરી દસ્તાવેજો:\n૧. રેશન કાર્ડની નકલ\n૨. આધાર કાર્ડ (અરજદાર અને કુટુંબના સભ્યો)\n૩. લાઈટ બિલ અથવા વેરા પાવતી\n૪. આવકનું સોગંદનામું (Mamlatdar ફોર્મેટ)\nઅંદાજિત સમય: ૩-૫ દિવસ, ફી: ₹૧૫૦.',
        };
      }
      return {
        text: 'Required Documents for Digital Gujarat Income Certificate:\n1. Ration Card Copy\n2. Aadhaar Card of Applicant & Family\n3. Electricity Bill or Municipal Tax Receipt\n4. Notarized Income Affidavit\nProcessing Time: 3-5 Working Days | Fee: ₹150.',
      };
    }

    // PM Kisan / Farmer / Agriculture / Khedut queries
    if (
      q.includes('kisan') ||
      q.includes('farmer') ||
      q.includes('khedut') ||
      q.includes('fencing') ||
      q.includes('કિસાન') ||
      q.includes('ખેડૂત') ||
      q.includes('સબસિડી') ||
      q.includes('ફેન્સીંગ')
    ) {
      if (language === 'gu') {
        return {
          text: 'પીએમ કિસાન અને ખેડૂત યોજનાઓ:\n૧. પીએમ કિસાન eKYC અને આધાર સીડીંગ - ₹૮૦\n૨. આઈ-ખેડૂત તાર ફેન્સીંગ સહાય યોજના - ₹૩૫૦ (૭/૧૨, ૮-અ, બેંક પાસબુક, સંમતિ પત્રક જરૂરી)\n૩. સોલાર પંપ યોજના - સૂર્યશક્તિ કિસાન યોજના\nઅમારી ઓફિસે આવીને તમે તાત્કાલિક અરજી કરાવી શકો છો.',
        };
      }
      return {
        text: 'PM Kisan & Agriculture Portal Schemes available at Shiv Computer:\n1. PM Kisan eKYC & Aadhaar Seeding (₹80)\n2. iKhedut Barbed Wire Fencing Subsidy (7/12, 8A, Bank Passbook, Co-farmer Consent required)\n3. Solar Agricultural Pump Assistance\nYou can submit your documents directly through the user dashboard or visit our center.',
      };
    }

    // PAN Card queries
    if (q.includes('pan') || q.includes('પાન')) {
      if (language === 'gu') {
        return {
          text: 'નવા પાન કાર્ડ અથવા સુધારા (PAN Card Service):\n૧. નવું પાન કાર્ડ / સુધારો: આધાર કાર્ડ + પાસપોર્ટ સાઇઝ ફોટો જરૂરી છે.\n૨. આધાર સાથે મોબાઇલ લિંક હોય તો તાત્કાલિક e-PAN ઉપલબ્ધ થાય છે.\nફી: ₹૨૫૦, સમય: ૭-૧૦ દિવસ.',
        };
      }
      return {
        text: 'PAN Card Services at Shiv Computer:\nNew PAN registration and Corrections. Required: Aadhaar Card & 2 Passport size photos. Processing: 7-10 days, Fee: ₹250.',
      };
    }

    // Default fallback
    if (language === 'gu') {
      return {
        text: 'તમારા પ્રશ્ન બદલ આભાર. સરકારી પ્રમાણપત્રો (આવક, જાતિ, રેશન કાર્ડ), ખેડૂત સહાય (તાર ફેન્સીંગ, પીએમ કિસાન), અથવા સોગંદનામા માટે તમે ડેશબોર્ડમાં સીધી અરજી કરી શકો છો, અથવા માલિક રવિરાજ મકવાણા (+91 92134 88440) નો સંપર્ક કરી શકો છો.',
        link: {
          label: 'વોટ્સએપ પર પૂછપરછ કરો',
          url: 'https://wa.me/919213488440',
        },
      };
    }
    return {
      text: 'Thank you for your question. For government certificates, agricultural schemes (iKhedut, PM Kisan), affidavit downloads, or status tracking, please feel free to browse the dashboard or contact owner Raviraj Makwana directly on WhatsApp (+91 92134 88440).',
      link: {
        label: 'Chat on WhatsApp with Raviraj Makwana',
        url: 'https://wa.me/919213488440',
      },
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');

    // Simulate AI thinking and respond
    setTimeout(() => {
      const response = getAutomatedResponse(query);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        link: response.link,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 400);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: t.aiChatbot.welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickQuestions = [
    t.aiChatbot.q1,
    t.aiChatbot.q2,
    t.aiChatbot.q3,
    t.aiChatbot.q4,
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      <div id="ai-chatbot-launcher-container" className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            id="ai-chatbot-open-btn"
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
            aria-label={t.aiChatbot.launcherText}
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
            </div>
            <span className="font-medium tracking-wide">{t.aiChatbot.launcherText}</span>
          </button>
        )}
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div
          id="ai-chatbot-window"
          className="fixed bottom-4 right-4 z-50 w-[92vw] sm:w-96 max-w-md h-[560px] max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label={t.aiChatbot.title}
        >
          {/* Header */}
          <div className="p-4 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight text-white">{t.aiChatbot.title}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-blue-100/90 leading-tight mt-0.5 line-clamp-1">
                  {t.aiChatbot.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title={language === 'gu' ? 'વાતચીત ફરી શરૂ કરો' : 'Restart Chat'}
                className="p-1.5 rounded-xl hover:bg-white/15 text-blue-100 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                id="ai-chatbot-close-btn"
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/15 text-blue-100 hover:text-white transition-colors"
                aria-label={t.aiChatbot.closeButton}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            id="ai-chatbot-messages"
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 dark:bg-slate-950/60 text-xs sm:text-sm"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl space-y-2 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {msg.link && (
                    <a
                      href={msg.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <span>{msg.link.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <div
                    className={`text-[10px] text-right font-medium ${
                      msg.sender === 'user' ? 'text-blue-100/75' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Frequently Asked Questions Quick Chips */}
          <div className="px-3 pt-2.5 pb-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{t.aiChatbot.quickQuestionsTitle}</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-300 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors truncate max-w-[220px]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              id="ai-chatbot-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.aiChatbot.inputPlaceholder}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            />
            <button
              id="ai-chatbot-send-btn"
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              aria-label={t.aiChatbot.sendButton}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t.aiChatbot.sendButton}</span>
            </button>
          </form>

          {/* Center Disclaimer Footer */}
          <div className="py-1 px-3 bg-slate-50 dark:bg-slate-950 text-center border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {t.aiChatbot.disclaimer}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
