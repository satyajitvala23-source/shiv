import React from 'react';

interface BrandLogoProps {
  brandName: string;
  tagline: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brandName, tagline }) => {
  return (
    <div id="shiv-computer-branding" className="flex flex-col items-center text-center select-none">
      {/* Visual Logo Emblem */}
      <div className="relative mb-3 flex items-center justify-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
            {/* Subtle circuit lines background */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px]" />
            
            {/* Monogram Icon */}
            <svg
              className="w-8 h-8 text-sky-400 relative z-10 drop-shadow-sm"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Computer Monitor Silhouette */}
              <rect x="3" y="4" width="26" height="17" rx="2.5" stroke="currentColor" strokeWidth="2" />
              <path d="M12 25H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 21V25" stroke="currentColor" strokeWidth="2" />
              {/* Inner stylized SC monogram / terminal prompt */}
              <path
                d="M9 12.5C9 10.5 10.5 9 12.5 9C14.5 9 15.5 10.2 15.5 11.2C15.5 13.5 9.5 13 9.5 15.5C9.5 16.8 10.8 17.5 12.5 17.5C14.2 17.5 15.5 16.5 15.5 16.5"
                stroke="#67e8f9"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M23 10.5C22.2 9.6 20.8 9 19.5 9C17.5 9 16.5 10.5 16.5 13.25C16.5 16 17.5 17.5 19.5 17.5C21 17.5 22.2 16.7 23 15.8"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Ambient status light */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
        </span>
      </div>

      {/* Brand Title */}
      <h1 id="brand-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-2">
        <span>{brandName}</span>
      </h1>
      
      {/* Tagline */}
      <p id="brand-tagline" className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-xs">
        {tagline}
      </p>
    </div>
  );
};
