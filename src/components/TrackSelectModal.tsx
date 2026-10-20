/**
 * Nikola Race: A Grande Corrida
 * Fluxo de Preparação da Corrida:
 * Etapa 1: Escolher Cenário (Cidade, Deserto Route 66, Floresta)
 * Etapa 2: Escolher Quantidade de Voltas (2, 4, 6 voltas)
 * Etapa 3: Iniciar Corrida
 */

import React, { useState } from 'react';
import { TrackId, LapCountOption } from '../types/game';
import { TRACK_CONFIGS } from '../game/trackData';
import { RACER_PROFILES } from '../game/physics';
import { sound } from '../services/audio';
import { ArrowLeft, Clock, Flag, Sparkles, Play, Check } from 'lucide-react';

interface TrackSelectModalProps {
  onStartRace: (trackId: TrackId, laps: LapCountOption) => void;
  onBack: () => void;
}

export const TrackSelectModal: React.FC<TrackSelectModalProps> = ({ onStartRace, onBack }) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackId>('city');
  const [selectedLaps, setSelectedLaps] = useState<LapCountOption>(2);
  const [step, setStep] = useState<1 | 2>(1);

  const handleSelectTrack = (trackId: TrackId) => {
    sound.playButton();
    setSelectedTrack(trackId);
    setStep(2);
  };

  const handleSelectLaps = (laps: LapCountOption) => {
    sound.playButton();
    setSelectedLaps(laps);
  };

  const handleStart = () => {
    sound.playButton();
    onStartRace(selectedTrack, selectedLaps);
  };

  const lapOptions: Array<{ laps: LapCountOption; time: string; desc: string; icon: string }> = [
    { laps: 2, time: '~4 min', desc: 'Corrida Rápida e Divertida', icon: '⚡' },
    { laps: 4, time: '~5 min', desc: 'Super Disputa Eletrizante', icon: '🏆' },
    { laps: 6, time: '~6 min', desc: 'Grande Campeonato dos Campeões', icon: '👑' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto rounded-3xl bg-slate-900 border-4 border-amber-400 p-5 sm:p-8 shadow-2xl text-white">
        
        {/* Barra de Progresso das Etapas */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <button
            onClick={() => {
              sound.playButton();
              if (step === 2) {
                setStep(1);
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-cartoon text-sm sm:text-base transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{step === 2 ? 'Trocar Cenário' : 'Voltar ao Menu'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-cartoon ${step === 1 ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' : 'bg-emerald-600 text-white'}`}>
              Etapa 1: Cenário
            </span>
            <span className="text-slate-600">→</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-cartoon ${step === 2 ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' : 'bg-slate-800 text-slate-400'}`}>
              Etapa 2: Voltas
            </span>
          </div>
        </div>

        {/* ETAPA 1: ESCOLHER CENÁRIO */}
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-4xl font-cartoon font-black text-amber-400 flex items-center justify-center gap-2">
                <span>Escolha onde você quer correr!</span>
                <span>🏁</span>
              </h2>
              <p className="text-slate-300 font-cartoon text-sm sm:text-base mt-1">
                Toque no cenário que você mais gostar para Nikola acelerar:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Card 1: Cidade */}
              <div
                onClick={() => handleSelectTrack('city')}
                className={`relative rounded-3xl p-5 border-4 transition-all duration-200 cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between overflow-hidden ${
                  selectedTrack === 'city'
                    ? 'border-blue-400 bg-gradient-to-b from-blue-900/90 to-slate-900 ring-4 ring-blue-500/50'
                    : 'border-slate-700 bg-slate-800/80 hover:border-blue-500'
                }`}
              >
                <div className="text-center mb-3">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-4xl mb-3 shadow-inner">
                    🏙️
                  </div>
                  <h3 className="text-xl sm:text-2xl font-cartoon font-black text-white">
                    Cidade
                  </h3>
                  <div className="text-xs font-cartoon text-blue-300 font-bold mt-1">
                    Ruas e Prédios Coloridos
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-2xl p-3 text-xs sm:text-sm font-cartoon text-slate-300 space-y-1 mb-4">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span>Faixas de pedestres e semáforos</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Check className="w-4 h-4" />
                    <span>Cones e turbos de asfalto</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sky-400">
                    <Check className="w-4 h-4" />
                    <span>Praça central e curvas ágeis</span>
                  </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 font-cartoon font-black text-white text-base shadow-lg transition flex items-center justify-center gap-2">
                  <span>Escolher Cidade</span>
                  <span>🏎️</span>
                </button>
              </div>

              {/* Card 2: Deserto Route 66 */}
              <div
                onClick={() => handleSelectTrack('desert')}
                className={`relative rounded-3xl p-5 border-4 transition-all duration-200 cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between overflow-hidden ${
                  selectedTrack === 'desert'
                    ? 'border-orange-400 bg-gradient-to-b from-orange-950/90 to-slate-900 ring-4 ring-orange-500/50'
                    : 'border-slate-700 bg-slate-800/80 hover:border-orange-500'
                }`}
              >
                <div className="text-center mb-3">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center text-4xl mb-3 shadow-inner">
                    🌵
                  </div>
                  <h3 className="text-xl sm:text-2xl font-cartoon font-black text-white">
                    Deserto Route 66
                  </h3>
                  <div className="text-xs font-cartoon text-orange-300 font-bold mt-1">
                    Cânions, Cactos e Poeira
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-2xl p-3 text-xs sm:text-sm font-cartoon text-slate-300 space-y-1 mb-4">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span>Placas da famosa Rota 66</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Check className="w-4 h-4" />
                    <span>Montanhas e pedras gigantes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-400">
                    <Check className="w-4 h-4" />
                    <span>Retas longas sob o sol</span>
                  </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-cartoon font-black text-white text-base shadow-lg transition flex items-center justify-center gap-2">
                  <span>Escolher Deserto</span>
                  <span>🏜️</span>
                </button>
              </div>

              {/* Card 3: Floresta */}
              <div
                onClick={() => handleSelectTrack('forest')}
                className={`relative rounded-3xl p-5 border-4 transition-all duration-200 cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between overflow-hidden ${
                  selectedTrack === 'forest'
                    ? 'border-emerald-400 bg-gradient-to-b from-emerald-950/90 to-slate-900 ring-4 ring-emerald-500/50'
                    : 'border-slate-700 bg-slate-800/80 hover:border-emerald-500'
                }`}
              >
                <div className="text-center mb-3">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl mb-3 shadow-inner">
                    🌲
                  </div>
                  <h3 className="text-xl sm:text-2xl font-cartoon font-black text-white">
                    Floresta
                  </h3>
                  <div className="text-xs font-cartoon text-emerald-300 font-bold mt-1">
                    Árvores, Flores e Ponte
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-2xl p-3 text-xs sm:text-sm font-cartoon text-slate-300 space-y-1 mb-4">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span>Ponte de madeira sobre o riacho</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Check className="w-4 h-4" />
                    <span>Curvas sinuosas entre árvores</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-pink-400">
                    <Check className="w-4 h-4" />
                    <span>Flores coloridas e folhas</span>
                  </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-cartoon font-black text-white text-base shadow-lg transition flex items-center justify-center gap-2">
                  <span>Escolher Floresta</span>
                  <span>🌿</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 2: ESCOLHER VOLTAS E INICIAR */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-amber-400 font-cartoon font-bold text-sm mb-2">
                <span>Cenário Selecionado:</span>
                <span className="text-white text-base font-black">
                  {TRACK_CONFIGS[selectedTrack].icon} {TRACK_CONFIGS[selectedTrack].name}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-cartoon font-black text-amber-400">
                Quantas voltas você quer correr?
              </h2>
              <p className="text-slate-300 font-cartoon text-sm sm:text-base mt-1">
                Escolha o tamanho da corrida:
              </p>
            </div>

            {/* Opções de Voltas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {lapOptions.map((opt) => {
                const isSelected = selectedLaps === opt.laps;
                return (
                  <button
                    key={opt.laps}
                    onClick={() => handleSelectLaps(opt.laps)}
                    className={`p-5 rounded-3xl border-4 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 btn-cartoon ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-400/50 shadow-xl'
                        : 'border-slate-700 bg-slate-800/80 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-3xl">{opt.icon}</div>
                    <div className="text-3xl sm:text-4xl font-cartoon font-black text-white flex items-center gap-2">
                      <span>{opt.laps} Voltas</span>
                      <Flag className="w-6 h-6 text-amber-400" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 text-amber-300 font-cartoon text-xs sm:text-sm font-bold">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>{opt.time}</span>
                    </div>

                    <div className="text-xs font-cartoon text-slate-300">
                      {opt.desc}
                    </div>

                    {isSelected && (
                      <div className="mt-2 text-xs font-bold font-cartoon text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>Selecionado</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Visualização dos 3 Pilotos Fixos Confirmados */}
            <div className="bg-slate-950/80 rounded-2xl p-4 mb-6 border border-slate-800">
              <div className="text-xs font-cartoon text-slate-400 uppercase tracking-wider mb-2 text-center font-bold">
                Competidores Prontos na Linha de Largada
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/40">
                  <div className="text-2xl">🏎️</div>
                  <div className="font-cartoon font-black text-sm text-red-400">1º Nikola #1</div>
                  <div className="text-[10px] text-slate-400 font-cartoon">Você (Piloto)</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40">
                  <div className="text-2xl">🪓</div>
                  <div className="font-cartoon font-black text-sm text-amber-400">Papai Rafael #2</div>
                  <div className="text-[10px] text-slate-400 font-cartoon">Bot Lenhador</div>
                </div>
                <div className="p-2 rounded-xl bg-pink-950/40 border border-pink-500/40">
                  <div className="text-2xl">🌸</div>
                  <div className="font-cartoon font-black text-sm text-pink-400">Mamãe Hevila #3</div>
                  <div className="text-[10px] text-slate-400 font-cartoon">Bot Charmosa</div>
                </div>
              </div>
            </div>

            {/* ETAPA 3: BOTÃO DESTACADO PARA INICIAR CORRIDA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => {
                  sound.playButton();
                  setStep(1);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-cartoon font-bold text-base transition cursor-pointer"
              >
                ← Trocar Cenário
              </button>

              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-cartoon font-black text-xl sm:text-2xl shadow-xl border-2 border-emerald-300 transition flex items-center justify-center gap-3 cursor-pointer btn-cartoon ring-4 ring-emerald-500/40"
              >
                <Play className="w-7 h-7 fill-slate-950" />
                <span>INICIAR CORRIDA! 🏎️💨</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
