import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialCarState, updatePhysics, type PlayerControls } from '../src/game/physics';
import { GameRenderer } from '../src/game/renderer';
import { getTrackData } from '../src/game/trackData';
import { getCanvasPixelRatio, getResponsiveCameraZoom } from '../src/game/viewport';
import { togglePauseState } from '../src/game/pause';
import { buildRaceResults, shouldShowNikolaVictory } from '../src/game/raceResults';
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

  // Keep Nikola far from the bots so player controls cannot affect their motion.
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

test('bots record their actual finish time before Nikola finishes', () => {
  const cars = createInitialCarState(trackData, 2);
  cars.nikola.x = 50;
  cars.nikola.y = 50;
  cars.nikola.nextCheckpointIndex = 1;

  for (const id of ['rafael', 'hevila'] as const) {
    cars[id].currentLap = 2;
    cars[id].x = trackData.waypoints[0].x;
    cars[id].y = trackData.waypoints[0].y;
    cars[id].nextCheckpointIndex = 0;
  }

  const { updatedCars, standings } = updatePhysics(
    cars,
    neutralControls,
    trackData,
    2,
    8123,
    1 / 60,
    true
  );

  assert.equal(updatedCars.rafael.finishTime, 8123);
  assert.equal(updatedCars.hevila.finishTime, 8123);
  assert.deepEqual(standings, ['rafael', 'hevila', 'nikola']);
});

test('pause shortcut state toggles back to running', () => {
  const pausedRef = { current: false };
  assert.equal(togglePauseState(pausedRef), true);
  assert.equal(pausedRef.current, true);
  assert.equal(togglePauseState(pausedRef), false);
  assert.equal(pausedRef.current, false);
});

test('race results use actual finish times and order', () => {
  const cars = createInitialCarState(trackData, 2);
  cars.nikola.finishTime = 3210;
  cars.rafael.finishTime = 1230;
  cars.hevila.finishTime = 2220;
  const results = buildRaceResults(cars);
  assert.deepEqual(results.map((result) => result.racerId), ['rafael', 'hevila', 'nikola']);
  assert.deepEqual(results.map((result) => result.position), [1, 2, 3]);
  assert.deepEqual(results.map((result) => result.timeMs), [1230, 2220, 3210]);
  assert.deepEqual(results.map((result) => result.timeFormatted), ['00:01.2', '00:02.2', '00:03.2']);
});

test('race results include only racers with recorded finish times', () => {
  const cars = createInitialCarState(trackData, 2);
  cars.nikola.finishTime = 3210;
  assert.deepEqual(buildRaceResults(cars).map((result) => result.racerId), ['nikola']);
});

test('Nikola victory is presented as soon as he is the first recorded finisher', () => {
  const cars = createInitialCarState(trackData, 2);
  cars.nikola.finishTime = 3210;
  assert.equal(shouldShowNikolaVictory(cars), true);
  cars.rafael.finishTime = 3000;
  assert.equal(shouldShowNikolaVictory(cars), false);
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


test('all racers use the same top speed', () => {
  const controlledTrack = { ...trackData, roadWidth: 100000, obstacles: [] };
  const cars = createInitialCarState(controlledTrack, 2);
  const target = trackData.waypoints[1];

  cars.nikola.finishTime = 1;
  for (const [id, lateralOffset] of [['rafael', -60], ['hevila', 60]] as const) {
    Object.assign(cars[id], {
      x: target.x - 300,
      y: target.y + lateralOffset,
      angle: 0,
      speed: cars[id].maxSpeed,
      nextCheckpointIndex: 1,
    });
  }

  updatePhysics(cars, neutralControls, controlledTrack, 2, 1000, 1 / 60, true);

  assert.equal(cars.nikola.maxSpeed, cars.rafael.maxSpeed);
  assert.equal(cars.nikola.maxSpeed, cars.hevila.maxSpeed);
  assert.equal(cars.rafael.speed, cars.rafael.maxSpeed);
  assert.equal(cars.hevila.speed, cars.hevila.maxSpeed);
});

test('race results show Nikola first when he finishes before the bots', () => {
  const cars = createInitialCarState(trackData, 2);
  cars.nikola.finishTime = 3210;

  const results = buildRaceResults(cars);

  assert.deepEqual(results.map((result) => result.racerId), ['nikola']);
  assert.equal(results[0].timeMs, 3210);
});
