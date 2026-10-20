/**
 * Nikola Race: A Grande Corrida
 * Tipos e interfaces principais do jogo
 */

export type ScreenState = 
  | 'TITLE_MENU'
  | 'SELECT_TRACK'
  | 'SELECT_LAPS'
  | 'READY_TO_START'
  | 'LETTER'
  | 'RACING'
  | 'PAUSED'
  | 'RESULTS';

export type TrackId = 'city' | 'desert' | 'forest';

export interface TrackConfig {
  id: TrackId;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  bgColor: string;
  roadColor: string;
  curbColorA: string;
  curbColorB: string;
  width: number;
  height: number;
  targetLengthMultiplier: number;
  icon: string;
}

export type LapCountOption = 2 | 4 | 6;

export interface LapOptionConfig {
  laps: LapCountOption;
  label: string;
  targetTime: string;
  description: string;
  icon: string;
}

export type RacerId = 'nikola' | 'rafael' | 'hevila';

export interface RacerProfile {
  id: RacerId;
  name: string;
  role: 'player' | 'bot';
  tagline: string;
  carNumber: number;
  carName: string;
  carColorPrimary: string;
  carColorSecondary: string;
  carColorAccent: string;
  avatarEmoji: string;
  description: string;
}

export interface Waypoint {
  x: number;
  y: number;
  radius?: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'cone' | 'hydrant' | 'puddle' | 'cactus' | 'rock' | 'tumbleweed' | 'log' | 'boost';
  label?: string;
  respawnTime?: number;
}

export interface SceneryItem {
  x: number;
  y: number;
  type: 'tree' | 'building' | 'cactus_large' | 'rock_large' | 'tent' | 'flower' | 'lightpost' | 'bridge';
  variant?: number;
  size?: number;
}

export interface CarState {
  id: RacerId;
  name: string;
  isPlayer: boolean;
  x: number;
  y: number;
  angle: number; // in radians
  speed: number;
  maxSpeed: number;
  acceleration: number;
  braking: number;
  turnSpeed: number;
  reverseMaxSpeed: number;
  width: number;
  height: number;
  currentLap: number;
  lapProgress: number; // continuous checkpoint progress
  nextCheckpointIndex: number;
  totalDistance: number;
  isOffroad: boolean;
  boostTimer: number;
  spinTimer: number;
  stuckTimer: number;
  obstacleHitCooldown: number;
  driftTrail: Array<{ x: number; y: number; alpha: number }>;
  finishTime: number | null;
  position: number; // 1, 2, or 3
}

export interface RaceResult {
  racerId: RacerId;
  name: string;
  position: number;
  timeFormatted: string;
  timeMs: number;
  isPlayer: boolean;
}

export interface RaceState {
  trackId: TrackId;
  totalLaps: LapCountOption;
  state: 'countdown' | 'racing' | 'finished';
  countdownValue: number; // 3, 2, 1, 0 (0 is "VAI!")
  elapsedTimeMs: number;
  cars: Record<RacerId, CarState>;
  standings: RacerId[];
  isCompleted: boolean;
  winnerId: RacerId | null;
  results: RaceResult[];
}
