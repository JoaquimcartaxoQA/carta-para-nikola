/**
 * Nikola Race: A Grande Corrida
 * Definição dos 3 cenários exclusivos com trajetos, obstáculos e cenários distintos.
 */

import { TrackConfig, TrackId, Obstacle, SceneryItem, Waypoint } from '../types/game';

export interface TrackData {
  config: TrackConfig;
  waypoints: Waypoint[];
  roadWidth: number;
  startLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    angle: number; // direction of travel
  };
  startingGrid: Array<{ x: number; y: number; angle: number }>;
  obstacles: Obstacle[];
  scenery: SceneryItem[];
  ambientColor: string;
}

export const TRACK_CONFIGS: Record<TrackId, TrackConfig> = {
  city: {
    id: 'city',
    name: 'Cidade Divertida',
    subtitle: 'Ruas, prédios coloridos e praças',
    description: 'Pista urbana veloz com prédios, semáforos alegres, faixas de pedestres e curvas emocionantes!',
    themeColor: '#3b82f6',
    bgColor: '#10b981', // Grama urbana
    roadColor: '#334155', // Asfalto escuro
    curbColorA: '#ef4444',
    curbColorB: '#ffffff',
    width: 3200,
    height: 2400,
    targetLengthMultiplier: 1.0,
    icon: '🏙️',
  },
  desert: {
    id: 'desert',
    name: 'Deserto Route 66',
    subtitle: 'Cactos, montanhas e poeira mágica',
    description: 'Aventura sob o sol com curvas em cânions de pedra, cactos gigantes e placas da famosa Rota 66!',
    themeColor: '#f97316',
    bgColor: '#fde047', // Areia dourada
    roadColor: '#57534e', // Estrada desértica
    curbColorA: '#f59e0b',
    curbColorB: '#ffffff',
    width: 3400,
    height: 2500,
    targetLengthMultiplier: 1.1,
    icon: '🌵',
  },
  forest: {
    id: 'forest',
    name: 'Floresta Encantada',
    subtitle: 'Árvores gigantes, flores e pontes de madeira',
    description: 'Caminho sinuoso entre bosques exuberantes, flores brilhantes e uma travessia por ponte de madeira!',
    themeColor: '#10b981',
    bgColor: '#14532d', // Bosque denso
    roadColor: '#78350f', // Terra batida / madeira
    curbColorA: '#84cc16',
    curbColorB: '#fef08a',
    width: 3200,
    height: 2400,
    targetLengthMultiplier: 1.05,
    icon: '🌲',
  },
};

// ==========================================
// PISTA 1: CIDADE (Trajeto Urbano com Praça Central e Chicanes)
// ==========================================
const cityWaypoints: Waypoint[] = [
  { x: 500, y: 1900 },  // Largada
  { x: 1000, y: 1900 },
  { x: 1600, y: 1900 },
  { x: 2300, y: 1900 },
  { x: 2700, y: 1800 },
  { x: 2800, y: 1500 }, // Curva 1 subindo
  { x: 2800, y: 1000 },
  { x: 2700, y: 600 },
  { x: 2400, y: 500 },  // Curva 2
  { x: 1900, y: 500 },
  { x: 1700, y: 700 },  // Chicane urbana descendo
  { x: 1500, y: 1000 }, // Em volta da praça
  { x: 1700, y: 1300 },
  { x: 2100, y: 1300 },
  { x: 2300, y: 1100 },
  { x: 2100, y: 800 },
  { x: 1500, y: 500 },  // Reta superior esquerda
  { x: 900, y: 500 },
  { x: 500, y: 650 },   // Curva 3 descendo
  { x: 450, y: 1100 },
  { x: 600, y: 1400 },  // Curva em S
  { x: 450, y: 1650 },
];

const cityObstacles: Obstacle[] = [
  // Cones e hidrantes em curvas e retas
  { id: 'c_boost_1', x: 1200, y: 1900, radius: 24, type: 'boost', label: 'TURBO!' },
  { id: 'c_cone_1', x: 2450, y: 1860, radius: 16, type: 'cone' },
  { id: 'c_cone_2', x: 2470, y: 1930, radius: 16, type: 'cone' },
  { id: 'c_puddle_1', x: 2800, y: 1250, radius: 26, type: 'puddle' },
  { id: 'c_hydrant_1', x: 2350, y: 460, radius: 20, type: 'hydrant' },
  { id: 'c_boost_2', x: 1600, y: 850, radius: 24, type: 'boost', label: 'TURBO!' },
  { id: 'c_puddle_2', x: 1900, y: 1320, radius: 26, type: 'puddle' },
  { id: 'c_cone_3', x: 1200, y: 530, radius: 16, type: 'cone' },
  { id: 'c_cone_4', x: 480, y: 850, radius: 16, type: 'cone' },
  { id: 'c_boost_3', x: 500, y: 1400, radius: 24, type: 'boost', label: 'TURBO!' },
];

const cityScenery: SceneryItem[] = [
  // Prédios ao redor e no centro
  { x: 700, y: 1650, type: 'building', variant: 1, size: 140 },
  { x: 1000, y: 1650, type: 'building', variant: 2, size: 160 },
  { x: 1300, y: 1650, type: 'building', variant: 3, size: 150 },
  { x: 800, y: 2150, type: 'building', variant: 1, size: 170 },
  { x: 1400, y: 2150, type: 'building', variant: 2, size: 180 },
  { x: 2000, y: 2150, type: 'building', variant: 3, size: 160 },
  { x: 2950, y: 1200, type: 'building', variant: 1, size: 190 },
  { x: 2950, y: 1600, type: 'building', variant: 2, size: 180 },
  { x: 2600, y: 300, type: 'building', variant: 3, size: 170 },
  { x: 2100, y: 300, type: 'building', variant: 1, size: 160 },
  { x: 1200, y: 300, type: 'building', variant: 2, size: 180 },
  { x: 700, y: 300, type: 'building', variant: 3, size: 150 },
  { x: 250, y: 800, type: 'building', variant: 1, size: 160 },
  { x: 250, y: 1300, type: 'building', variant: 2, size: 170 },
  // Árvores de praça urbana
  { x: 1850, y: 1050, type: 'tree', variant: 1, size: 55 },
  { x: 1950, y: 1100, type: 'tree', variant: 2, size: 50 },
  { x: 1750, y: 1050, type: 'flower', variant: 1, size: 35 },
  { x: 1100, y: 1100, type: 'tree', variant: 1, size: 60 },
  { x: 850, y: 900, type: 'tree', variant: 2, size: 65 },
  { x: 850, y: 1250, type: 'tree', variant: 1, size: 55 },
];

// ==========================================
// PISTA 2: DESERTO ROUTE 66 (Cânions, Cactos e Reta Veloz)
// ==========================================
const desertWaypoints: Waypoint[] = [
  { x: 600, y: 600 },   // Largada descendo em ângulo suave
  { x: 1200, y: 550 },
  { x: 1800, y: 600 },
  { x: 2400, y: 800 },  // Grande curva do Cânion
  { x: 2900, y: 1100 },
  { x: 3000, y: 1600 },
  { x: 2700, y: 2000 }, // Curva 2
  { x: 2200, y: 2100 },
  { x: 1600, y: 1850 }, // Desvio entre montanhas
  { x: 1200, y: 1550 },
  { x: 1500, y: 1200 }, // Gancho / Hairpin do Oasis
  { x: 1900, y: 1350 },
  { x: 2050, y: 1650 },
  { x: 1700, y: 2250 }, // Reta sul
  { x: 1000, y: 2250 },
  { x: 500, y: 2000 },  // Subida pelo deserto
  { x: 400, y: 1500 },
  { x: 500, y: 1000 },
];

const desertObstacles: Obstacle[] = [
  { id: 'd_boost_1', x: 1400, y: 570, radius: 24, type: 'boost', label: 'SUPER TURBO!' },
  { id: 'd_cactus_1', x: 2500, y: 850, radius: 20, type: 'cactus' },
  { id: 'd_rock_1', x: 2920, y: 1300, radius: 24, type: 'rock' },
  { id: 'd_tumble_1', x: 2500, y: 2060, radius: 18, type: 'tumbleweed' },
  { id: 'd_boost_2', x: 1400, y: 1700, radius: 24, type: 'boost', label: 'TURBO!' },
  { id: 'd_rock_2', x: 1350, y: 1300, radius: 22, type: 'rock' },
  { id: 'd_cactus_2', x: 1800, y: 1300, radius: 20, type: 'cactus' },
  { id: 'd_boost_3', x: 1350, y: 2250, radius: 24, type: 'boost', label: 'TURBO!' },
  { id: 'd_cactus_3', x: 420, y: 1750, radius: 20, type: 'cactus' },
  { id: 'd_tumble_2', x: 440, y: 1250, radius: 18, type: 'tumbleweed' },
];

const desertScenery: SceneryItem[] = [
  { x: 800, y: 350, type: 'rock_large', variant: 1, size: 160 },
  { x: 1500, y: 350, type: 'cactus_large', variant: 1, size: 90 },
  { x: 2200, y: 400, type: 'rock_large', variant: 2, size: 180 },
  { x: 3150, y: 800, type: 'rock_large', variant: 1, size: 210 },
  { x: 3150, y: 1400, type: 'cactus_large', variant: 2, size: 95 },
  { x: 3150, y: 1900, type: 'rock_large', variant: 2, size: 170 },
  { x: 2400, y: 1600, type: 'cactus_large', variant: 1, size: 85 },
  { x: 800, y: 1000, type: 'rock_large', variant: 1, size: 140 },
  { x: 950, y: 1800, type: 'cactus_large', variant: 2, size: 90 },
  { x: 650, y: 2400, type: 'rock_large', variant: 2, size: 150 },
  { x: 250, y: 600, type: 'cactus_large', variant: 1, size: 80 },
];

// ==========================================
// PISTA 3: FLORESTA ENCANTADA (Caminhos Floridos, Ponte de Madeira e Bosque)
// ==========================================
const forestWaypoints: Waypoint[] = [
  { x: 500, y: 1200 },  // Largada em reta de terra
  { x: 900, y: 1200 },
  { x: 1300, y: 1000 }, // Curva 1 subindo para a colina verde
  { x: 1600, y: 650 },
  { x: 2100, y: 600 },
  { x: 2500, y: 800 },
  { x: 2700, y: 1200 }, // Ponte de madeira
  { x: 2600, y: 1650 },
  { x: 2200, y: 1950 }, // Vale dos cogumelos
  { x: 1700, y: 1850 },
  { x: 1400, y: 1550 }, // Travessia central
  { x: 1100, y: 1850 },
  { x: 700, y: 2000 },
  { x: 450, y: 1700 },  // Volta à largada
];

const forestObstacles: Obstacle[] = [
  { id: 'f_boost_1', x: 1050, y: 1150, radius: 24, type: 'boost', label: 'SUPER TURBO!' },
  { id: 'f_log_1', x: 1450, y: 800, radius: 22, type: 'log' },
  { id: 'f_puddle_1', x: 2300, y: 680, radius: 26, type: 'puddle' },
  { id: 'f_boost_2', x: 2700, y: 1200, radius: 26, type: 'boost', label: 'TURBO DA PONTE!' },
  { id: 'f_log_2', x: 2450, y: 1800, radius: 22, type: 'log' },
  { id: 'f_puddle_2', x: 1950, y: 1920, radius: 26, type: 'puddle' },
  { id: 'f_boost_3', x: 1400, y: 1550, radius: 24, type: 'boost', label: 'TURBO!' },
  { id: 'f_log_3', x: 880, y: 1950, radius: 22, type: 'log' },
  { id: 'f_puddle_3', x: 410, y: 1450, radius: 24, type: 'puddle' },
];

const forestScenery: SceneryItem[] = [
  { x: 300, y: 950, type: 'tree', variant: 1, size: 90 },
  { x: 700, y: 950, type: 'tree', variant: 2, size: 85 },
  { x: 1100, y: 700, type: 'tree', variant: 1, size: 95 },
  { x: 1850, y: 400, type: 'tree', variant: 2, size: 100 },
  { x: 2350, y: 450, type: 'tree', variant: 1, size: 90 },
  { x: 2950, y: 900, type: 'tree', variant: 2, size: 110 },
  { x: 2950, y: 1500, type: 'tree', variant: 1, size: 105 },
  { x: 2700, y: 1200, type: 'bridge', variant: 1, size: 150 }, // Destaque da Ponte!
  { x: 2000, y: 1500, type: 'tree', variant: 2, size: 80 },
  { x: 1750, y: 1250, type: 'flower', variant: 1, size: 45 },
  { x: 1650, y: 1450, type: 'flower', variant: 2, size: 40 },
  { x: 1250, y: 2200, type: 'tree', variant: 1, size: 95 },
  { x: 600, y: 2250, type: 'tree', variant: 2, size: 85 },
  { x: 250, y: 1800, type: 'tree', variant: 1, size: 90 },
];

export function getTrackData(trackId: TrackId): TrackData {
  switch (trackId) {
    case 'desert':
      return {
        config: TRACK_CONFIGS.desert,
        waypoints: desertWaypoints,
        roadWidth: 150,
        startLine: {
          x1: 600,
          y1: 520,
          x2: 600,
          y2: 680,
          angle: 0, // apontando para a direita
        },
        startingGrid: [
          { x: 640, y: 570, angle: 0 },  // Nikola (Pole position)
          { x: 560, y: 620, angle: 0 },  // Papai Rafael
          { x: 480, y: 570, angle: 0 },  // Mamãe Hevila
        ],
        obstacles: desertObstacles,
        scenery: desertScenery,
        ambientColor: '#fef08a',
      };

    case 'forest':
      return {
        config: TRACK_CONFIGS.forest,
        waypoints: forestWaypoints,
        roadWidth: 150,
        startLine: {
          x1: 500,
          y1: 1120,
          x2: 500,
          y2: 1280,
          angle: 0,
        },
        startingGrid: [
          { x: 540, y: 1170, angle: 0 }, // Nikola (Pole position)
          { x: 460, y: 1220, angle: 0 }, // Papai Rafael
          { x: 380, y: 1170, angle: 0 }, // Mamãe Hevila
        ],
        obstacles: forestObstacles,
        scenery: forestScenery,
        ambientColor: '#bbf7d0',
      };

    case 'city':
    default:
      return {
        config: TRACK_CONFIGS.city,
        waypoints: cityWaypoints,
        roadWidth: 160,
        startLine: {
          x1: 500,
          y1: 1820,
          x2: 500,
          y2: 1980,
          angle: 0,
        },
        startingGrid: [
          { x: 550, y: 1870, angle: 0 }, // Nikola (Pole position)
          { x: 470, y: 1920, angle: 0 }, // Papai Rafael
          { x: 390, y: 1870, angle: 0 }, // Mamãe Hevila
        ],
        obstacles: cityObstacles,
        scenery: cityScenery,
        ambientColor: '#bae6fd',
      };
  }
}
