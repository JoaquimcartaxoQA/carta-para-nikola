/**
 * Nikola Race: A Grande Corrida
 * HUD (Display de Corrida) minimalista e sem obstrução da pista
 */

import React from 'react';
import { RacerId, CarState } from '../types/game';
import { RACER_PROFILES } from '../game/physics';
import { Volume2, VolumeX, Pause, Play, Flag, Clock } from 'lucide-react';
import { sound } from '../services/audio';

interface HUDProps {
  nikola: CarState;
  standings: RacerId[];
  totalLaps: number;
  elapsedTimeMs: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onHonk: () => void;
  trackName: string;
}

export const HUD: React.FC<HUDProps> = ({
  nikola,
  standings,
  totalLaps,
  elapsedTimeMs,
  isPaused,
  onTogglePause,
  onHonk,
  trackName,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleToggleMute = () => {
    const newState = sound.toggleMute();
    setIsMuted(newState);
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${tenths}`;
  };

  const positionLabels = ['1º', '2º', '3º'];
  const currentPosLabel = positionLabels[Math.min(2, Math.max(0, nikola.position - 1))];

  return (
    <div className="game-hud absolute inset-0 pointer-events-none flex flex-col justify-between">
      
      {/* Top Bar HUD: Posição, Volta, Tempo, Som, Pausa */}
      <div className="flex items-center justify-between gap-2">
        
        {/* Posição de Nikola em Destaque */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 border-2 border-amber-400 rounded-2xl px-3 sm:px-4 py-1.5 shadow-lg">
          <div className="text-2xl sm:text-3xl font-cartoon font-black text-amber-400">
            {currentPosLabel}
          </div>
          <div className="text-left">
            <div className="text-[10px] sm:text-xs font-cartoon text-slate-400 font-bold uppercase">
              Posição
            </div>
            <div className="text-xs sm:text-sm font-cartoon font-bold text-white flex items-center gap-1">
              <span>🏎️ Nikola</span>
            </div>
          </div>
        </div>

        {/* Volta e Cronômetro (Centro) */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-900/90 border-2 border-slate-700 rounded-2xl px-3 sm:px-5 py-1.5 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-cartoon font-bold text-white">
            <Flag className="w-4 h-4 text-emerald-400" />
            <span>Volta {Math.min(totalLaps, nikola.currentLap)}/{totalLaps}</span>
          </div>

          <span className="text-slate-600">|</span>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold text-amber-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTime(elapsedTimeMs)}</span>
          </div>
        </div>

        {/* Ordem dos 3 competidores ao vivo */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 rounded-2xl px-3 py-1 shadow-lg">
          {standings.map((id, index) => {
            const prof = RACER_PROFILES[id];
            const isMe = id === 'nikola';
            return (
              <div
                key={id}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-cartoon font-bold ${
                  isMe ? 'bg-red-600 text-white' : 'text-slate-300'
                }`}
              >
                <span>{index + 1}º</span>
                <span>{prof.avatarEmoji}</span>
                <span>{prof.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>

        {/* Controles do Topo (Mudo / Pausa) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            aria-label="Alternar áudio"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-200 transition shadow-lg cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          <button
            onClick={onTogglePause}
            aria-label="Pausar corrida"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-200 transition shadow-lg cursor-pointer"
          >
            {isPaused ? <Play className="w-5 h-5 text-amber-400 fill-amber-400" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Alerta de Velocidade / Turbo (se Nikola pegou boost) */}
      {nikola.boostTimer > 0 && (
        <div className="self-center bg-amber-500 text-slate-950 px-5 py-1.5 rounded-full font-cartoon font-black text-sm sm:text-base animate-pulse shadow-xl border-2 border-white">
          ⚡ SUPER TURBO NIKOLA! ⚡
        </div>
      )}

      {/* Alerta de Fora da Pista (amigável) */}
      {nikola.isOffroad && (
        <div className="self-center bg-orange-600 text-white px-4 py-1 rounded-full font-cartoon font-bold text-xs sm:text-sm shadow-lg">
          🌱 Volte para a pista para acelerar tudo!
        </div>
      )}

      {/* Rodapé vazio para não cobrir pista ou controles touch */}
      <div />

    </div>
  );
};
