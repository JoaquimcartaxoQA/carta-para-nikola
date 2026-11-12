import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ResultsModal } from '../src/components/ResultsModal';
import { buildRaceResults, shouldShowNikolaVictory } from '../src/game/raceResults';
import { createInitialCarState } from '../src/game/physics';
import { getTrackData } from '../src/game/trackData';
import '../src/index.css';

function PodiumFixture() {
  const [action, setAction] = useState('');
  const won = new URLSearchParams(location.search).get('winner') === 'nikola';
  const cars = createInitialCarState(getTrackData('city'), 2);
  cars.nikola.finishTime = won ? 3000 : 5700;
  if (!won) {
    cars.rafael.finishTime = 3200;
    cars.hevila.finishTime = 4800;
  }
  const results = buildRaceResults(cars);
  return action ? <p role="status">{action}</p> : (
    <ResultsModal results={results} winnerId={shouldShowNikolaVictory(cars) ? 'nikola' : results[0].racerId}
      totalLaps={2} totalTimeMs={cars.nikola.finishTime} trackName="Cidade"
      onPlayAgain={() => setAction('Nova corrida')} onMainMenu={() => setAction('Menu aberto')} />
  );
}

createRoot(document.getElementById('root')!).render(<PodiumFixture />);
