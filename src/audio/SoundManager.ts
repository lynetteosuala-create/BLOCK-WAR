/**
 * Procedural Web Audio Engine for LAGOS SURVIVAL: BLOCK WAR
 * Synthesizes realistic weapon discharges, Lagos danfo horns, vehicle revs,
 * bullet impacts, afrobeats ambient groove, and UI clicks without any external files.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  
  private musicPlaying = false;
  private musicInterval: number | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isMuted = false;

  private volumes = {
    master: 0.8,
    sfx: 0.9,
    music: 0.5,
    ambience: 0.4,
  };

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volumes.master;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.volumes.sfx;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.volumes.music;
      this.musicGain.connect(this.masterGain);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.value = this.volumes.ambience;
      this.ambienceGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, sfx: number, music: number, ambience: number) {
    this.volumes = { master, sfx, music, ambience };
    if (this.masterGain) this.masterGain.gain.value = master;
    if (this.sfxGain) this.sfxGain.gain.value = sfx;
    if (this.musicGain) this.musicGain.gain.value = music;
    if (this.ambienceGain) this.ambienceGain.gain.value = ambience;
  }

  /**
   * Procedural noise buffer helper
   */
  private createNoiseBuffer(duration: number): AudioBuffer {
    if (!this.ctx) return {} as AudioBuffer;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Tactical Weapon Fire Sounds
   */
  public playGunshot(category: string = 'assault_rifle') {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Noise component (crack & gunpowder pop)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.4);

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';

    const noiseGain = this.ctx.createGain();

    // Tonal punch component (bass thump & muzzle transient)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    if (category === 'assault_rifle') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);

      noiseFilter.frequency.setValueAtTime(2400, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(600, t + 0.2);

      noiseGain.gain.setValueAtTime(0.8, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      oscGain.gain.setValueAtTime(0.6, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    } else if (category === 'smg') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);

      noiseFilter.frequency.setValueAtTime(3200, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(800, t + 0.12);

      noiseGain.gain.setValueAtTime(0.6, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      oscGain.gain.setValueAtTime(0.45, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    } else if (category === 'shotgun') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);

      noiseFilter.frequency.setValueAtTime(1800, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(300, t + 0.38);

      noiseGain.gain.setValueAtTime(1.0, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      oscGain.gain.setValueAtTime(0.85, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    } else if (category === 'sniper') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);

      noiseFilter.frequency.setValueAtTime(4000, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(400, t + 0.6);

      noiseGain.gain.setValueAtTime(1.0, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      oscGain.gain.setValueAtTime(0.9, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    } else {
      // Pistol
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

      noiseFilter.frequency.setValueAtTime(2800, t);
      noiseGain.gain.setValueAtTime(0.6, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      oscGain.gain.setValueAtTime(0.5, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    }

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.65);
    osc.start(t);
    osc.stop(t + 0.65);
  }

  /**
   * Hitmarker confirmation click (Call of Duty style crisp chime)
   */
  public playHitmarker(headshot = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = headshot ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(headshot ? 1760 : 1050, t);
    osc.frequency.exponentialRampToValueAtTime(headshot ? 2300 : 700, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  /**
   * Reload weapon sound
   */
  public playReload() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Mag eject click
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.frequency.setValueAtTime(320, t);
    osc1.frequency.exponentialRampToValueAtTime(140, t + 0.15);
    g1.gain.setValueAtTime(0.4, t);
    g1.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc1.connect(g1);
    g1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.18);

    // Slide rack sound after delay
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(650, t + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(950, t + 0.55);
    g2.gain.setValueAtTime(0.0, t);
    g2.gain.setValueAtTime(0.35, t + 0.4);
    g2.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
    osc2.connect(g2);
    g2.connect(this.sfxGain);
    osc2.start(t + 0.4);
    osc2.stop(t + 0.65);
  }

  /**
   * Famous Nigerian Danfo Yellow Bus Horn ("PEEP PEEEEEP!")
   */
  public playDanfoHorn() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const playBlast = (startTime: number, duration: number) => {
      if (!this.ctx || !this.sfxGain) return;
      const oscA = this.ctx.createOscillator();
      const oscB = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      // Dual tone classic air horn (F#4 and A#4)
      oscA.type = 'sawtooth';
      oscA.frequency.setValueAtTime(370, startTime);
      oscB.type = 'sawtooth';
      oscB.frequency.setValueAtTime(466, startTime);

      g.gain.setValueAtTime(0.001, startTime);
      g.gain.linearRampToValueAtTime(0.45, startTime + 0.02);
      g.gain.setValueAtTime(0.45, startTime + duration - 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscA.connect(g);
      oscB.connect(g);
      g.connect(this.sfxGain);

      oscA.start(startTime);
      oscA.stop(startTime + duration + 0.02);
      oscB.start(startTime);
      oscB.stop(startTime + duration + 0.02);
    };

    // Double honk
    playBlast(t, 0.16);
    playBlast(t + 0.22, 0.28);
  }

  /**
   * Footsteps
   */
  public playFootstep(isSprinting = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

    g.gain.setValueAtTime(isSprinting ? 0.25 : 0.14, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(g);
    g.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  /**
   * Construction Hammer / Build Placement
   */
  public playBuildPlacement() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);

    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(g);
    g.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * UI button click
   */
  public playUIClick(confirm = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(confirm ? 680 : 440, t);
    osc.frequency.exponentialRampToValueAtTime(confirm ? 1080 : 540, t + 0.06);

    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(g);
    g.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Vehicle engine sound modulation
   */
  public startVehicleEngine() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.engineOsc) return;

    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();

    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
    this.engineGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    this.engineOsc.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);
    this.engineOsc.start();
  }

  public updateVehicleEngine(speedRatio: number) {
    if (!this.ctx || !this.engineOsc || !this.engineGain) return;
    const targetFreq = 40 + Math.abs(speedRatio) * 120;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
  }

  public stopVehicleEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {
        // Ignored
      }
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  /**
   * Procedural Afrobeats / Synthwave Ambient Game Track
   */
  public startBackgroundMusic() {
    if (this.musicPlaying) return;
    this.initCtx();
    if (!this.ctx || !this.musicGain) return;

    this.musicPlaying = true;
    let step = 0;
    const bpm = 110;
    const stepDuration = 60 / bpm / 2; // 16th notes

    // Lagos Groove Scale (Pentatonic Minor with funky bass notes: D2, F2, G2, A2, C3)
    const bassNotes = [73.42, 87.31, 98.00, 110.00, 130.81];
    const synthNotes = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33];

    const playStep = () => {
      if (!this.musicPlaying || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;

      // Kick on 1, 7, 9, 15 (syncopated afro-rhythm)
      if (step === 0 || step === 6 || step === 8 || step === 12) {
        const kickOsc = this.ctx.createOscillator();
        const kickG = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(130, t);
        kickOsc.frequency.exponentialRampToValueAtTime(32, t + 0.12);
        kickG.gain.setValueAtTime(0.5, t);
        kickG.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        kickOsc.connect(kickG);
        kickG.connect(this.musicGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.2);
      }

      // Shaker / Hi-Hat on every other 16th
      if (step % 2 === 0) {
        const hat = this.ctx.createBufferSource();
        hat.buffer = this.createNoiseBuffer(0.05);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, t);
        const hatG = this.ctx.createGain();
        hatG.gain.setValueAtTime(step % 4 === 2 ? 0.2 : 0.08, t);
        hatG.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        hat.connect(filter);
        filter.connect(hatG);
        hatG.connect(this.musicGain);
        hat.start(t);
        hat.stop(t + 0.06);
      }

      // Melodic bass line
      if (step === 0 || step === 3 || step === 8 || step === 11 || step === 14) {
        const bassOsc = this.ctx.createOscillator();
        const bassG = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        const noteIdx = (step * 2) % bassNotes.length;
        bassOsc.frequency.setValueAtTime(bassNotes[noteIdx], t);
        bassG.gain.setValueAtTime(0.28, t);
        bassG.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.8);
        bassOsc.connect(bassG);
        bassG.connect(this.musicGain);
        bassOsc.start(t);
        bassOsc.stop(t + stepDuration * 2);
      }

      // Chords / Lead Arpeggio
      if (step % 4 === 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadG = this.ctx.createGain();
        leadOsc.type = 'sine';
        const chordNote = synthNotes[(Math.floor(step / 4) + 2) % synthNotes.length];
        leadOsc.frequency.setValueAtTime(chordNote, t);
        leadG.gain.setValueAtTime(0.12, t);
        leadG.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        leadOsc.connect(leadG);
        leadG.connect(this.musicGain);
        leadOsc.start(t);
        leadOsc.stop(t + 0.35);
      }

      step = (step + 1) % 16;
    };

    this.musicInterval = window.setInterval(playStep, stepDuration * 1000);
  }

  public stopBackgroundMusic() {
    this.musicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
