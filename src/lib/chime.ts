// A short, soft two-note chime made with the browser's built-in Web Audio
// API, so there is no sound file to download. Browsers only allow sound
// after the user has tapped something on the page — pressing Start counts.
export function playChime() {
  try {
    const ctx = new AudioContext();
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.25;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Sound not available — the on-screen prompt still appears.
  }
}
