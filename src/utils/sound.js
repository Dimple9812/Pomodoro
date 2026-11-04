/**
 * Sounds are synthesised with the Web Audio API — no audio files to download.
 */

let audioContext = null;
let ambient = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext) {
    try {
      audioContext = new AudioCtx();
    } catch {
      return null;
    }
  }
  return audioContext;
}

export function isAudioSupported() {
  return typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext);
}

/** Browsers only allow audio after a user gesture; call this from click handlers. */
export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

/** A soft three-note ascending chime. */
export function playCompletionSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const start = ctx.currentTime + 0.02;
  const notes = [
    [659.25, 0],
    [783.99, 0.16],
    [1046.5, 0.32],
  ];
  for (const [frequency, offset] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start + offset);
    gain.gain.exponentialRampToValueAtTime(0.16, start + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 1.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + offset);
    osc.stop(start + offset + 1.2);
  }
}

/** Gentle brown noise — a calm, rain-like ambient background. */
export function startAmbientSound() {
  const ctx = getAudioContext();
  if (!ctx) return false;
  if (ambient) return true;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const seconds = 6;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 1.2);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  ambient = { source, gain };
  return true;
}

export function stopAmbientSound() {
  const ctx = getAudioContext();
  if (!ctx || !ambient) return;
  const { source, gain } = ambient;
  ambient = null;
  try {
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    source.stop(ctx.currentTime + 0.65);
  } catch {
    /* already stopped */
  }
}
