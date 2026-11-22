// audio.js — tiny synthesised sound effects, no audio files.
// Everything is a WebAudio oscillator, created on first user gesture so the
// browser's autoplay rules are never a problem.

export function createAudio() {
  return {
    ctx: null,
    muted: false,
    ensure() {
      if (!this.ctx) {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AC();
        } catch {
          this.ctx = null;
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    tone(freq, seconds, type, gain, when = 0) {
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime + when;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      amp.gain.setValueAtTime(gain || 0.08, t0);
      amp.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
      osc.connect(amp).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + seconds + 0.02);
    },
    pickup() {
      this.tone(880, 0.12, 'triangle', 0.09);
      this.tone(1318, 0.14, 'triangle', 0.07, 0.07);
    },
    pick() {
      this.tone(660, 0.07, 'square', 0.05);
    },
    fail() {
      this.tone(180, 0.18, 'sawtooth', 0.06);
    },
    tick() {
      this.tone(520, 0.05, 'square', 0.04);
    },
    unlock() {
      this.tone(523, 0.12, 'triangle', 0.09);
      this.tone(784, 0.16, 'triangle', 0.09, 0.1);
    },
    smoke() {
      this.tone(240, 0.3, 'sine', 0.07);
    },
    emp() {
      this.tone(1200, 0.25, 'sawtooth', 0.05);
      this.tone(300, 0.3, 'sawtooth', 0.05, 0.08);
    },
    busted() {
      this.tone(220, 0.4, 'sawtooth', 0.1);
      this.tone(110, 0.5, 'sawtooth', 0.1, 0.25);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.09, i * 0.12));
    },
    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    },
  };
}
