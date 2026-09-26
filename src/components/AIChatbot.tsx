import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Minus,
  Maximize2,
  GripHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GOOGLE_MAPS_LOCATION_URL } from '../data/mockData';

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

interface Position {
  x: number;
  y: number;
}

export const AIChatbot: React.FC = () => {
  const { t, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Floating button position & collision avoidance
  const [buttonCorner, setButtonCorner] = useState<'bottom-right' | 'bottom-left'>('bottom-right');

  // Movable panel state
  const [panelPos, setPanelPos] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: t.aiChatbot.welcomeMsg || 'Hello! How can I help you with Shiv Computer?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [language, t.aiChatbot.welcomeMsg]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when chat panel opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, isMinimized]);

  // Accessibility: Close panel on 'Escape' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsMinimized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Content-Aware Positioning & Collision Detection for Floating Button
  const checkButtonCollision = useCallback(() => {
    if (typeof window === 'undefined') return;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    // Check potential overlap with critical action buttons in bottom right
    const criticalSelectors = [
      'button[type="submit"]',
      '#login-submit-btn',
      '#header-logout-btn',
      '#admin-sidebar-logout-btn',
      '#user-sidebar-logout-btn',
      '[data-avoid-ai="true"]',
    ];

    let hasCollisionInBottomRight = false;
    const buttonTargetArea = {
      left: vpW - 90,
      right: vpW - 10,
      top: vpH - 90,
      bottom: vpH - 10,
    };

    for (const selector of criticalSelectors) {
      const elements = document.querySelectorAll(selector);
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        if (el.offsetParent === null) continue; // hidden
        const rect = el.getBoundingClientRect();
        // Check intersection
        if (
          rect.right > buttonTargetArea.left &&
          rect.left < buttonTargetArea.right &&
          rect.bottom > buttonTargetArea.top &&
          rect.top < buttonTargetArea.bottom
        ) {
          hasCollisionInBottomRight = true;
          break;
        }
      }
      if (hasCollisionInBottomRight) break;
    }

    if (hasCollisionInBottomRight) {
      setButtonCorner('bottom-left');
    } else {
      setButtonCorner('bottom-right');
    }
  }, []);

  // Monitor viewport size and recalculate boundaries / safe positions
  const clampPosition = useCallback((x: number, y: number, width: number, height: number): Position => {
    if (typeof window === 'undefined') return { x, y };
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    const minX = 8;
    const maxX = Math.max(minX, vpW - width - 8);
    const minY = 8;
    const maxY = Math.max(minY, vpH - height - 8);

    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  }, []);

  // Calculate default safe position for the chat panel
  const calculateDefaultPosition = useCallback((): Position => {
    if (typeof window === 'undefined') return { x: 20, y: 20 };
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    // Check session storage first
    try {
      const saved = sessionStorage.getItem('sc_ai_panel_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const panelWidth = vpW < 640 ? Math.min(vpW - 20, 360) : 384;
          const panelHeight = vpW < 640 ? Math.min(vpH - 40, 520) : 540;
          return clampPosition(parsed.x, parsed.y, panelWidth, panelHeight);
        }
      }
    } catch {
      // ignore
    }

    const panelWidth = vpW < 640 ? Math.min(vpW - 20, 360) : 384;
    const panelHeight = vpW < 640 ? Math.min(vpH - 40, 520) : 540;

    // Intelligent positioning: avoid covering forms/modals if on left or right
    const defaultX = buttonCorner === 'bottom-left' ? 16 : vpW - panelWidth - 20;
    const defaultY = Math.max(16, vpH - panelHeight - 20);

    return clampPosition(defaultX, defaultY, panelWidth, panelHeight);
  }, [buttonCorner, clampPosition]);

  // Window resize handler: keeps panel within viewport boundaries
  useEffect(() => {
    const handleResize = () => {
      checkButtonCollision();
      setPanelPos((prev) => {
        if (!prev) return null;
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;
        const panelWidth = vpW < 640 ? Math.min(vpW - 20, 360) : 384;
        const panelHeight = vpW < 640 ? Math.min(vpH - 40, 520) : 540;
        return clampPosition(prev.x, prev.y, panelWidth, panelHeight);
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', checkButtonCollision, { passive: true });

    // Initial check
    checkButtonCollision();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', checkButtonCollision);
    };
  }, [checkButtonCollision, clampPosition]);

  // Open panel and assign initial safe position if not set
  const handleOpenPanel = () => {
    if (!panelPos) {
      setPanelPos(calculateDefaultPosition());
    }
    setIsOpen(true);
    setIsMinimized(false);
  };

  // Dragging Implementation (Mouse + Touch)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Only drag from header elements that are not interactive buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) {
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const currentPos = panelPos || calculateDefaultPosition();

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initX: currentPos.x,
      initY: currentPos.y,
    };

    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return;
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - dragStartRef.current.startX;
      const deltaY = clientY - dragStartRef.current.startY;

      const rawX = dragStartRef.current.initX + deltaX;
      const rawY = dragStartRef.current.initY + deltaY;

      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const panelWidth = vpW < 640 ? Math.min(vpW - 20, 360) : 384;
      const panelHeight = isMinimized ? 52 : vpW < 640 ? Math.min(vpH - 40, 520) : 540;

      const clamped = clampPosition(rawX, rawY, panelWidth, panelHeight);
      setPanelPos(clamped);

      try {
        sessionStorage.setItem('sc_ai_panel_pos', JSON.stringify(clamped));
      } catch {
        // ignore
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, isMinimized, clampPosition]);

  // Automated Response Logic (Bilingual English & Gujarati)
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
            label: 'ગૂગલ મેપ્સ પર લોકેશન જુઓ',
            url: GOOGLE_MAPS_LOCATION_URL,
          },
        };
      }
      return {
        text: 'Official Office Address of Shiv Computer:\nNear Old Railway Crossing, Char Chok, Keshod – 362220, Gujarat, India.\nOffice Hours: Monday to Saturday 09:00 AM – 08:30 PM.',
        link: {
          label: 'View Location on Google Maps',
          url: GOOGLE_MAPS_LOCATION_URL,
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
          text: 'પીએમ કિસાન અને ખેડૂત યોજનાઓ:\n૧. પીએમ કિસાન eKYC અને આધાર સીડીંગ - ₹૮૦\n૨. આઈ-ખેડૂત તાર ફેન્સીંગ સહાય યોજના - ₹૩૫૦ (૭/૧૨, ૮-અ, બેંક પાસબુક, સંમતિ પત્રક જરૂરી)\n૩. સોલાર પંપ યોજના - સૂર્યશક્તિ કિસાન યોજના\nઅમારી કેશોદ ઓફિસે આવીને તમે તાત્કાલિક અરજી કરાવી શકો છો.',
        };
      }
      return {
        text: 'PM Kisan & Agriculture Portal Schemes available at Shiv Computer:\n1. PM Kisan eKYC & Aadhaar Seeding (₹80)\n2. iKhedut Barbed Wire Fencing Subsidy (7/12, 8A, Bank Passbook, Co-farmer Consent required)\n3. Solar Agricultural Pump Assistance\nYou can submit your documents directly through the user dashboard or visit our center in Keshod.',
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
    setIsTyping(true);

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
      setIsTyping(false);
    }, 400);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: t.aiChatbot.welcomeMsg || 'Hello! How can I help you with Shiv Computer?',
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
      {/* 1. FLOATING CIRCULAR AI ASSISTANT BUTTON:
          - Default state shows ONLY small AI robot icon (no text).
          - Compact 52px button matching Shiv Computer blue/gradient/glassy design.
          - Subtle glowing pulse ring.
          - Content-aware positioning avoiding forms and action buttons.
          - Mobile safe area insets respected.
      */}
      {!isOpen && (
        <div
          id="ai-chatbot-launcher-container"
          className={`fixed z-50 transition-all duration-300 pointer-events-auto ${
            buttonCorner === 'bottom-left'
              ? 'left-4 sm:left-6 bottom-5'
              : 'right-4 sm:right-6 bottom-5'
          }`}
          style={{
            bottom: 'max(1.25rem, env(safe-area-inset-bottom, 20px))',
            ...(buttonCorner === 'bottom-left'
              ? { left: 'max(1rem, env(safe-area-inset-left, 16px))' }
              : { right: 'max(1rem, env(safe-area-inset-right, 16px))' }),
          }}
        >
          <div className="relative group">
            {/* Ambient subtle glow ring */}
            <span className="absolute -inset-1 rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-sky-400 opacity-40 blur-sm group-hover:opacity-75 transition-opacity duration-300 animate-pulse pointer-events-none" />

            <button
              id="ai-chatbot-open-btn"
              type="button"
              onClick={handleOpenPanel}
              className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-linear-to-tr from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/35 hover:shadow-blue-500/50 flex items-center justify-center border border-white/30 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
              aria-label="Shiv AI Assistant"
              title={language === 'gu' ? 'શિવ AI સહાયક' : 'Shiv AI Assistant'}
            >
              {/* Only Small Robot Icon in default state */}
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform duration-200 group-hover:scale-110 drop-shadow-sm" />

              {/* Status Indicator Dot */}
              <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-xs" />
              </span>
            </button>

            {/* Desktop Hover Tooltip: Only visible on hover */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 ${
                buttonCorner === 'bottom-left' ? 'left-full ml-3' : 'right-full mr-3'
              }`}
            >
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-slate-800/95 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'gu' ? 'શિવ AI સહાયક' : 'Shiv AI Assistant'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MINIMIZED FLOATING DOCK BAR:
          Shown when the chat is minimized so the user can easily expand or drag it.
      */}
      {isOpen && isMinimized && (
        <div
          id="ai-chatbot-minimized-bar"
          ref={panelRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{
            position: 'fixed',
            left: panelPos ? `${panelPos.x}px` : undefined,
            top: panelPos ? `${panelPos.y}px` : undefined,
            bottom: !panelPos ? 'max(1.25rem, env(safe-area-inset-bottom, 20px))' : undefined,
            right: !panelPos ? 'max(1rem, env(safe-area-inset-right, 16px))' : undefined,
            zIndex: 60,
          }}
          className={`cursor-grab active:cursor-grabbing select-none flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-linear-to-r from-blue-700/95 via-indigo-700/95 to-sky-700/95 text-white shadow-2xl border border-white/25 backdrop-blur-xl animate-in fade-in duration-150 ${
            isDragging ? 'opacity-90 ring-2 ring-white/50 scale-[1.02]' : ''
          }`}
          role="region"
          aria-label="Minimized Shiv AI Assistant"
        >
          <GripHorizontal className="w-4 h-4 text-blue-200 shrink-0 opacity-70" />
          <div
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold tracking-tight whitespace-nowrap">
              {language === 'gu' ? 'શિવ AI સહાયક' : 'Shiv AI Assistant'}
            </span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded-lg hover:bg-white/20 text-blue-100 hover:text-white transition-colors"
              aria-label="Maximize Shiv AI Assistant"
              title="Maximize"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(false);
              }}
              className="p-1 rounded-lg hover:bg-white/20 text-blue-100 hover:text-white transition-colors"
              aria-label="Close Shiv AI Assistant"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. MOVABLE CHAT PANEL:
          - Draggable header with boundary clamping (cannot drag outside viewport).
          - Glassy clean UI matching Shiv Computer design language.
          - Header with "Shiv AI Assistant", Robot icon, Close, Minimize, Restart.
          - Message area with smooth scroll.
          - Input box & Send button.
          - Keyboard and mobile safe area friendly.
      */}
      {isOpen && !isMinimized && (
        <div
          id="ai-chatbot-window"
          ref={panelRef}
          style={{
            position: 'fixed',
            left: panelPos ? `${panelPos.x}px` : undefined,
            top: panelPos ? `${panelPos.y}px` : undefined,
            bottom: !panelPos ? 'max(1.25rem, env(safe-area-inset-bottom, 20px))' : undefined,
            right: !panelPos ? 'max(1rem, env(safe-area-inset-right, 16px))' : undefined,
            zIndex: 60,
          }}
          className={`w-[calc(100vw-1.5rem)] sm:w-96 max-w-[400px] h-[540px] max-h-[82vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/30 dark:border-white/15 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl animate-in slide-in-from-bottom-4 duration-200 select-none ${
            isDragging ? 'ring-2 ring-blue-500/50 shadow-blue-500/25' : ''
          }`}
          role="dialog"
          aria-modal="false"
          aria-label={t.aiChatbot.title || 'Shiv AI Assistant'}
        >
          {/* DRAGGABLE HEADER */}
          <div
            id="ai-chatbot-header"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="cursor-grab active:cursor-grabbing px-4 py-3 bg-linear-to-r from-blue-700 via-indigo-700 to-sky-600 text-white flex items-center justify-between shrink-0 border-b border-white/20 select-none relative"
          >
            {/* Left: Drag grip indicator & Brand Icon & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <GripHorizontal className="w-4 h-4 text-blue-200/80 shrink-0 opacity-80" />
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25 shadow-xs shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm leading-tight text-white tracking-tight truncate">
                    {language === 'gu' ? 'શિવ AI સહાયક' : 'Shiv AI Assistant'}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p className="text-[10px] text-blue-100/90 font-medium leading-tight truncate">
                  {language === 'gu' ? 'અધિકૃત શિવ કમ્પ્યુટર સેવા સહાયક' : 'Shiv Computer Official AI Helpdesk'}
                </p>
              </div>
            </div>

            {/* Right: Header Control Buttons */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {/* Restart / Clear Chat */}
              <button
                type="button"
                onClick={handleClearChat}
                title={language === 'gu' ? 'વાતચીત ફરી શરૂ કરો' : 'Restart Chat'}
                aria-label="Restart conversation"
                className="p-1.5 rounded-lg hover:bg-white/20 text-blue-100 hover:text-white transition-colors active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimize Panel */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                title={language === 'gu' ? 'નાનું કરો' : 'Minimize'}
                aria-label="Minimize Shiv AI Assistant"
                className="p-1.5 rounded-lg hover:bg-white/20 text-blue-100 hover:text-white transition-colors active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Close Panel */}
              <button
                id="ai-chatbot-close-btn"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                title={language === 'gu' ? 'બંધ કરો' : 'Close'}
                aria-label="Close Shiv AI Assistant"
                className="p-1.5 rounded-lg hover:bg-white/20 text-blue-100 hover:text-white transition-colors active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGES LIST AREA */}
          <div
            id="ai-chatbot-messages"
            className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/60 dark:bg-slate-950/60 text-xs sm:text-sm select-text"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600/15 text-blue-700 dark:text-blue-300 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3 rounded-2xl space-y-2 shadow-xs transition-all ${
                    msg.sender === 'user'
                      ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs border border-white/20'
                      : 'bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-white/10 shadow-xs'
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
                      msg.sender === 'user' ? 'text-blue-100/75' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-blue-600/15 text-blue-700 dark:text-blue-300 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white/90 dark:bg-slate-800/90 px-3.5 py-2 rounded-2xl rounded-bl-xs border border-slate-200/80 dark:border-white/10 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK TOPIC CHIPS */}
          <div className="px-3 pt-2 pb-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/60 dark:border-white/10 shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{t.aiChatbot.quickQuestionsTitle || 'Frequently Asked Questions:'}</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="shrink-0 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-300 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 transition-all truncate max-w-[210px] active:scale-95 shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/70 dark:border-white/10 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              id="ai-chatbot-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.aiChatbot.inputPlaceholder || 'Ask a question in English or Gujarati...'}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/15 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <button
              id="ai-chatbot-send-btn"
              type="submit"
              disabled={!inputValue.trim()}
              className="px-3 py-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all shrink-0 active:scale-95 border border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label={t.aiChatbot.sendButton || 'Send'}
            >
              <Send className="w-4 h-4" />
              <span className="hidden xs:inline">{t.aiChatbot.sendButton || 'Send'}</span>
            </button>
          </form>

          {/* FOOTER DISCLAIMER */}
          <div className="py-1 px-3 bg-slate-100/60 dark:bg-slate-950/60 text-center border-t border-slate-200/50 dark:border-white/5 shrink-0">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {t.aiChatbot.disclaimer || 'Official Shiv Computer Support • Keshod'}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

// Also export as ShivAIWidget for full compatibility
export const ShivAIWidget = AIChatbot;
