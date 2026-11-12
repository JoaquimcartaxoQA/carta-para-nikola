import { expect, test } from './fixtures';

for (const mode of ['muted', 'unavailable', 'available'] as const) {
  test(`áudio da corrida respeita o modo ${mode}`, async ({ page }) => {
    await page.addInitScript((mode) => {
      if (mode === 'unavailable') {
        Object.defineProperty(window, 'AudioContext', { value: undefined, configurable: true });
        Object.defineProperty(window, 'webkitAudioContext', { value: undefined, configurable: true });
      } else {
        const start = OscillatorNode.prototype.start;
        const tally = { starts: 0 };
        Object.assign(window, { audioTally: tally });
        OscillatorNode.prototype.start = function (...args) {
          tally.starts++;
          return start.apply(this, args);
        };
      }
    }, mode);
    await page.goto('/');
    const result = await page.evaluate(async (mode) => {
      const path = '/src/services/audio.ts';
      const { sound } = await import(path);
      sound.setMuted(mode === 'muted');
      sound.updateEngine(0);
      sound.playCountdown(1);
      sound.playGo();
      sound.startEngine();
      sound.startEngine();
      sound.updateEngine(0.7);
      sound.playHonk();
      sound.playCrash();
      sound.playBoost();
      sound.playLapChime();
      sound.playVictoryFanfare();
      sound.playButton();
      sound.stopEngine();
      sound.updateEngine(1);
      return { muted: sound.getMuted(), stored: localStorage.getItem('nikola_race_muted'),
        starts: (window as unknown as { audioTally?: { starts: number } }).audioTally?.starts };
    }, mode);
    expect(result.muted).toBe(mode === 'muted');
    expect(result.stored).toBe(String(mode === 'muted'));
    if (mode === 'muted') expect(result.starts).toBe(0);
    if (mode === 'available') expect(result.starts).toBeGreaterThan(10);
    if (mode === 'unavailable') await expect(page.getByRole('button', { name: /começar corrida/i })).toBeEnabled();
  });
}
