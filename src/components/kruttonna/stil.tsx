/** Felles stil for KRUTTØNNA (storskjerm og elevskjerm). */
export function KruttonnaStil() {
  return (
    <style>{`
      .kt-root{min-height:100vh;background:radial-gradient(ellipse at 50% -10%,#3a2a1a 0%,#16110c 45%,#0b0907 100%);color:#f3e9d8;font-family:var(--font-inter),system-ui,sans-serif}
      .kt-serif{font-family:Georgia,'Times New Roman',serif;letter-spacing:.02em}
      .kt-card{background:rgba(255,240,215,.06);border:1px solid rgba(255,220,170,.15);border-radius:18px}
      .kt-btn{border-radius:14px;font-weight:800;padding:14px 22px;transition:transform .12s,filter .12s}
      .kt-btn:active{transform:scale(.97)}
      .kt-btn:disabled{opacity:.45}
      .kt-gull{background:linear-gradient(180deg,#f6c35a,#d68a1c);color:#2a1a05}
      .kt-rod{background:linear-gradient(180deg,#e0483a,#a5231a);color:#fff}
      .kt-gronn{background:linear-gradient(180deg,#4cc46f,#23843f);color:#fff}
      .kt-mork{background:rgba(255,255,255,.08);color:#f3e9d8;border:1px solid rgba(255,255,255,.15)}
      @keyframes kt-puls{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
      @keyframes kt-rist{0%,100%{transform:translate(0)}20%{transform:translate(-6px,3px)}40%{transform:translate(6px,-3px)}60%{transform:translate(-4px,-2px)}80%{transform:translate(4px,2px)}}
      @keyframes kt-gnist{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.4)}}
      @keyframes kt-inn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      @keyframes kt-blink{0%,100%{background:rgba(224,72,58,.25)}50%{background:rgba(224,72,58,.05)}}
      .kt-puls{animation:kt-puls 1s ease-in-out infinite}
      .kt-rist{animation:kt-rist .5s ease-in-out 2}
      .kt-gnist{animation:kt-gnist .35s ease-in-out infinite}
      .kt-inn{animation:kt-inn .35s ease-out both}
      .kt-blink{animation:kt-blink .8s ease-in-out infinite}
      .kt-ledning{position:relative;display:flex;align-items:center;gap:14px;width:100%;text-align:left;border-radius:16px;padding:16px 18px;font-weight:700;font-size:18px;line-height:1.3;border:2px solid transparent;transition:transform .12s,border-color .12s}
      .kt-ledning:hover{transform:translateX(4px)}
      .kt-ledning .kt-tråd{flex:none;width:46px;height:10px;border-radius:6px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.25)}
    `}</style>
  );
}

export const LEDNINGSFARGER = ["#e0483a", "#2e8bc0", "#f6c35a", "#4cc46f", "#b06ad9", "#f08a2c"];

/** Små lydeffekter med Web Audio – ingen filer. */
let ctx: AudioContext | null = null;
export function lyd(type: "tikk" | "riktig" | "feil" | "bom" | "seier") {
  try {
    ctx = ctx ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const c = ctx;
    const t = c.currentTime;
    const tone = (f: number, start: number, dur: number, kind: OscillatorType = "sine", vol = 0.15) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = kind;
      o.frequency.setValueAtTime(f, t + start);
      g.gain.setValueAtTime(vol, t + start);
      g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
      o.connect(g).connect(c.destination);
      o.start(t + start);
      o.stop(t + start + dur);
    };
    if (type === "tikk") tone(1200, 0, 0.05, "square", 0.05);
    if (type === "riktig") { tone(660, 0, 0.12); tone(990, 0.1, 0.18); }
    if (type === "feil") { tone(180, 0, 0.25, "sawtooth", 0.12); }
    if (type === "seier") { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.25, "triangle", 0.14)); }
    if (type === "bom") {
      const len = 0.9;
      const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      const s = c.createBufferSource();
      const g = c.createGain();
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 600;
      g.gain.value = 0.6;
      s.buffer = buf;
      s.connect(f).connect(g).connect(c.destination);
      s.start();
    }
  } catch {
    /* lyd er valgfritt */
  }
}
