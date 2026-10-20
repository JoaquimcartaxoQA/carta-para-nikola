/**
 * Nikola Race: A Grande Corrida
 * Contagem Regressiva Visual e Animada: 3... 2... 1... VAI!
 */

import React from 'react';

interface CountdownOverlayProps {
  value: number; // 3, 2, 1, or 0 (0 = "VAI!")
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ value }) => {
  if (value < 0) return null;

  const isGo = value === 0;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
      <div className="text-center animate-bounce">
        {isGo ? (
          <div className="bg-emerald-500 text-slate-950 font-cartoon font-black text-6xl sm:text-8xl md:text-9xl px-8 py-4 sm:px-12 sm:py-6 rounded-3xl border-8 border-white shadow-2xl ring-8 ring-emerald-500/50">
            🏁 VAI, NIKOLA! 🏎️
          </div>
        ) : (
          <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-amber-400 text-slate-950 font-cartoon font-black text-7xl sm:text-9xl flex items-center justify-center border-8 border-white shadow-2xl ring-8 ring-amber-400/50">
            {value}
          </div>
        )}
      </div>
    </div>
  );
};
