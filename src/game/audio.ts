class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.08,
    delay = 0,
    endFreq?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playCatch(kind: 'sapphire' | 'macaron' | 'teacup', combo = 1) {
    const jitter = 0.96 + Math.random() * 0.08;
    const step = Math.min(combo, 8) * 28;
    if (kind === 'sapphire') {
      this.playTone((659 + step) * jitter, 0.14, 'triangle', 0.075);
      this.playTone((987 + step) * jitter, 0.16, 'sine', 0.055, 0.045);
    } else if (kind === 'macaron') {
      this.playTone((587 + step) * jitter, 0.15, 'sine', 0.08);
      this.playTone((880 + step) * jitter, 0.18, 'triangle', 0.06, 0.05);
    } else {
      // Teacup heal chime
      this.playTone(523.25, 0.16, 'sine', 0.07);
      this.playTone(659.25, 0.18, 'sine', 0.07, 0.06);
      this.playTone(1046.5, 0.25, 'triangle', 0.065, 0.12);
    }
  }

  public playScroll() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.24, 'triangle', 0.085, idx * 0.065);
    });
  }

  public playDash() {
    this.playTone(420, 0.16, 'sine', 0.055, 0, 820);
  }

  public playHurt() {
    this.playTone(230, 0.18, 'sawtooth', 0.055, 0, 115);
    this.playTone(170, 0.22, 'triangle', 0.06, 0.03, 92);
  }

  public playVictory() {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    chord.forEach((n, idx) => {
      this.playTone(n, 0.36, 'triangle', 0.085, idx * 0.08);
    });
  }

  public playDefeat() {
    const notes = [392, 349.23, 311.13, 261.63];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.28, 'sine', 0.07, idx * 0.11);
    });
  }
}

export const soundEngine = new SoundEngine();
