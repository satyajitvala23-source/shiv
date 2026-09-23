import React from 'react';

interface BrandLogoProps {
  brandName: string;
  tagline: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brandName, tagline }) => {
  return (
    <div id="shiv-computer-branding" className="flex flex-col items-center text-center select-none">
      {/* Visual Logo Emblem - iPhone Glossy Glass Specular Squircle */}
      <div className="relative mb-3 flex items-center justify-center group cursor-pointer">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-0.5 shadow-xl shadow-blue-600/25 flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
          {/* Specular gloss top reflection */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-2xl" />

          <div className="w-full h-full bg-gradient-to-b from-[#0b1b36] to-[#040d1a] rounded-[14px] flex items-center justify-center relative overflow-hidden">
            {/* Ambient subtle circuit grid */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:6px_6px]" />

            {/* Glowing yellow micro-flare in the corner */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400/20 blur-xs" />

            {/* Stylized Computer Monitor / SC monogram */}
            <svg
              className="w-8 h-8 text-white relative z-10 drop-shadow-md"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Computer Monitor Silhouette */}
              <rect x="3" y="4" width="26" height="17" rx="2.5" stroke="url(#logo-grad)" strokeWidth="2.2" />
              <path d="M12 25H20" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M16 21V25" stroke="#93c5fd" strokeWidth="2" />

              {/* Center screen display */}
              <rect x="6" y="7" width="20" height="11" rx="1" fill="#1e3a8a" fillOpacity="0.4" />

              {/* Stylized SC curves with Yellow Accent */}
              <path
                d="M10 12.5C10 11 11.2 10 12.8 10C14.5 10 15.5 11 15.5 12C15.5 14 10.5 13.5 10.5 15.5C10.5 16.6 11.5 17.5 13 17.5C14.5 17.5 15.5 16.5 15.5 16.5"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="21" cy="13.5" r="2.2" fill="#facc15" />

              <defs>
                <linearGradient id="logo-grad" x1="3" y1="4" x2="29" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#93c5fd" />
                  <stop offset="1" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Ambient status light with Bright Yellow Glowing Dot */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 border-2 border-white shadow-xs shadow-amber-500/50" />
        </span>
      </div>

      {/* Brand Title: Professional Royal Blue & White with bright yellow dot accent */}
      <h1 id="brand-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
        <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-400 dark:via-sky-300 dark:to-white bg-clip-text text-transparent">
          {brandName}
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400/60 inline-block align-middle" />
      </h1>

      {/* Tagline */}
      <p id="brand-tagline" className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1 max-w-xs flex items-center justify-center gap-1.5">
        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 font-bold">
          Digital Gujarat & CSC
        </span>
        <span className="text-slate-400">·</span>
        <span>{tagline}</span>
      </p>
    </div>
  );
};
