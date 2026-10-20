/**
 * Nikola Race: A Grande Corrida
 * Física dos carros, colisões e IA dos bots Papai Rafael e Mamãe Hevila.
 */

import { CarState, RacerId, RacerProfile, LapCountOption, Waypoint } from '../types/game';
import { TrackData } from './trackData';
import { sound } from '../services/audio';

export const RACER_PROFILES: Record<RacerId, RacerProfile> = {
  nikola: {
    id: 'nikola',
    name: 'Nikola Cartaxo',
    role: 'player',
    tagline: 'O Super Piloto Trapaceiro do Bem!',
    carNumber: 1,
    carName: 'Falcão Veloz #1',
    carColorPrimary: '#18181b', // Preto elegante cartunesco
    carColorSecondary: '#dc2626', // Listras vermelhas esportivas
    carColorAccent: '#f59e0b', // Dourado
    avatarEmoji: '🏎️',
    description: 'Rápido, travesso e com muita energia! Pilota o clássico carro preto com faixas vermelhas.',
  },
  rafael: {
    id: 'rafael',
    name: 'Papai Rafael',
    role: 'bot',
    tagline: 'O Lenhador Veloz da Aventura!',
    carNumber: 2,
    carName: 'Tronco Turbo 4x4 #2',
    carColorPrimary: '#78350f', // Madeira nobre
    carColorSecondary: '#16a34a', // Verde aventura
    carColorAccent: '#ea580c', // Laranja rústico
    avatarEmoji: '🪓',
    description: 'Lenhador forte com seu jipe robusto de madeira maciça e rodas para qualquer terreno.',
  },
  hevila: {
    id: 'hevila',
    name: 'Mamãe Hevila',
    role: 'bot',
    tagline: 'A Piloto Charmosa e Radiante!',
    carNumber: 3,
    carName: 'Rosa Relâmpago Retrô #3',
    carColorPrimary: '#ec4899', // Rosa vibrante
    carColorSecondary: '#f43f5e', // Rosa choque
    carColorAccent: '#fef08a', // Amarelo suave
    avatarEmoji: '🌸',
    description: 'Elegante, super carinhosa e muito rápida com seu clássico conversível rosa.',
  },
};

export interface PlayerControls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  honk: boolean;
}

export function createInitialCarState(trackData: TrackData, totalLaps: LapCountOption): Record<RacerId, CarState> {
  // Ajuste de velocidade base conforme quantidade de voltas (para manter proporção agradável)
  // 2 voltas: ~3.8-4.2 kmh eq, 4 voltas e 6 voltas com velocidade equilibrada
  const baseSpeed = totalLaps === 2 ? 8.2 : totalLaps === 4 ? 8.5 : 8.8;

  const startingGrid = trackData.startingGrid;

  const createCar = (id: RacerId, gridIndex: number, isPlayer: boolean): CarState => ({
    id,
    name: RACER_PROFILES[id].name,
    isPlayer,
    x: startingGrid[gridIndex].x,
    y: startingGrid[gridIndex].y,
    angle: startingGrid[gridIndex].angle,
    speed: 0,
    maxSpeed: baseSpeed,
    acceleration: 0.18,
    braking: 0.25,
    turnSpeed: 0.048,
    reverseMaxSpeed: -3.5,
    width: 32,
    height: 54,
    currentLap: 1,
    lapProgress: 0,
    nextCheckpointIndex: 1,
    totalDistance: 0,
    isOffroad: false,
    boostTimer: 0,
    spinTimer: 0,
    stuckTimer: 0,
    obstacleHitCooldown: 0,
    driftTrail: [],
    finishTime: null,
    position: gridIndex + 1,
  });

  return {
    nikola: createCar('nikola', 0, true),
    rafael: createCar('rafael', 1, false),
    hevila: createCar('hevila', 2, false),
  };
}

// Distância mínima de um ponto a um segmento de reta
function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Verifica se um carro está fora da pista
function checkIsOffroad(x: number, y: number, trackData: TrackData): boolean {
  const waypoints = trackData.waypoints;
  const halfRoad = trackData.roadWidth / 2 + 10;
  let minDistance = Infinity;

  for (let i = 0; i < waypoints.length; i++) {
    const nextIdx = (i + 1) % waypoints.length;
    const dist = distanceToSegment(x, y, waypoints[i].x, waypoints[i].y, waypoints[nextIdx].x, waypoints[nextIdx].y);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return minDistance > halfRoad;
}

export function updatePhysics(
  cars: Record<RacerId, CarState>,
  controls: PlayerControls,
  trackData: TrackData,
  totalLaps: LapCountOption,
  elapsedTimeMs: number,
  delta: number, // em segundos (~0.016)
  isRaceStarted: boolean = false,
  onLapComplete?: (racerId: RacerId, lap: number) => void
): { updatedCars: Record<RacerId, CarState>; standings: RacerId[] } {
  const racerIds: RacerId[] = ['nikola', 'rafael', 'hevila'];
  const waypoints = trackData.waypoints;
  const startingGrid = trackData.startingGrid;

  // 0. Se a largada ainda não foi dada (contagem 3... 2... 1...), NENHUM carro se move!
  // Carros permanecem travados no grid de largada oficial
  if (!isRaceStarted) {
    cars.nikola.x = startingGrid[0].x;
    cars.nikola.y = startingGrid[0].y;
    cars.nikola.angle = startingGrid[0].angle;
    cars.nikola.speed = 0;
    cars.nikola.currentLap = 1;
    cars.nikola.lapProgress = 0;
    cars.nikola.nextCheckpointIndex = 1;
    cars.nikola.finishTime = null;
    cars.nikola.position = 1;

    cars.rafael.x = startingGrid[1].x;
    cars.rafael.y = startingGrid[1].y;
    cars.rafael.angle = startingGrid[1].angle;
    cars.rafael.speed = 0;
    cars.rafael.currentLap = 1;
    cars.rafael.lapProgress = 0;
    cars.rafael.nextCheckpointIndex = 1;
    cars.rafael.finishTime = null;
    cars.rafael.position = 2;

    cars.hevila.x = startingGrid[2].x;
    cars.hevila.y = startingGrid[2].y;
    cars.hevila.angle = startingGrid[2].angle;
    cars.hevila.speed = 0;
    cars.hevila.currentLap = 1;
    cars.hevila.lapProgress = 0;
    cars.hevila.nextCheckpointIndex = 1;
    cars.hevila.finishTime = null;
    cars.hevila.position = 3;

    return { updatedCars: cars, standings: ['nikola', 'rafael', 'hevila'] };
  }

  // 1. Atualizar Nikola (Jogador Principal)
  const nikola = cars.nikola;
  if (!nikola.finishTime) {
    updateNikola(nikola, controls, trackData, delta);
  }

  // 2. Atualizar Bots com IA determinística adaptativa
  // Adiciona um pequeno atraso de reação cartunesco nos primeiros 500ms para Nikola arrancar primeiro!
  const botCanMove = elapsedTimeMs >= 500;
  const rafael = cars.rafael;
  if (!rafael.finishTime) {
    if (botCanMove) {
      updateBot(rafael, nikola, trackData, 'rafael', totalLaps, delta);
    } else {
      rafael.speed = 0;
    }
  }

  const hevila = cars.hevila;
  if (!hevila.finishTime) {
    if (botCanMove) {
      updateBot(hevila, nikola, trackData, 'hevila', totalLaps, delta);
    } else {
      hevila.speed = 0;
    }
  }

  // 3. Colisões com Obstáculos e Boosts
  racerIds.forEach((id) => {
    const car = cars[id];
    if (car.finishTime) return;

    // Redução de timers
    if (car.boostTimer > 0) car.boostTimer = Math.max(0, car.boostTimer - delta);
    if (car.spinTimer > 0) car.spinTimer = Math.max(0, car.spinTimer - delta);
    if (car.obstacleHitCooldown > 0) car.obstacleHitCooldown = Math.max(0, car.obstacleHitCooldown - delta);

    // Efeito de derrapagem (adiciona rastro quando em velocidade alta e virando)
    if (Math.abs(car.speed) > 4 && Math.random() < 0.4) {
      car.driftTrail.push({ x: car.x, y: car.y, alpha: 0.6 });
      if (car.driftTrail.length > 25) {
        car.driftTrail.shift();
      }
    }
    // Fade out nos rastros existentes
    car.driftTrail.forEach((p) => (p.alpha = Math.max(0, p.alpha - delta * 0.4)));
    car.driftTrail = car.driftTrail.filter((p) => p.alpha > 0.05);

    // Colisão com pista / grama
    car.isOffroad = checkIsOffroad(car.x, car.y, trackData);
    if (car.isOffroad && car.boostTimer <= 0) {
      car.speed *= Math.pow(0.96, delta * 60);
    }

    // Colisão com obstáculos com cooldown de 1 segundo para evitar loops infinitos
    if (car.obstacleHitCooldown <= 0) {
      for (const obs of trackData.obstacles) {
        const dist = Math.hypot(car.x - obs.x, car.y - obs.y);
        if (dist < obs.radius + 16) {
          if (obs.type === 'boost') {
            car.boostTimer = 2.0;
            car.speed = car.maxSpeed * 1.5;
            car.obstacleHitCooldown = 1.2;
            if (car.isPlayer) {
              sound.playBoost();
            }
          } else if (obs.type === 'puddle') {
            car.spinTimer = 0.35;
            car.speed = Math.max(2.8, car.speed * 0.72);
            car.obstacleHitCooldown = 1.2;
            if (car.isPlayer) {
              sound.playCrash();
            }
          } else {
            // Cone, cactus, rock, log
            car.speed = Math.max(2.8, car.speed * 0.68);
            car.obstacleHitCooldown = 1.0;
            if (car.isPlayer) {
              sound.playCrash();
            }
          }
          break; // Trata um obstáculo por vez
        }
      }
    }

    // Recuperação automática de segurança (se o carro ficar travado por 1.5s)
    const currentTargetWp = waypoints[car.nextCheckpointIndex];
    if (Math.abs(car.speed) < 1.2) {
      car.stuckTimer += delta;
      if (car.stuckTimer > 1.5) {
        const rescueAngle = Math.atan2(currentTargetWp.y - car.y, currentTargetWp.x - car.x);
        car.angle = rescueAngle;
        car.speed = car.maxSpeed * 0.6;
        car.spinTimer = 0;
        car.stuckTimer = 0;
        car.obstacleHitCooldown = 1.5;
      }
    } else {
      car.stuckTimer = 0;
    }

    // 4. Progresso de Checkpoints e Voltas
    updateCarLap(car, nikola, waypoints, trackData, totalLaps, elapsedTimeMs, onLapComplete);
  });

  // 5. Colisão simples entre carros (Bumper car)
  for (let i = 0; i < racerIds.length; i++) {
    for (let j = i + 1; j < racerIds.length; j++) {
      const c1 = cars[racerIds[i]];
      const c2 = cars[racerIds[j]];
      const dist = Math.hypot(c1.x - c2.x, c1.y - c2.y);
      if (dist < 32) {
        const angle = Math.atan2(c2.y - c1.y, c2.x - c1.x);
        c1.x -= Math.cos(angle) * 3;
        c1.y -= Math.sin(angle) * 3;
        c2.x += Math.cos(angle) * 3;
        c2.y += Math.sin(angle) * 3;
        if (c1.isPlayer || c2.isPlayer) {
          sound.playCrash();
        }
      }
    }
  }

  // 6. Calcular posições atuais (1º, 2º, 3º)
  const sorted = [...racerIds].sort((a, b) => {
    const carA = cars[a];
    const carB = cars[b];

    // Se completou a corrida, tempo final define colocação
    if (carA.finishTime !== null && carB.finishTime !== null) {
      return carA.finishTime - carB.finishTime;
    }
    if (carA.finishTime !== null) return -1;
    if (carB.finishTime !== null) return 1;

    // Caso contrário, pontuação baseada em volta + progresso contínuo
    const scoreA = carA.currentLap * 10000 + carA.lapProgress;
    const scoreB = carB.currentLap * 10000 + carB.lapProgress;
    return scoreB - scoreA;
  });

  sorted.forEach((id, index) => {
    cars[id].position = index + 1;
  });

  return { updatedCars: cars, standings: sorted };
}

function updateNikola(car: CarState, controls: PlayerControls, trackData: TrackData, delta: number) {
  // Aceleração e Frenagem
  const maxSpd = car.boostTimer > 0 ? car.maxSpeed * 1.5 : car.maxSpeed;

  if (controls.up) {
    car.speed = Math.min(maxSpd, car.speed + car.acceleration * (delta * 60));
  } else if (controls.down) {
    if (car.speed > 0.5) {
      car.speed = Math.max(0, car.speed - car.braking * (delta * 60));
    } else {
      car.speed = Math.max(car.reverseMaxSpeed, car.speed - car.acceleration * 0.7 * (delta * 60));
    }
  } else {
    // Atrito natural
    car.speed *= Math.pow(0.98, delta * 60);
    if (Math.abs(car.speed) < 0.05) car.speed = 0;
  }

  // Direção
  if (Math.abs(car.speed) > 0.1) {
    const dir = car.speed >= 0 ? 1 : -1;
    if (controls.left) {
      car.angle -= car.turnSpeed * dir * (delta * 60);
    }
    if (controls.right) {
      car.angle += car.turnSpeed * dir * (delta * 60);
    }
  }

  // Rodopio temporário se caiu em poça
  if (car.spinTimer > 0) {
    car.angle += 0.2;
  }

  // Movimento no espaço
  car.x += Math.cos(car.angle) * car.speed * (delta * 60);
  car.y += Math.sin(car.angle) * car.speed * (delta * 60);

  // Limite das bordas do mundo
  car.x = Math.max(50, Math.min(trackData.config.width - 50, car.x));
  car.y = Math.max(50, Math.min(trackData.config.height - 50, car.y));

  // Modula o ronco do motor com base na velocidade
  sound.updateEngine(Math.abs(car.speed) / car.maxSpeed);
}

function updateBot(
  bot: CarState,
  nikola: CarState,
  trackData: TrackData,
  botType: 'rafael' | 'hevila',
  totalLaps: LapCountOption,
  delta: number
) {
  const waypoints = trackData.waypoints;
  const targetWp = waypoints[bot.nextCheckpointIndex];

  // Cálculo de ângulo até o próximo ponto com pequeno desvio para não andarem em fila indiana perfeita
  const lateralOffset = botType === 'rafael' ? -8 : 8;
  const angleToTarget = Math.atan2(targetWp.y - bot.y, targetWp.x - bot.x);
  const perpAngle = angleToTarget + Math.PI / 2;
  const targetX = targetWp.x + Math.cos(perpAngle) * lateralOffset;
  const targetY = targetWp.y + Math.sin(perpAngle) * lateralOffset;

  const desiredAngle = Math.atan2(targetY - bot.y, targetX - bot.x);

  let angleDiff = desiredAngle - bot.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  const steerRate = bot.turnSpeed * 1.15 * (delta * 60);
  bot.angle += Math.max(-steerRate, Math.min(steerRate, angleDiff));

  // Inteligência adaptativa infantil (Rubber-banding amigável para Nikola):
  // O jogo foi feito para uma criança de 6 anos! Nikola deve ter disputas alegres e sempre vencer!
  const isLastLap = nikola.currentLap >= totalLaps;
  const distToNikola = Math.hypot(bot.x - nikola.x, bot.y - nikola.y);

  // Velocidade de cruzeiro base
  let targetSpeed = bot.maxSpeed * (botType === 'rafael' ? 0.82 : 0.78);

  const botScore = bot.currentLap * 10000 + bot.lapProgress;
  const nikolaScore = nikola.currentLap * 10000 + nikola.lapProgress;

  if (isLastLap) {
    // Na última volta, os bots NUNCA ultrapassam Nikola e NUNCA chegam em 1º!
    if (botScore >= nikolaScore - 200 || distToNikola < 220) {
      targetSpeed = Math.min(targetSpeed, Math.max(2.5, bot.maxSpeed * 0.72));
    }
  } else {
    // Em voltas normais:
    // Se o bot estiver à frente de Nikola, alivia imediatamente para Nikola ultrapassar!
    if (botScore >= nikolaScore) {
      targetSpeed = Math.min(3.2, targetSpeed);
    } else if (distToNikola < 300) {
      // Quando Nikola está na frente, o bot persegue próximo para dar emoção de corrida
      targetSpeed = Math.min(targetSpeed, Math.max(3.2, bot.maxSpeed * 0.68));
    }
  }

  // Redução suave em curvas
  if (Math.abs(angleDiff) > 0.5) {
    targetSpeed *= 0.75;
  }

  if (bot.speed < targetSpeed) {
    bot.speed = Math.min(targetSpeed, bot.speed + bot.acceleration * (delta * 60));
  } else {
    bot.speed = Math.max(targetSpeed, bot.speed - bot.braking * (delta * 60));
  }

  // Movimento
  bot.x += Math.cos(bot.angle) * bot.speed * (delta * 60);
  bot.y += Math.sin(bot.angle) * bot.speed * (delta * 60);
}

function updateCarLap(
  car: CarState,
  nikola: CarState,
  waypoints: Waypoint[],
  trackData: TrackData,
  totalLaps: LapCountOption,
  elapsedTimeMs: number,
  onLapComplete?: (racerId: RacerId, lap: number) => void
) {
  const currentTargetWp = waypoints[car.nextCheckpointIndex];
  const dist = Math.hypot(car.x - currentTargetWp.x, car.y - currentTargetWp.y);

  // Checkpoint atingido (140px de raio de captura)
  if (dist < 140) {
    const prevIndex = car.nextCheckpointIndex;
    car.nextCheckpointIndex = (car.nextCheckpointIndex + 1) % waypoints.length;

    // Conclusão de volta: ocorre quando o carro passa pelo Waypoint 0 (a Linha de Chegada)
    // tendo completado a volta anterior (prevIndex === 0)
    if (prevIndex === 0) {
      if (car.isPlayer) {
        if (car.currentLap < totalLaps) {
          car.currentLap += 1;
          sound.playLapChime();
          if (onLapComplete) {
            onLapComplete(car.id, car.currentLap);
          }
        } else {
          // Nikola cruzou a linha de chegada na última volta: Vitória!
          if (car.finishTime === null) {
            car.finishTime = elapsedTimeMs;
            sound.playVictoryFanfare();
          }
        }
      } else {
        // Para Bots (Papai Rafael e Mamãe Hevila):
        // Bots só podem avançar de volta se Nikola já estiver nessa volta ou à frente!
        // E bots NUNCA podem cruzar a linha final antes de Nikola!
        if (nikola.finishTime !== null) {
          // Nikola já venceu! Bots cruzam a linha de chegada logo após Nikola
          if (car.finishTime === null) {
            car.finishTime = car.id === 'rafael' ? nikola.finishTime + 1400 : nikola.finishTime + 2600;
            car.currentLap = totalLaps;
          }
        } else {
          // Nikola ainda não completou a corrida
          if (car.currentLap < nikola.currentLap) {
            car.currentLap += 1;
          }
          // Se o bot já está na mesma volta de Nikola, o bot aguarda Nikola na reta final
        }
      }
    }
  }

  // Cálculo contínuo do progresso da volta (0 a 1000) sem queda abrupta antes da linha de chegada
  // Se nextCheckpointIndex === 0, o carro está na reta final indo em direção à linha de chegada (Waypoint 0)
  const targetWp = waypoints[car.nextCheckpointIndex];
  const prevWpIndex = (car.nextCheckpointIndex - 1 + waypoints.length) % waypoints.length;
  const prevWp = waypoints[prevWpIndex];
  const segmentLength = Math.hypot(targetWp.x - prevWp.x, targetWp.y - prevWp.y) || 1;
  const distToTarget = Math.hypot(targetWp.x - car.x, targetWp.y - car.y);
  const segmentFraction = Math.max(0, Math.min(1, 1 - distToTarget / segmentLength));

  const effectiveCheckpointNumber = car.nextCheckpointIndex === 0
    ? waypoints.length - 1 + segmentFraction
    : (car.nextCheckpointIndex - 1) + segmentFraction;

  car.lapProgress = Math.max(0, Math.min(1000, (effectiveCheckpointNumber / waypoints.length) * 1000));
}
