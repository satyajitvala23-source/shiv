import React from 'react';

export const DynamicGlassBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-gradient-to-b from-[#f0f6ff] via-white to-[#f8fbff] dark:from-[#030914] dark:via-[#071120] dark:to-[#020617]"
    >
      {/* Royal / Digital Blue primary ambient aura */}
      <div className="absolute -top-[10%] -left-[8%] w-[55vw] h-[55vw] max-w-[680px] max-h-[680px] rounded-full bg-gradient-to-br from-blue-600/18 via-sky-500/12 to-transparent blur-3xl dynamic-blob-1 transform-gpu" />

      {/* Bright Yellow secondary accent glow (as per branding reference) */}
      <div className="absolute top-[18%] -right-[10%] w-[45vw] h-[45vw] max-w-[540px] max-h-[540px] rounded-full bg-gradient-to-bl from-amber-400/15 via-yellow-300/10 to-transparent blur-3xl dynamic-blob-2 transform-gpu" />

      {/* Deep Royal Blue supporting ambient depth */}
      <div className="absolute -bottom-[10%] left-[20%] w-[52vw] h-[52vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-tr from-blue-700/14 via-sky-400/10 to-transparent blur-3xl dynamic-blob-3 transform-gpu" />

      {/* Subtle floating gold/yellow micro-glow */}
      <div className="absolute top-[60%] right-[15%] w-72 h-72 rounded-full bg-yellow-400/8 blur-2xl dynamic-float-slow transform-gpu" />

      {/* Geometric iPhone-style concentric rings for subtle tactile depth */}
      <div className="absolute top-[15%] left-[26%] w-80 h-80 rounded-full border border-blue-400/15 dark:border-blue-300/10 dynamic-float-slow" />
      <div className="absolute bottom-[20%] right-[16%] w-96 h-96 rounded-full border border-amber-400/20 dark:border-amber-300/10 dynamic-float-reverse" />

      {/* Glossy specular dot matrix pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(37,99,235,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:28px_28px] opacity-80" />
    </div>
  );
};
