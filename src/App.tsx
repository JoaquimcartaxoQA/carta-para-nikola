/**
 * Nikola Race: A Grande Corrida
 * Aplicativo Principal do Jogo de Corrida 2D para Nikola Cartaxo
 */

import React, { useState } from 'react';
import { TrackId, LapCountOption, RaceResult, RacerId } from './types/game';
import { TRACK_CONFIGS } from './game/trackData';
import { MainMenuView } from './components/MainMenuView';
import { TrackSelectModal } from './components/TrackSelectModal';
import { LetterModal } from './components/LetterModal';
import { ExitModal } from './components/ExitModal';
import { RaceCanvas } from './components/RaceCanvas';
import { ResultsModal } from './components/ResultsModal';
import { InstallPromptModal } from './components/InstallPromptModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Download } from 'lucide-react';

type AppView = 'MENU' | 'RACING';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('MENU');
  const [showTrackSelect, setShowTrackSelect] = useState<boolean>(false);
  const [showLetter, setShowLetter] = useState<boolean>(false);
  const [showExit, setShowExit] = useState<boolean>(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);

  // Configuração da corrida ativa
  const [selectedTrack, setSelectedTrack] = useState<TrackId>('city');
  const [selectedLaps, setSelectedLaps] = useState<LapCountOption>(2);
  const [raceKey, setRaceKey] = useState<number>(0);

  // Resultados
  const [raceResults, setRaceResults] = useState<RaceResult[] | null>(null);
  const [winnerId, setWinnerId] = useState<RacerId | null>(null);
  const [finalTimeMs, setFinalTimeMs] = useState<number>(0);

  const { isInstallable, isInstalled } = usePWAInstall();

  // Iniciar corrida com o cenário e voltas escolhidos
  const handleStartRace = (trackId: TrackId, laps: LapCountOption) => {
    setSelectedTrack(trackId);
    setSelectedLaps(laps);
    setShowTrackSelect(false);
    setRaceResults(null);
    setWinnerId(null);
    setFinalTimeMs(0);
    setRaceKey((prev) => prev + 1);
    setCurrentView('RACING');
  };

  // Corrida concluída
  const handleFinishRace = (results: RaceResult[], winner: RacerId, totalTimeMs: number) => {
    setRaceResults(results);
    setWinnerId(winner);
    setFinalTimeMs(totalTimeMs);
  };

  // Jogar novamente na mesma pista e voltas
  const handlePlayAgain = () => {
    setRaceResults(null);
    setWinnerId(null);
    setFinalTimeMs(0);
    setRaceKey((prev) => prev + 1);
    setCurrentView('RACING');
  };

  // Voltar ao menu principal
  const handleBackToMenu = () => {
    setRaceResults(null);
    setWinnerId(null);
    setFinalTimeMs(0);
    setCurrentView('MENU');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      
      {/* Botão sutil de Instalação Offline no Menu */}
      {currentView === 'MENU' && !isInstalled && (
        <button
          onClick={() => setShowInstallPrompt(true)}
          className="fixed top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-cartoon font-bold text-amber-300 transition shadow-lg cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Jogar Offline / Instalar</span>
        </button>
      )}

      {/* TELA 1: MENU PRINCIPAL */}
      {currentView === 'MENU' && (
        <MainMenuView
          onStartRace={() => setShowTrackSelect(true)}
          onOpenLetter={() => setShowLetter(true)}
          onExit={() => setShowExit(true)}
        />
      )}

      {/* TELA 2: CORRIDA 2D EM TEMPO REAL */}
      {currentView === 'RACING' && (
        <RaceCanvas
          key={raceKey}
          trackId={selectedTrack}
          totalLaps={selectedLaps}
          onFinishRace={handleFinishRace}
          onMainMenu={handleBackToMenu}
        />
      )}

      {/* MODAL ETAPAS DE PREPARAÇÃO DA CORRIDA (Cenários e Voltas) */}
      {showTrackSelect && (
        <TrackSelectModal
          onStartRace={handleStartRace}
          onBack={() => setShowTrackSelect(false)}
        />
      )}

      {/* MODAL CARTA DO TIO JOAQUIM PARA NIKOLA */}
      {showLetter && (
        <LetterModal
          onBack={() => setShowLetter(false)}
        />
      )}

      {/* MODAL EXIT */}
      {showExit && (
        <ExitModal
          onClose={() => setShowExit(false)}
        />
      )}

      {/* MODAL DE RESULTADOS / PÓDIO COM CONFETTI */}
      {raceResults && (
        <ResultsModal
          results={raceResults}
          winnerId={winnerId}
          totalLaps={selectedLaps}
          totalTimeMs={finalTimeMs}
          trackName={TRACK_CONFIGS[selectedTrack].name}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleBackToMenu}
        />
      )}

      {/* MODAL DE GUIA DE INSTALAÇÃO PWA / OFFLINE */}
      {showInstallPrompt && (
        <InstallPromptModal
          onClose={() => setShowInstallPrompt(false)}
        />
      )}

    </div>
  );
}
