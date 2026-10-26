/**
 * Nikola Race: A Grande Corrida
 * Componente principal da corrida em 2D com Game Loop a 60 FPS, Canvas e Controles
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TrackId, LapCountOption, CarState, RacerId, RaceResult } from '../types/game';
import { getTrackData, TrackData } from '../game/trackData';
import { GameRenderer } from '../game/renderer';
import {
  createInitialCarState,
  updatePhysics,
  PlayerControls,
} from '../game/physics';
import { sound } from '../services/audio';
import { buildRaceResults } from '../game/raceResults';
import { togglePauseState } from '../game/pause';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';
import { CountdownOverlay } from './CountdownOverlay';
import { PauseModal } from './PauseModal';
import { getCanvasPixelRatio } from '../game/viewport';

interface RaceCanvasProps {
  trackId: TrackId;
  totalLaps: LapCountOption;
  onFinishRace: (results: RaceResult[], winnerId: RacerId, totalTimeMs: number) => void;
  onMainMenu: () => void;
}

export const RaceCanvas: React.FC<RaceCanvasProps> = ({
  trackId,
  totalLaps,
  onFinishRace,
  onMainMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  // Estados reativos
  const [countdown, setCountdown] = useState<number>(3); // 3, 2, 1, 0, -1 (active)
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);
  const [nikolaState, setNikolaState] = useState<CarState | null>(null);
  const [standings, setStandings] = useState<RacerId[]>(['nikola', 'rafael', 'hevila']);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Referências mutáveis para loop de 60fps sem re-renderizar desnecessariamente
  const carsRef = useRef<Record<RacerId, CarState> | null>(null);
  const trackDataRef = useRef<TrackData>(getTrackData(trackId));
  const controlsRef = useRef<PlayerControls>({
    up: false,
    down: false,
    left: false,
    right: false,
    honk: false,
  });

  const lastFrameTimeRef = useRef<number>(performance.now());
  const elapsedMsRef = useRef<number>(0);
  const raceStartedRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const isFinishedRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);
  const countdownTimersRef = useRef<NodeJS.Timeout[]>([]);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    countdownTimersRef.current.forEach((t) => clearTimeout(t));
    countdownTimersRef.current = [];
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
  }, []);

  // Inicializa dados da pista e carros
  const initRace = useCallback(() => {
    clearAllTimers();
    controlsRef.current = {
      up: false,
      down: false,
      left: false,
      right: false,
      honk: false,
    };
    const trackData = getTrackData(trackId);
    trackDataRef.current = trackData;
    const initialCars = createInitialCarState(trackData, totalLaps);
    carsRef.current = initialCars;
    setNikolaState({ ...initialCars.nikola });
    setStandings(['nikola', 'rafael', 'hevila']);
    setCountdown(3);
    raceStartedRef.current = false;
    isFinishedRef.current = false;
    elapsedMsRef.current = 0;
    setElapsedTimeMs(0);
    lastFrameTimeRef.current = performance.now();
  }, [trackId, totalLaps, clearAllTimers]);

  // Sequência de Contagem Regressiva: 3... 2... 1... VAI!
  const startCountdown = useCallback(() => {
    clearAllTimers();
    sound.stopEngine();

    // 3
    sound.playCountdown(3);
    setCountdown(3);

    // 2
    const t2 = setTimeout(() => {
      sound.playCountdown(2);
      setCountdown(2);
    }, 1000);

    // 1
    const t1 = setTimeout(() => {
      sound.playCountdown(1);
      setCountdown(1);
    }, 2000);

    // VAI! (0)
    const t0 = setTimeout(() => {
      sound.playGo();
      setCountdown(0);
      raceStartedRef.current = true;
      sound.startEngine();
    }, 3000);

    // Some o overlay de VAI após 1.2s
    const tHide = setTimeout(() => {
      setCountdown(-1);
    }, 4200);

    countdownTimersRef.current = [t2, t1, t0, tHide];
  }, [clearAllTimers]);

  // Detecção de toque
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  // Iniciar corrida no mount
  useEffect(() => {
    initRace();
    startCountdown();

    return () => {
      clearAllTimers();
      sound.stopEngine();
    };
  }, [initRace, startCountdown, clearAllTimers]);

  // Controles de Teclado (WASD e Setas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          controlsRef.current.up = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          controlsRef.current.down = true;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          controlsRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          controlsRef.current.right = true;
          break;
        case ' ':
        case 'h':
        case 'H':
          sound.playHonk();
          controlsRef.current.honk = true;
          break;
        case 'Escape':
        case 'p':
        case 'P':
          handleTogglePause();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          controlsRef.current.up = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          controlsRef.current.down = false;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          controlsRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          controlsRef.current.right = false;
          break;
        case ' ':
        case 'h':
        case 'H':
          controlsRef.current.honk = false;
          break;
      }
    };

    const handleBlur = () => {
      // Limpa todas as teclas se a janela perder o foco
      controlsRef.current = {
        up: false,
        down: false,
        left: false,
        right: false,
        honk: false,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Redimensionamento do Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rendererRef.current = new GameRenderer(canvas);

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      rendererRef.current?.resize(width, height, getCanvasPixelRatio(window.devicePixelRatio || 1));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    const parent = canvas.parentElement;
    const resizeObserver = parent && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(handleResize)
      : null;
    if (parent) resizeObserver?.observe(parent);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, []);

  // Loop de Jogo Principal (60 FPS com clamp de delta time)
  useEffect(() => {
    lastFrameTimeRef.current = performance.now();

    const loop = (time: number) => {
      const rawDt = (time - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = time;

      // Clamp delta time para evitar teletransporte ao alternar abas
      const delta = Math.min(rawDt, 0.05);

      if (!isPausedRef.current && carsRef.current) {
        if (raceStartedRef.current && !isFinishedRef.current) {
          elapsedMsRef.current += delta * 1000;
        }

        // Atualizar física
        const { updatedCars, standings: currentStandings } = updatePhysics(
          carsRef.current,
          raceStartedRef.current ? controlsRef.current : { up: false, down: false, left: false, right: false, honk: false },
          trackDataRef.current,
          totalLaps,
          elapsedMsRef.current,
          delta,
          raceStartedRef.current
        );

        carsRef.current = updatedCars;

        // Renderizar frame no Canvas
        if (rendererRef.current && canvasRef.current) {
          rendererRef.current.render(
            trackDataRef.current,
            updatedCars,
            updatedCars.nikola,
            delta
          );
        }

        // Sincronizar dados leves para o HUD com frequência reduzida
        if (Math.random() < 0.3) {
          setNikolaState({ ...updatedCars.nikola });
          setStandings([...currentStandings]);
          setElapsedTimeMs(elapsedMsRef.current);
        }

        // Exibir resultados somente depois que todos concluírem a corrida
        const allRacersFinished = (['nikola', 'rafael', 'hevila'] as RacerId[])
          .every((id) => updatedCars[id].finishTime !== null);
        if (allRacersFinished && !isFinishedRef.current) {
          isFinishedRef.current = true;
          sound.stopEngine();

          const results: RaceResult[] = buildRaceResults(updatedCars);
          const winner = results[0];

          finishTimeoutRef.current = setTimeout(() => {
            if (winner.racerId === 'nikola') {
              sound.playVictoryFanfare();
            }
            onFinishRace(results, winner.racerId, winner.timeMs);
          }, 1800);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      clearAllTimers();
      sound.stopEngine();
    };
  }, [totalLaps, onFinishRace, clearAllTimers]);

  // Controles de Toque
  const handleControlChange = (action: keyof PlayerControls, active: boolean) => {
    controlsRef.current[action] = active;
  };

  const handleHonk = () => {
    sound.playHonk();
  };

  // Alternar Pausa
  const handleTogglePause = () => {
    const nextPaused = togglePauseState(isPausedRef);
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;
    if (nextPaused) {
      sound.stopEngine();
    } else {
      if (raceStartedRef.current) {
        sound.startEngine();
      }
    }
  };

  const handleRestart = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    sound.stopEngine();
    initRace();
    startCountdown();
  };

  return (
    <div className="game-viewport relative w-full overflow-hidden bg-slate-950 select-none">
      
      {/* HTML5 Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-default"
      />

      {/* Overlay de Contagem Regressiva (3... 2... 1... VAI!) */}
      <CountdownOverlay value={countdown} />

      {/* HUD da Corrida (Posição, Voltas, Cronômetro, Áudio, Pausa) */}
      {nikolaState && (
        <HUD
          nikola={nikolaState}
          standings={standings}
          totalLaps={totalLaps}
          elapsedTimeMs={elapsedTimeMs}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onHonk={handleHonk}
          trackName={trackDataRef.current.config.name}
        />
      )}

      {/* Controles de Toque para Mobile e Tablet - Sempre prontos para Nikola acelerar! */}
      {!isPaused && (
        <TouchControls
          onControlChange={handleControlChange}
          onHonk={handleHonk}
        />
      )}

      {/* Modal de Pausa */}
      {isPaused && (
        <PauseModal
          onResume={handleTogglePause}
          onRestart={handleRestart}
          onMainMenu={onMainMenu}
        />
      )}

    </div>
  );
};
