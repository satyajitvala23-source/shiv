import React, { useState } from 'react';
import {
  MapPin,
  UserCheck,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Navigation,
  Clock,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OfficeAddressCardProps {
  className?: string;
  showWorkingHours?: boolean;
  highlightAdmin?: boolean;
}

export const OfficeAddressCard: React.FC<OfficeAddressCardProps> = ({
  className = '',
  showWorkingHours = true,
  highlightAdmin = false,
}) => {
  const { t, language } = useApp();
  const [copied, setCopied] = useState(false);

  // Exact owner details preserved unchanged as requested
  const ownerName = 'Raviraj Makwana';
  const rawPhoneNumber = '+91 92134 88440';
  const cleanPhoneDigits = '919213488440';
  const whatsappUrl = `https://wa.me/${cleanPhoneDigits}`;
  const callUrl = `tel:+${cleanPhoneDigits}`;
  const mapsSearchQuery = 'Near Old Railway Crossing, Char Chok, Keshod, Gujarat 362220, India';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsSearchQuery)}`;

  const fullOfficeAddress = 'Shiv Computer, Near Old Railway Crossing, Char Chok, Keshod – 362220, Gujarat, India.';

  const handleCopyAddress = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullOfficeAddress);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullOfficeAddress;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div
      id="office-address-card"
      className={`rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Top Banner / Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                Shiv Computer
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {t.addressCard.verifiedCenter}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'gu' ? 'CSC અને ડિજિટલ સેવા કેન્દ્ર • કેશોદ' : 'CSC & e-Governance Facilitation Center • Keshod'}
            </p>
          </div>
        </div>

        {highlightAdmin && (
          <span className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
            {language === 'gu' ? 'અધિકૃત કેન્દ્ર વિગતો' : 'Official Center Profile'}
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Two-column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* SECTION 1: OWNER & CONTACT INFORMATION */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{t.addressCard.centerOwnerTitle}</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                RM
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {t.addressCard.owner}:
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {ownerName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t.addressCard.centerOwnerSub}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {t.addressCard.whatsapp} / {t.addressCard.phone}:
                  </span>
                  <a
                    href={callUrl}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    title={language === 'gu' ? 'ફોન કરવા માટે ક્લિક કરો' : 'Click to dial phone number'}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{rawPhoneNumber}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Action Chips inside Owner Box */}
            <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/50 transition-colors"
                title={language === 'gu' ? 'સીધો વોટ્સએપ ચેટ ખોલો' : 'Direct WhatsApp Chat'}
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.addressCard.whatsapp}: {rawPhoneNumber}</span>
              </a>
            </div>
          </div>

          {/* SECTION 2: OFFICE ADDRESS */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{t.addressCard.officeAddressTitle}</span>
              </span>
              <span className="text-[11px] font-normal text-slate-500 lowercase">
                Keshod • PIN 362220
              </span>
            </div>

            <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {t.addressCard.address}:
              </div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>📍 Shiv Computer</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">Near Old Railway Crossing,</p>
              <p className="text-slate-600 dark:text-slate-300">Char Chok, Keshod – 362220,</p>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Gujarat, India.</p>
            </div>

            {showWorkingHours && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>{t.addressCard.workingHours}: {t.addressCard.workingHoursVal}</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: 4 ACTION BUTTONS GRID */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Button 1: WhatsApp Owner (Prominent WhatsApp action) */}
            <a
              id="address-card-whatsapp-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all text-center"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>{t.addressCard.whatsappButton}</span>
            </a>

            {/* Button 2: Call Owner */}
            <a
              id="address-card-call-btn"
              href={callUrl}
              className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all text-center"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>{t.addressCard.callButton}</span>
            </a>

            {/* Button 3: View on Map */}
            <a
              id="address-card-map-btn"
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.99] text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-all text-center"
            >
              <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{t.addressCard.viewOnMap}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Button 4: Copy Address */}
            <button
              id="address-card-copy-btn"
              type="button"
              onClick={handleCopyAddress}
              className={`min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all text-center active:scale-[0.99] ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold">{t.addressCard.addressCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>{t.addressCard.copyAddress}</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback notice if copied */}
          {copied && (
            <div
              role="status"
              className="mt-2.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-center gap-1.5 animate-in fade-in slide-in-from-top-1"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.addressCard.addressCopied}: &quot;{fullOfficeAddress}&quot;</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficeAddressCard;
