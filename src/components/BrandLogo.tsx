import React, { useState } from 'react';

interface BrandLogoProps {
  brandName: string;
  tagline: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brandName, tagline, size = 'lg' }) => {
  const [imgError, setImgError] = useState(false);

  const containerSizes = {
    sm: 'w-12 h-12 rounded-xl p-1.5',
    md: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2',
    lg: 'w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-3xl p-3 sm:p-4',
  };

  return (
    <div id="shiv-computer-branding" className="flex flex-col items-center text-center select-none">
      {/* Visual Logo Emblem - Modern Glossy Glass Framed Presentation */}
      <div className="relative mb-4 flex items-center justify-center group cursor-pointer">
        <div
          className={`${containerSizes[size]} bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-blue-200/80 dark:border-white/20 shadow-2xl shadow-blue-600/20 flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/30`}
        >
          {/* Subtle top gloss reflection on glass container */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-linear-to-b from-white/60 dark:from-white/25 to-transparent pointer-events-none rounded-t-3xl z-10" />

          {/* Official Transparent Shiv Computer Logo Image */}
          {!imgError ? (
            <img
              src="/logo.png"
              alt="Shiv Computer Official Logo"
              className="w-full h-full object-contain relative z-5 transition-transform duration-300 drop-shadow-md"
              loading="eager"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-blue-700 to-sky-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl">
              <span>SC</span>
            </div>
          )}

          {/* Subtle bottom rim light */}
          <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-linear-to-r from-transparent via-blue-400/50 to-transparent pointer-events-none" />
        </div>

        {/* Ambient status light with Bright Yellow Glowing Accent */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-amber-400 border-2 border-white dark:border-slate-900 shadow-md shadow-amber-500/60" />
        </span>
      </div>

      {/* Brand Title: Professional Royal Blue & White with bright yellow dot accent */}
      <h1 id="brand-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
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
