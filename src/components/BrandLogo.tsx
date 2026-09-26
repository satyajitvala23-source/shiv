import React, { useState } from 'react';

interface BrandLogoProps {
  brandName: string;
  tagline: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brandName, tagline, size = 'lg' }) => {
  const [imgError, setImgError] = useState(false);

  const containerSizes = {
    sm: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1',
    md: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1.5',
    lg: 'w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-3xl p-2 sm:p-3',
  };

  return (
    <div id="shiv-computer-branding" className="flex flex-col items-center text-center select-none">
      {/* Visual Logo Emblem - Modern Transparent & Fitted Presentation with incremented size */}
      <div className="relative mb-4 flex items-center justify-center group cursor-pointer">
        <div
          className={`${containerSizes[size]} bg-transparent flex items-center justify-center relative overflow-visible transition-all duration-300 group-hover:scale-105`}
        >
          {/* Official Transparent Shiv Computer Logo Image - Cleanly fitted without opaque square */}
          {!imgError ? (
            <img
              src="/logo.png"
              alt="Shiv Computer Official Logo"
              className="w-full h-full object-contain relative z-5 transition-transform duration-300 filter drop-shadow-xl drop-shadow-blue-600/25"
              loading="eager"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-blue-700 to-sky-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-500/30">
              <span>SC</span>
            </div>
          )}
        </div>

        {/* Ambient status light with Bright Yellow Glowing Accent */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-amber-400 border-2 border-white dark:border-slate-900 shadow-md shadow-amber-500/60" />
        </span>
      </div>

      {/* Brand Title: Professional Royal Blue & White with bright yellow dot accent */}
      <h1 id="brand-heading" className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
        <span className="bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-400 dark:via-sky-300 dark:to-white bg-clip-text text-transparent">
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
