/**
 * Nikola Race: A Grande Corrida
 * Menu Principal com exatamente os 3 botões de ação exigidos:
 * 1. Começar corrida
 * 2. Carta para Nikola
 * 3. Exit
 */

import React from 'react';
import { RACER_PROFILES } from '../game/physics';
import { sound } from '../services/audio';
import { Play, Heart, LogOut, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface MainMenuViewProps {
  onStartRace: () => void;
  onOpenLetter: () => void;
  onExit: () => void;
}

export const MainMenuView: React.FC<MainMenuViewProps> = ({
  onStartRace,
  onOpenLetter,
  onExit,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleToggleMute = () => {
    const nextState = sound.toggleMute();
    setIsMuted(nextState);
  };

  return (
    <div className="menu-viewport relative w-full flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white overflow-y-auto">
      
      {/* Luzes de fundo e pista estilizada */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-red-600 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-blue-600 blur-3xl" />
      </div>

      {/* Barra Superior Discreta (Som / Mudo) */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800 text-xs font-cartoon text-slate-300">
          <span>🏁 Jogo de Corrida Infantil</span>
          <span>·</span>
          <span>Natal, RN</span>
        </div>

        <button
          onClick={handleToggleMute}
          aria-label="Alternar áudio"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-cartoon text-slate-200 transition shadow cursor-pointer"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-red-400" />
              <span>Som Desligado</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Som Ligado</span>
            </>
          )}
        </button>
      </div>

      {/* ÁREA CENTRAL: LOGOTIPO OFICIAL + ÍCONE + 3 BOTÕES DE AÇÃO */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-4xl mx-auto py-6">
        
        {/* Ícone Original do Jogo com N + Carro Cartunesco */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-red-600 to-indigo-900 p-1 shadow-2xl animate-pulse">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center overflow-hidden border-2 border-amber-400">
              <img
                src={`${import.meta.env.BASE_URL}icon.svg`}
                alt="Ícone Nikola Race"
                className="w-full h-full object-contain p-2 transform group-hover:scale-110 transition duration-300"
              />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-red-600 text-white font-cartoon text-[11px] font-black px-2 py-0.5 rounded-full border border-white shadow">
            #1
          </div>
        </div>

        {/* LOGOTIPO COM O NOME NIKOLA EM LETRAS GRANDES E DIVERTIDAS */}
        <div className="mb-2">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-cartoon font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-500 to-yellow-300 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] filter">
            NIKOLA RACE
          </h1>
          <div className="text-xl sm:text-3xl font-cartoon font-extrabold text-white tracking-widest uppercase flex items-center justify-center gap-2 mt-1">
            <span className="text-amber-400">🏁</span>
            <span>A Grande Corrida</span>
            <span className="text-amber-400">🏁</span>
          </div>
        </div>

        <p className="text-slate-300 font-cartoon text-sm sm:text-base max-w-md mx-auto mb-8">
          Acelere com <strong className="text-amber-400">Nikola Cartaxo</strong> na corrida mais divertida do mundo contra <strong className="text-white">Papai Rafael</strong> e <strong className="text-pink-400">Mamãe Hevila</strong>!
        </p>

        {/* ==================================================== */}
        {/* OS EXATOS TRÊS BOTÕES DE AÇÃO DO MENU PRINCIPAL */}
        {/* ==================================================== */}
        <div className="w-full max-w-md flex flex-col gap-4">
          
          {/* BOTÃO 1 — COMEÇAR CORRIDA */}
          <button
            onClick={() => {
              sound.playButton();
              onStartRace();
            }}
            className="group relative w-full py-5 px-8 rounded-3xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-slate-950 font-cartoon font-black text-2xl sm:text-3xl shadow-[0_10px_25px_rgba(16,185,129,0.4)] border-4 border-emerald-300 transition-all flex items-center justify-center gap-4 cursor-pointer btn-cartoon"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center text-2xl group-hover:rotate-12 transition">
              🏎️
            </div>
            <span>Começar corrida</span>
            <Play className="w-7 h-7 fill-slate-950 ml-auto" />
          </button>

          {/* BOTÃO 2 — CARTA PARA NIKOLA */}
          <button
            onClick={() => {
              sound.playButton();
              onOpenLetter();
            }}
            className="group relative w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-cartoon font-black text-xl sm:text-2xl shadow-xl border-4 border-amber-300 transition-all flex items-center justify-center gap-3 cursor-pointer btn-cartoon"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/30 flex items-center justify-center text-xl group-hover:scale-125 transition">
              ❤️
            </div>
            <span>Carta para Nikola</span>
            <Heart className="w-6 h-6 fill-slate-950 text-slate-950 ml-auto" />
          </button>

          {/* BOTÃO 3 — EXIT */}
          <button
            onClick={() => {
              sound.playButton();
              onExit();
            }}
            className="group relative w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-cartoon font-bold text-lg border-2 border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer btn-cartoon"
          >
            <LogOut className="w-5 h-5" />
            <span>Exit</span>
          </button>

        </div>

      </div>

      {/* RODAPÉ DO MENU: OS 3 PILOTOS OFICIAIS */}
      <div className="relative z-10 w-full max-w-4xl mx-auto pt-4 border-t border-slate-800/80">
        <div className="text-[11px] font-cartoon text-slate-400 uppercase tracking-widest text-center mb-3 font-bold">
          Os 3 Competidores Oficiais
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Piloto 1: Nikola Cartaxo */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/60 to-slate-900 border-2 border-red-500/60 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-2xl">
              🏎️
            </div>
            <div className="text-left">
              <div className="font-cartoon font-black text-sm text-red-400 flex items-center gap-1.5">
                <span>Nikola Cartaxo</span>
                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-mono">#1</span>
              </div>
              <div className="text-xs text-slate-300 font-cartoon">
                Jogador Principal (Falcão Veloz)
              </div>
            </div>
          </div>

          {/* Piloto 2: Papai Rafael */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-900 border-2 border-amber-600/60 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600/30 border border-amber-500 flex items-center justify-center text-2xl">
              🪓
            </div>
            <div className="text-left">
              <div className="font-cartoon font-black text-sm text-amber-400 flex items-center gap-1.5">
                <span>Papai Rafael</span>
                <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-mono">#2</span>
              </div>
              <div className="text-xs text-slate-300 font-cartoon">
                Bot Lenhador (Tronco Turbo 4x4)
              </div>
            </div>
          </div>

          {/* Piloto 3: Mamãe Hevila */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/60 to-slate-900 border-2 border-pink-500/60 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pink-600/30 border border-pink-500 flex items-center justify-center text-2xl">
              🌸
            </div>
            <div className="text-left">
              <div className="font-cartoon font-black text-sm text-pink-400 flex items-center gap-1.5">
                <span>Mamãe Hevila</span>
                <span className="text-[10px] bg-pink-600 text-white px-1.5 py-0.2 rounded font-mono">#3</span>
              </div>
              <div className="text-xs text-slate-300 font-cartoon">
                Bot Charmosa (Rosa Relâmpago Retrô)
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] font-cartoon text-slate-500 mt-3">
          Criado com muito carinho por Tio Joaquim para Nikola Cartaxo
        </div>
      </div>

    </div>
  );
};
