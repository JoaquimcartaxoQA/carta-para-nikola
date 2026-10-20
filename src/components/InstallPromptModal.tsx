/**
 * Nikola Race: A Grande Corrida
 * Guia e Botão de Instalação para Celular, Tablet e Computador (100% Offline)
 */

import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Monitor, Apple, CheckCircle2, X } from 'lucide-react';
import { sound } from '../services/audio';

interface InstallPromptModalProps {
  onClose: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleInstallClick = async () => {
    sound.playButton();
    await install();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-auto rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-8 text-white shadow-2xl">
        
        {/* Fechar */}
        <button
          onClick={() => {
            sound.playButton();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl">
            📲
          </div>
          <h3 className="text-2xl sm:text-3xl font-cartoon font-black text-amber-400">
            Instalar Nikola Race
          </h3>
          <p className="text-slate-300 font-cartoon text-sm sm:text-base mt-1">
            Jogue em qualquer lugar, <strong>100% offline e sem internet</strong>!
          </p>
        </div>

        {/* Status de Instalado ou Botão de Instalar Direto */}
        {isInstalled ? (
          <div className="bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
            <div className="text-left font-cartoon text-sm sm:text-base text-emerald-200">
              <strong>O jogo já está instalado no seu aparelho!</strong> Você pode abri-lo direto da tela inicial mesmo sem internet.
            </div>
          </div>
        ) : isInstallable ? (
          <div className="mb-6">
            <button
              onClick={handleInstallClick}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-cartoon font-black text-xl shadow-xl border-2 border-emerald-300 transition flex items-center justify-center gap-2 cursor-pointer btn-cartoon"
            >
              <Download className="w-6 h-6" />
              <span>Instalar Agora no Aparelho</span>
            </button>
          </div>
        ) : null}

        {/* Guia por Plataforma */}
        <div className="space-y-3 font-cartoon text-xs sm:text-sm text-slate-200 text-left">
          
          {/* Android */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
            <Smartphone className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm">No Celular Android (Chrome):</strong>
              <p className="text-slate-300 mt-0.5">
                Toque nos <strong>três pontinhos (⋮)</strong> no canto superior do navegador e escolha <strong>&quot;Instalar aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong>.
              </p>
            </div>
          </div>

          {/* iPhone / iPad */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
            <Apple className="w-6 h-6 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm">No iPhone / iPad (Safari):</strong>
              <p className="text-slate-300 mt-0.5">
                Toque no botão <strong>Compartilhar (ícone com quadrado e seta para cima)</strong> e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>.
              </p>
            </div>
          </div>

          {/* Computador / Windows / Mac */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-start gap-3">
            <Monitor className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm">No Computador (Chrome / Edge):</strong>
              <p className="text-slate-300 mt-0.5">
                Clique no ícone de <strong>instalar app</strong> na barra de endereços (ao lado da estrela de favoritos) para jogar em tela cheia como aplicativo de PC!
              </p>
            </div>
          </div>

        </div>

        <div className="mt-6">
          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-cartoon font-bold text-base transition cursor-pointer"
          >
            Entendi, vamos correr! 🏎️💨
          </button>
        </div>

      </div>
    </div>
  );
};
