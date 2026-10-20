/**
 * Nikola Race: A Grande Corrida
 * Modal de Pausa da Corrida
 */

import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { sound } from '../services/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 text-center text-white shadow-2xl">
        <div className="text-4xl mb-2">⏸️</div>
        
        <h3 className="text-3xl font-cartoon font-black text-amber-400 mb-1">
          Corrida Pausada
        </h3>
        <p className="text-slate-300 font-cartoon text-sm mb-6">
          Nikola parou para beber uma água no pit stop!
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              sound.playButton();
              onResume();
            }}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-cartoon font-black text-xl shadow-lg border-2 border-emerald-300 transition flex items-center justify-center gap-2 cursor-pointer btn-cartoon"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>Continuar Correndo!</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              onRestart();
            }}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-cartoon font-bold text-lg shadow-md border-2 border-amber-300 transition flex items-center justify-center gap-2 cursor-pointer btn-cartoon"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Recomeçar Corrida</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              onMainMenu();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-cartoon font-bold text-base transition flex items-center justify-center gap-2 cursor-pointer btn-cartoon"
          >
            <Home className="w-5 h-5" />
            <span>Menu Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
