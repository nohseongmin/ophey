const SOUNDS = [
  { id:'ophey',  ko:'옵 헤이~',   en:'Op Hey~',      emoji:'🎤', freq:523, type:'sine',     dur:0.9, clr:'#ff006e' },
  { id:'gangnam',ko:'강남스타일', en:'Gangnam Style', emoji:'🕺', freq:392, type:'square',   dur:0.7, clr:'#8338ec' },
  { id:'sexy',   ko:'섹시레이디', en:'Sexy Lady',     emoji:'💃', freq:440, type:'sine',     dur:0.8, clr:'#ff4dac' },
  { id:'hey',    ko:'헤이~',      en:'Heyyy~',        emoji:'🙌', freq:587, type:'sine',     dur:0.5, clr:'#00f5d4' },
  { id:'horse',  ko:'말 울음',    en:'Horse',         emoji:'🐴', freq:180, type:'sawtooth', dur:0.6, clr:'#ffbe0b' },
  { id:'eeeee',  ko:'에에에에',   en:'Eeeeee',        emoji:'😱', freq:880, type:'sine',     dur:1.0, clr:'#ff006e' },
  { id:'human',  ko:'인간 여자',  en:'Human Woman',   emoji:'👩', freq:330, type:'triangle', dur:0.7, clr:'#8338ec' },
  { id:'bumpy',  ko:'울퉁불퉁',   en:'Bumpy',         emoji:'🏋️', freq:200, type:'sawtooth', dur:0.5, clr:'#ffbe0b' },
  { id:'oppa',   ko:'오빠',       en:'Oppa',          emoji:'👆', freq:349, type:'sine',     dur:0.4, clr:'#ff4dac' },
  { id:'style',  ko:'스타일',     en:'Style',         emoji:'😎', freq:466, type:'square',   dur:0.5, clr:'#00f5d4' },
  { id:'ey',     ko:'에이!',      en:'Ey!',           emoji:'✋', freq:698, type:'sine',     dur:0.3, clr:'#ff006e' },
  { id:'woo',    ko:'우~',        en:'Wooo~',         emoji:'🎉', freq:262, type:'triangle', dur:0.6, clr:'#8338ec' },
];

let audioCtx = null;
let masterGain = null;
let volume = 0.6;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(sound) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);
  osc.type = sound.type;
  osc.frequency.setValueAtTime(sound.freq, ctx.currentTime);
  // slight pitch slide for character
  osc.frequency.exponentialRampToValueAtTime(sound.freq * 0.85, ctx.currentTime + sound.dur);
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + sound.dur);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + sound.dur + 0.05);
}

function buildGrid() {
  const grid = document.getElementById('padGrid');
  SOUNDS.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'pad-btn';
    btn.style.setProperty('--clr', s.clr);
    btn.innerHTML = `<span class="pad-emoji">${s.emoji}</span>
      <span class="pad-label sound-label" data-ko="${s.ko}" data-en="${s.en}">${s.ko}</span>`;
    btn.addEventListener('click', () => {
      playSound(s);
      btn.classList.add('playing');
      setTimeout(() => btn.classList.remove('playing'), (s.dur * 1000) + 100);
    });
    grid.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildGrid();

  document.getElementById('btnStop').addEventListener('click', () => {
    if (audioCtx) { audioCtx.close(); audioCtx = null; masterGain = null; }
  });

  document.getElementById('volSlider').addEventListener('input', e => {
    volume = e.target.value / 100;
    if (masterGain) masterGain.gain.value = volume;
  });

  // keyboard shortcuts 1-9, q-p
  const keys = '1234567890qwertyuiop'.split('');
  document.addEventListener('keydown', e => {
    const idx = keys.indexOf(e.key.toLowerCase());
    if (idx >= 0 && idx < SOUNDS.length) {
      playSound(SOUNDS[idx]);
      const btn = document.querySelectorAll('.pad-btn')[idx];
      if (btn) { btn.classList.add('playing'); setTimeout(() => btn.classList.remove('playing'), 300); }
    }
  });
});
