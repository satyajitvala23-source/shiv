import React from 'react';
import {
  Printer,
  Layers,
  CreditCard,
  Camera,
  Ticket,
  Car,
  Compass,
  Award,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceItem } from '../../types';

interface QuickServiceCardsProps {
  onSelectService: (service: ServiceItem) => void;
}

export const QuickServiceCards: React.FC<QuickServiceCardsProps> = ({ onSelectService }) => {
  const { language, services } = useApp();

  // The 10 services highlighted by the user brief
  const coreServicesConfig = [
    {
      id: 'SRV-01',
      titleEn: 'Xerox / Printing',
      titleGu: 'ઝેરોક્ષ અને કલર પ્રિન્ટિંગ',
      descEn: 'High-speed B/W & Color Xerox, document scanning, lamination & PDF printouts.',
      descGu: 'ઝડપી બ્લેક/વ્હાઇટ અને કલર પ્રિન્ટિંગ, ઝેરોક્ષ, સ્કેનિંગ અને બાઇન્ડિંગ.',
      icon: Printer,
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeEn: 'Instant',
      badgeGu: 'ત્વરિત સેવા',
      fee: '₹20',
    },
    {
      id: 'SRV-02',
      titleEn: 'Lamination',
      titleGu: 'ડોક્યુમેન્ટ લેમિનેશન',
      descEn: 'Heavy-gauge hot thermal lamination for certificates, marksheets & smart PVC cards.',
      descGu: 'માર્કશીટ, જમીન દસ્તાવેજ અને પ્રમાણપત્રોનું હેવી લેમિનેશન તથા સ્માર્ટ કાર્ડ.',
      icon: Layers,
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeEn: '5 Mins',
      badgeGu: '૫ મિનિટમાં',
      fee: '₹30',
    },
    {
      id: 'SRV-03',
      titleEn: 'PAN Card',
      titleGu: 'પાન કાર્ડ (નવું / સુધારો)',
      descEn: 'New instant e-PAN card, Aadhaar biometric linkage, DOB/name correction & reprint.',
      descGu: 'નવું પાન કાર્ડ, સુધારો, આધાર લિંક અને તાત્કાલિક રીપ્રિન્ટ સેવા.',
      icon: CreditCard,
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeEn: 'NSDL Official',
      badgeGu: 'NSDL માન્ય',
      fee: '₹250',
    },
    {
      id: 'SRV-04',
      titleEn: 'Passport Photo',
      titleGu: 'પાસપોર્ટ સાઇઝ ફોટો',
      descEn: 'Urgent studio-finish passport photos with official white/blue background in 10 minutes.',
      descGu: '૧૦ મિનિટમાં સરકારી અને વિઝા માન્ય પાસપોર્ટ સાઇઝ કલર ફોટોગ્રાફ.',
      icon: Camera,
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeEn: '10 Mins',
      badgeGu: '૧૦ મિનિટ',
      fee: '₹60',
    },
    {
      id: 'SRV-05',
      titleEn: 'Ticket Booking',
      titleGu: 'રેલવે, બસ અને એર ટિકિટ',
      descEn: 'Authorized IRCTC railway reservation, Tatkal ticket booking, GSRTC & flight booking.',
      descGu: 'IRCTC ટ્રેન ટિકિટ, તત્કાલ બુકિંગ, GSRTC બસ અને ફ્લાઇટ ટિકિટ સેવા.',
      icon: Ticket,
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeEn: 'Fast Booking',
      badgeGu: 'ઝડપી બુકિંગ',
      fee: '₹100',
    },
    {
      id: 'SRV-06',
      titleEn: 'Driving Licence',
      titleGu: 'ડ્રાઇવિંગ લાયસન્સ સેવા',
      descEn: 'Sarathi portal test slot booking, learning licence, DL renewal & address change.',
      descGu: 'લર્નિંગ લાયસન્સ, પાકું લાયસન્સ, રિન્યુઅલ અને આર.ટી.ઓ સ્લોટ બુકિંગ.',
      icon: Car,
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeEn: 'RTO Parivahan',
      badgeGu: 'RTO પરિવહન',
      fee: '₹300',
    },
    {
      id: 'SRV-07',
      titleEn: 'Passport Services',
      titleGu: 'પાસપોર્ટ સેવા અને એપોઇન્ટમેન્ટ',
      descEn: 'New Indian Passport application, renewal, Tatkal quota & PSK Junagadh appointments.',
      descGu: 'નવો પાસપોર્ટ, રિન્યુઅલ અને જૂનાગઢ પાસપોર્ટ ઓફિસ એપોઇન્ટમેન્ટ.',
      icon: Compass,
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeEn: 'Govt Portal',
      badgeGu: 'સરકારી પોર્ટલ',
      fee: '₹500',
    },
    {
      id: 'SRV-08',
      titleEn: 'Digital Gujarat Services',
      titleGu: 'ડિજિટલ ગુજરાત સેવાઓ',
      descEn: 'Income Certificate (આવકનો દાખલો), Caste Certificate, Domicile & Non-Creamy Layer.',
      descGu: 'આવકનો દાખલો, જાતિનો દાખલો, નોન-ક્રીમીલેયર અને બોનાફાઇડ સર્ટિફિકેટ.',
      icon: Award,
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeEn: 'State Portal',
      badgeGu: 'ગુજરાત સરકાર',
      fee: '₹150',
    },
    {
      id: 'SRV-09',
      titleEn: 'Online Forms',
      titleGu: 'સરકારી ભરતી અને યોજના ફોર્મ',
      descEn: 'GPSC, GSSSB, Police Bharti, Talati, TET/TAT, Post Office & scholarship registration.',
      descGu: 'પોલીસ ભરતી, તલાટી, સરકારી નોકરી અને શિષ્યવૃત્તિના ઓનલાઇન ફોર્મ.',
      icon: ClipboardList,
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeEn: 'Job & Schemes',
      badgeGu: 'ભરતી અને યોજના',
      fee: '₹120',
    },
    {
      id: 'SRV-10',
      titleEn: 'Other Online Services',
      titleGu: 'અન્ય ઓનલાઇન સેવાઓ',
      descEn: 'e-Shram card, Ayushman Bharat card, Ration card KYC & Electricity bill payments.',
      descGu: 'આયુષ્માન કાર્ડ, ઇ-શ્રમ કાર્ડ, રેશન કાર્ડ કેવાયસી અને લાઈટ બિલ ભરવું.',
      icon: Sparkles,
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeEn: 'All CSC',
      badgeGu: 'તમામ સેવાઓ',
      fee: '₹80',
    },
  ];

  const handleCardClick = (cfg: typeof coreServicesConfig[0]) => {
    // Look for matching service in services array, or create a valid runtime service item
    const matched = services.find((s) => s.id === cfg.id || s.name.toLowerCase().includes(cfg.titleEn.toLowerCase()));
    if (matched) {
      onSelectService(matched);
    } else {
      onSelectService({
        id: cfg.id,
        name: `${cfg.titleEn} (${cfg.titleGu})`,
        category: 'general',
        description: cfg.descEn,
        fee: parseInt(cfg.fee.replace(/[^0-9]/g, ''), 10) || 100,
        processingTime: cfg.badgeEn,
        requiredDocuments: ['Aadhaar Card', 'Passport Photograph / Relevant details'],
        enabled: true,
        department: 'Shiv Computer Citizen Services',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar with iPhone glossy styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 rounded-full bg-linear-to-b from-blue-600 to-amber-400" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{language === 'gu' ? 'મુખ્ય સેવાઓ (શિવ કમ્પ્યુટર)' : 'Core Center Services'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/40">
                10 Services
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-4">
            {language === 'gu'
              ? 'રોયલ બ્લૂ અને પીળા એક્સેન્ટ સાથેના પ્રીમિયમ ગ્લાસ કાર્ડ્સ. અરજી કરવા માટે કોઈપણ સેવા પર ક્લિક કરો.'
              : 'Premium glossy iPhone-style service cards with yellow highlights. Tap any service to apply.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs text-blue-700 dark:text-blue-300 font-medium">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>{language === 'gu' ? 'ત્વરિત અરજી અને પ્રોસેસિંગ' : 'Instant Center Assistance'}</span>
        </div>
      </div>

      {/* 10 Services Grid (Blue + White Gloss + Bright Yellow Accent) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
        {coreServicesConfig.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(item);
                }
              }}
              className="service-gloss-card p-4 flex flex-col justify-between cursor-pointer group select-none text-left"
            >
              {/* Top Bar: Icon + Yellow Accent Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0 relative overflow-hidden">
                    {/* Top specular reflection */}
                    <div className="absolute top-0 inset-x-0 h-1/2 bg-linear-to-b from-white/35 to-transparent pointer-events-none" />
                    <Icon className="w-5 h-5 text-white relative z-10" />
                  </div>

                  {/* Bright Yellow Accent Tag */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {language === 'gu' ? item.badgeGu : item.badgeEn}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                  {language === 'gu' ? item.titleGu : item.titleEn}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {language === 'gu' ? item.descGu : item.descEn}
                </p>
              </div>

              {/* Bottom Row: Fee & Action */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    {language === 'gu' ? 'શુલ્ક' : 'Fee'}
                  </span>
                  <span className="text-xs font-extrabold text-blue-700 dark:text-sky-300">
                    {item.fee}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-sky-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <span>{language === 'gu' ? 'અરજી કરો' : 'Apply'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickServiceCards;
