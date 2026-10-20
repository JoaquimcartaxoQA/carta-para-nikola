/**
 * Nikola Race: A Grande Corrida
 * Sistema de áudio sintetizado com Web Audio API.
 * 100% offline, sem arquivos externos para carregar, perfeito para crianças.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isEngineRunning: boolean = false;

  constructor() {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedMute = localStorage.getItem('nikola_race_muted');
        this.isMuted = savedMute === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('nikola_race_muted', String(this.isMuted));
      }
    } catch {
      // Ignora erro em modo anônimo
    }
    if (this.isMuted) {
      this.stopEngine();
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('nikola_race_muted', String(this.isMuted));
      }
    } catch {
      // Ignora erro em modo anônimo
    }
    if (this.isMuted) {
      this.stopEngine();
    }
  }

  // Beep de contagem regressiva (3, 2, 1)
  public playCountdown(num: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Notas mais altas para ficar bem animado e amigável
    osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.36);
  }

  // Acorde triunfal para "VAI!"
  public playGo() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Acorde Maior alegre)
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.05);
      gain.gain.setValueAtTime(0.35, this.ctx!.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.05);
      osc.stop(this.ctx!.currentTime + 0.85);
    });
  }

  // Motor contínuo com frequência modulada pela velocidade
  public startEngine() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    if (this.isEngineRunning || this.engineOsc) {
      this.stopEngine();
    }

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Lowpass filter para soar como um ronco encorpado e agradável
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch {
      // Ignora falhas em navegadores restritos
    }
  }

  public updateEngine(speedNormalized: number) {
    if (this.isMuted || !this.ctx || !this.isEngineRunning || !this.engineOsc) return;

    // Normalizado de 0 a 1
    const clamped = Math.max(0, Math.min(1, speedNormalized));
    const targetFreq = 50 + clamped * 120; // 50Hz até 170Hz
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);

    if (this.engineGain) {
      const targetVol = 0.05 + clamped * 0.07;
      this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.08);
    }
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {
        // no-op
      }
      this.engineOsc = null;
    }
    this.isEngineRunning = false;
  }

  // Buzina clássica de desenho animado ("BEEP BEEP!")
  public playHonk() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const beepTimes = [0, 0.14];
    beepTimes.forEach((startOffset) => {
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(620, this.ctx!.currentTime + startOffset);
      osc2.frequency.setValueAtTime(740, this.ctx!.currentTime + startOffset);

      gain.gain.setValueAtTime(0.3, this.ctx!.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + startOffset + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx!.destination);

      osc1.start(this.ctx!.currentTime + startOffset);
      osc1.stop(this.ctx!.currentTime + startOffset + 0.13);
      osc2.start(this.ctx!.currentTime + startOffset);
      osc2.stop(this.ctx!.currentTime + startOffset + 0.13);
    });
  }

  // Colisão divertida de desenho animado ("BOING / TCHUN")
  public playCrash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.36);
  }

  // Turbo / Boost ("VUUUSH!")
  public playBoost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.42);
  }

  // Passagem de Volta / Checkpoint ("PLIN!")
  public playLapChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [659.25, 987.77]; // E5, B5
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0.3, this.ctx!.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.1);
      osc.stop(this.ctx!.currentTime + idx * 0.1 + 0.45);
    });
  }

  // Fanfarra de Vitória para o Campeão!
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Sequência de notas alegres de comemoração
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.35 }, // E5
      { f: 783.99, d: 0.25 }, // G5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.5, d: 0.7 },  // C6 (final longo)
    ];

    let t = this.ctx.currentTime + 0.05;
    melody.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + note.d + 0.05);

      t += note.d + 0.04;
    });
  }

  // Som de clique simples e suave para botões
  public playButton() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }
}

export const sound = new SoundEngine();
