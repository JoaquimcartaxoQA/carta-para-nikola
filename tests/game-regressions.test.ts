import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialCarState, updatePhysics, type PlayerControls } from '../src/game/physics';
import { GameRenderer } from '../src/game/renderer';
import { getTrackData } from '../src/game/trackData';
import { getCanvasPixelRatio, getResponsiveCameraZoom } from '../src/game/viewport';
import type { CarState, RacerId } from '../src/types/game';

const trackData = getTrackData('city');
const neutralControls: PlayerControls = {
  up: false,
  down: false,
  left: false,
  right: false,
  honk: false,
};

function createControlTestCars() {
  const cars = createInitialCarState(trackData, 2);

  // Keep Nikola far from the bots and mark both bots ahead, exercising the AI's
  // position-aware pace adjustment without collisions or lap transitions.
  Object.assign(cars.nikola, { x: 50, y: 50, speed: 4, lapProgress: 0 });
  Object.assign(cars.rafael, { speed: 3, lapProgress: 300 });
  Object.assign(cars.hevila, { speed: 3, lapProgress: 300 });

  return cars;
}

function stepRace(cars: Record<RacerId, CarState>, controls: PlayerControls) {
  return updatePhysics(cars, controls, trackData, 2, 1000, 1 / 60, true).updatedCars;
}

function botMotion(cars: Record<RacerId, CarState>) {
  return (['rafael', 'hevila'] as const).map((id) => ({
    id,
    x: cars[id].x,
    y: cars[id].y,
    speed: cars[id].speed,
    angle: cars[id].angle,
  }));
}

test('player 1 acceleration and braking do not change bot throttle or movement', () => {
  const acceleratingCars = createControlTestCars();
  const brakingCars = createControlTestCars();

  const accelerating: PlayerControls = { ...neutralControls, up: true };
  const braking: PlayerControls = { ...neutralControls, down: true };

  stepRace(acceleratingCars, accelerating);
  stepRace(brakingCars, braking);

  assert.ok(acceleratingCars.nikola.speed > brakingCars.nikola.speed, "the player's throttle and brake must work");
  assert.deepEqual(botMotion(acceleratingCars), botMotion(brakingCars));
});

test('bots complete laps independently of Nikola', () => {
  const cars = createInitialCarState(trackData, 2);
  cars.nikola.x = 50;
  cars.nikola.y = 50;
  cars.nikola.nextCheckpointIndex = 1;

  for (const id of ['rafael', 'hevila'] as const) {
    cars[id].x = trackData.waypoints[0].x;
    cars[id].y = trackData.waypoints[0].y;
    cars[id].nextCheckpointIndex = 0;
  }

  stepRace(cars, neutralControls);

  assert.equal(cars.rafael.currentLap, 2);
  assert.equal(cars.hevila.currentLap, 2);
});

test('camera zoom adapts to narrow, short, and high-resolution viewports', () => {
  assert.equal(getResponsiveCameraZoom(0, 768), 1);
  assert.equal(getResponsiveCameraZoom(320, 568), 0.55);
  assert.equal(getResponsiveCameraZoom(1280, 400), 0.55);
  assert.ok(Math.abs(getResponsiveCameraZoom(800, 600) - (600 / 768)) < 0.0001);
  assert.equal(getResponsiveCameraZoom(1920, 1080), 1.15);
});

test('canvas pixel ratio stays sharp on high-DPI screens without exceeding the cap', () => {
  assert.equal(getCanvasPixelRatio(1), 1);
  assert.equal(getCanvasPixelRatio(1.5), 1.5);
  assert.equal(getCanvasPixelRatio(3), 2);
  assert.equal(getCanvasPixelRatio(0), 1);
});

test('renderer sizes the canvas backing store for the viewport and pixel ratio', () => {
  const canvas = { width: 300, height: 150 };
  const transforms: number[][] = [];
  const context = {
    canvas,
    setTransform: (...values: number[]) => transforms.push(values),
  } as unknown as CanvasRenderingContext2D;
  const renderer = new GameRenderer({ getContext: () => context } as unknown as HTMLCanvasElement);

  renderer.resize(390, 844, 2);

  assert.equal(canvas.width, 780);
  assert.equal(canvas.height, 1688);
  assert.deepEqual(transforms, [[2, 0, 0, 2, 0, 0]]);
});
