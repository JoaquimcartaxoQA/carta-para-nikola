/**
 * Nikola Race: A Grande Corrida
 * Modal amigável de encerramento do jogo
 */

import React from 'react';
import { XCircle, ArrowLeft, Heart, Smile } from 'lucide-react';
import { sound } from '../services/audio';

interface ExitModalProps {
  onClose: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({ onClose }) => {
  const tryExit = () => {
    sound.playButton();
    try {
      window.close();
    } catch {
      // Ignora se o navegador restringir window.close()
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-4 border-slate-700 p-6 sm:p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-3xl">
          👋
        </div>

        <h3 className="text-2xl sm:text-3xl font-cartoon font-black text-white mb-2">
          Até logo, Nikola!
        </h3>

        <p className="text-slate-300 font-cartoon text-base sm:text-lg mb-6 leading-relaxed">
          Você correu muito bem hoje, campeão!
          <br />
          Para sair do jogo:
        </p>

        <div className="bg-slate-800/80 rounded-2xl p-4 mb-6 border border-slate-700 text-left text-sm sm:text-base font-cartoon text-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">💻</span>
            <span><strong>No computador:</strong> Pode fechar esta janela.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📱</span>
            <span><strong>No celular/tablet:</strong> Toque no botão de Início ou deslize para cima para sair.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={tryExit}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-cartoon font-black text-lg shadow-lg transition flex items-center justify-center gap-2 cursor-pointer btn-cartoon"
          >
            <XCircle className="w-5 h-5" />
            <span>Fechar Jogo</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-cartoon font-black text-lg shadow-lg transition flex items-center justify-center gap-2 cursor-pointer btn-cartoon"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar e Correr Mais!</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-400 font-cartoon">
          <span>O Tio Joaquim te ama!</span>
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 inline" />
        </div>
      </div>
    </div>
  );
};
