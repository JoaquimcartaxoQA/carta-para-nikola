/**
 * Nikola Race: A Grande Corrida
 * Tela de Resultados e Pódio com comemoração e mensagens carinhosas.
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RaceResult, RacerId } from '../types/game';
import { RACER_PROFILES } from '../game/physics';
import { sound } from '../services/audio';
import { Trophy, RotateCcw, Home, Sparkles, Heart } from 'lucide-react';

interface ResultsModalProps {
  results: RaceResult[];
  winnerId: RacerId | null;
  totalLaps: number;
  totalTimeMs: number;
  trackName: string;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  results,
  winnerId,
  totalLaps,
  totalTimeMs,
  trackName,
  onPlayAgain,
  onMainMenu,
}) => {
  useEffect(() => {
    // Efeito de Confetes alegres comemorando a corrida de Nikola!
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ef4444', '#f59e0b', '#38bdf8', '#10b981', '#ec4899'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ef4444', '#f59e0b', '#38bdf8', '#10b981', '#ec4899'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  };

  const isNikolaWinner = winnerId === 'nikola';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-10 shadow-2xl text-center text-white">
        
        {/* Ícone de Troféu com Brilho */}
        <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-amber-400/20 border-4 border-amber-400 flex items-center justify-center text-5xl shadow-lg animate-bounce">
          🏆
        </div>

        {/* Título Principal de Comemoração */}
        <h2 className="text-3xl sm:text-5xl font-cartoon font-black text-amber-400 tracking-wide mb-1">
          {isNikolaWinner ? 'VITÓRIA DO NIKOLA! 🎉' : 'GRANDE CORRIDA! 🏁'}
        </h2>

        {/* Mensagem carinhosa e positiva para a criança */}
        <p className="text-lg sm:text-2xl font-cartoon text-emerald-400 font-bold mb-4">
          {isNikolaWinner
            ? 'Muito bem, Nikola! Você correu como um verdadeiro campeão! 🏎️💨'
            : 'Parabéns, Nikola! Foi uma corrida emocionante e cheia de diversão! ❤️'}
        </p>

        {/* Estatísticas da Corrida (Cenário, Voltas, Tempo) */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm font-cartoon text-slate-300 mb-6">
          <span>Pista: <strong className="text-white">{trackName}</strong></span>
          <span>·</span>
          <span>Voltas Concluídas: <strong className="text-white">{totalLaps} / {totalLaps}</strong></span>
          <span>·</span>
          <span>Tempo Final: <strong className="text-amber-300 font-mono">{formatTime(totalTimeMs)}</strong></span>
        </div>

        {/* PÓDIO DOS 3 COMPETIDORES (Nikola Cartaxo, Papai Rafael, Mamãe Hevila) */}
        <div className="space-y-3 mb-8">
          <div className="text-xs font-cartoon text-slate-400 uppercase tracking-wider font-bold">
            Classificação Final dos 3 Competidores
          </div>

          {results.map((res, index) => {
            const profile = RACER_PROFILES[res.racerId];
            const isNikola = res.racerId === 'nikola';
            const medal = index === 0 ? '🥇 1º Lugar' : index === 1 ? '🥈 2º Lugar' : '🥉 3º Lugar';
            const bgClass =
              index === 0
                ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/10 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-slate-800/60 border-slate-700';

            return (
              <div
                key={res.racerId}
                className={`p-3 sm:p-4 rounded-2xl border-2 flex items-center justify-between gap-3 text-left transition ${bgClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl sm:text-3xl">{profile.avatarEmoji}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cartoon font-black text-base sm:text-xl text-white">
                        {res.name}
                      </span>
                      {isNikola && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-cartoon text-[10px] sm:text-xs font-bold uppercase">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-cartoon text-slate-400">
                      {profile.carName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-cartoon font-black text-sm sm:text-base text-amber-300">
                    {medal}
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    {res.timeFormatted}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botões de Ação: Jogar Novamente & Menu Principal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              sound.playButton();
              onPlayAgain();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-slate-950 font-cartoon font-black text-lg sm:text-xl shadow-xl border-2 border-emerald-300 transition flex items-center justify-center gap-2 cursor-pointer btn-cartoon"
          >
            <RotateCcw className="w-6 h-6" />
            <span>Jogar Novamente!</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              onMainMenu();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-cartoon font-black text-lg sm:text-xl shadow-lg border-2 border-slate-600 transition flex items-center justify-center gap-2 cursor-pointer btn-cartoon"
          >
            <Home className="w-6 h-6" />
            <span>Menu Principal</span>
          </button>
        </div>

        {/* Mensagem final do Tio Joaquim */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-cartoon">
          <span>Com carinho do Tio Joaquim</span>
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 inline" />
        </div>

      </div>
    </div>
  );
};
