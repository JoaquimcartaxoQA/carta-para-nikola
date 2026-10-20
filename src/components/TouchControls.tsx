/**
 * Nikola Race: A Grande Corrida
 * Controles de Toque na Tela para Celular e Tablet (Grandes, Coloridos e Intuitivos)
 */

import React from 'react';
import { PlayerControls } from '../game/physics';
import { sound } from '../services/audio';

interface TouchControlsProps {
  onControlChange: (action: keyof PlayerControls, active: boolean) => void;
  onHonk: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onControlChange, onHonk }) => {
  const handleButtonStart = (action: keyof PlayerControls, e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    onControlChange(action, true);
  };

  const handleButtonEnd = (action: keyof PlayerControls, e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    onControlChange(action, false);
  };

  const handleHonkPress = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    sound.playHonk();
    onHonk();
  };

  return (
    <div className="game-touch-controls absolute inset-x-0 pointer-events-none flex items-end justify-between select-none">
      
      {/* LADO ESQUERDO: DIREÇÃO (VIRAR ESQUERDA E DIREITA) */}
      <div className="touch-control-group pointer-events-auto flex items-center">
        <button
          onPointerDown={(e) => handleButtonStart('left', e)}
          onPointerUp={(e) => handleButtonEnd('left', e)}
          onPointerCancel={(e) => handleButtonEnd('left', e)}
          onPointerLeave={(e) => handleButtonEnd('left', e)}
          onTouchStart={(e) => handleButtonStart('left', e)}
          onTouchEnd={(e) => handleButtonEnd('left', e)}
          aria-label="Virar para a esquerda"
          className="touch-control-button w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 active:bg-blue-700 active:scale-90 text-white font-cartoon font-black text-2xl sm:text-3xl shadow-xl border-4 border-blue-400 flex items-center justify-center transition-transform select-none cursor-pointer"
        >
          ⬅️
        </button>

        <button
          onPointerDown={(e) => handleButtonStart('right', e)}
          onPointerUp={(e) => handleButtonEnd('right', e)}
          onPointerCancel={(e) => handleButtonEnd('right', e)}
          onPointerLeave={(e) => handleButtonEnd('right', e)}
          onTouchStart={(e) => handleButtonStart('right', e)}
          onTouchEnd={(e) => handleButtonEnd('right', e)}
          aria-label="Virar para a direita"
          className="touch-control-button w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 active:bg-blue-700 active:scale-90 text-white font-cartoon font-black text-2xl sm:text-3xl shadow-xl border-4 border-blue-400 flex items-center justify-center transition-transform select-none cursor-pointer"
        >
          ➡️
        </button>
      </div>

      {/* CENTRO: BOTÃO DE BUZINA CARTUNESCA */}
      <div className="pointer-events-auto pb-1">
        <button
          onPointerDown={handleHonkPress}
          onTouchStart={handleHonkPress}
          aria-label="Buzinar"
          className="touch-control-horn px-4 py-2 sm:px-5 sm:py-3 rounded-2xl bg-amber-400 active:bg-amber-500 active:scale-90 text-slate-950 font-cartoon font-black text-xs sm:text-sm shadow-xl border-2 border-amber-300 flex items-center gap-1.5 transition-transform select-none cursor-pointer"
        >
          <span className="text-xl sm:text-2xl">🎺</span>
          <span>Buzina!</span>
        </button>
      </div>

      {/* LADO DIREITO: PEDAL DE FREIO E PEDAL DE ACELERADOR */}
      <div className="touch-control-group pointer-events-auto flex items-center">
        {/* Frear / Ré */}
        <button
          onPointerDown={(e) => handleButtonStart('down', e)}
          onPointerUp={(e) => handleButtonEnd('down', e)}
          onPointerCancel={(e) => handleButtonEnd('down', e)}
          onPointerLeave={(e) => handleButtonEnd('down', e)}
          onTouchStart={(e) => handleButtonStart('down', e)}
          onTouchEnd={(e) => handleButtonEnd('down', e)}
          aria-label="Frear ou dar ré"
          className="touch-control-button w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-red-600 active:bg-red-700 active:scale-90 text-white font-cartoon font-black text-xs sm:text-sm shadow-xl border-4 border-red-400 flex flex-col items-center justify-center transition-transform select-none cursor-pointer"
        >
          <span className="text-xl sm:text-2xl">🛑</span>
          <span>FREAR</span>
        </button>

        {/* Acelerar */}
        <button
          onPointerDown={(e) => handleButtonStart('up', e)}
          onPointerUp={(e) => handleButtonEnd('up', e)}
          onPointerCancel={(e) => handleButtonEnd('up', e)}
          onPointerLeave={(e) => handleButtonEnd('up', e)}
          onTouchStart={(e) => handleButtonStart('up', e)}
          onTouchEnd={(e) => handleButtonEnd('up', e)}
          aria-label="Acelerar"
          className="touch-control-button touch-control-button--accelerate w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-500 active:bg-emerald-600 active:scale-90 text-slate-950 font-cartoon font-black text-sm sm:text-base shadow-2xl border-4 border-emerald-300 flex flex-col items-center justify-center transition-transform select-none cursor-pointer ring-4 ring-emerald-500/40"
        >
          <span className="text-2xl sm:text-3xl">⚡</span>
          <span>CORRER!</span>
        </button>
      </div>

    </div>
  );
};
