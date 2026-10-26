import type { CarState, RaceResult, RacerId } from '../types/game';
import { RACER_PROFILES } from './physics';

const RACER_IDS: RacerId[] = ['nikola', 'rafael', 'hevila'];

function formatRaceTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((milliseconds % 1000) / 100);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}

export function buildRaceResults(cars: Record<RacerId, CarState>): RaceResult[] {
  const finishers = RACER_IDS.map((id) => cars[id]);
  if (finishers.some((car) => car.finishTime === null)) return [];

  return finishers
    .sort((a, b) => a.finishTime! - b.finishTime!)
    .map((car, index) => ({
      racerId: car.id,
      name: car.name,
      position: index + 1,
      timeFormatted: formatRaceTime(car.finishTime!),
      timeMs: car.finishTime!,
      isPlayer: car.isPlayer,
    }));
}
