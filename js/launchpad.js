const SOUNDS = [
  { id:'gangnam',ko:'강남',    en:'Gangnam', emoji:'🕺', freq:392, type:'square',   dur:0.6, clr:'#8338ec' },
  { id:'op',     ko:'옵',      en:'Op',      emoji:'🎙️', freq:480, type:'sine',     dur:0.4, clr:'#ff006e' },
  { id:'hey',    ko:'헤이',    en:'Hey',     emoji:'🎤', freq:560, type:'sine',     dur:0.5, clr:'#ff4dac' },
  { id:'human',  ko:'인간',    en:'Human',   emoji:'🧑', freq:330, type:'triangle', dur:0.5, clr:'#00f5d4' },
  { id:'woman',  ko:'여자',    en:'Woman',   emoji:'👩', freq:280, type:'triangle', dur:0.5, clr:'#ff006e' },
  { id:'sanae',  ko:'사나에',  en:'Sanae',   emoji:'🌸', freq:660, type:'sine',     dur:0.6, clr:'#8338ec' },
  { id:'uhh',    ko:'uhh',     en:'uhh',     emoji:'😮', freq:150, type:'triangle', dur:0.4, clr:'#ffbe0b' },
  { id:'eeeee',  ko:'에에에',  en:'Eee',     emoji:'😱', freq:880, type:'sine',     dur:0.9, clr:'#ff006e' },
  { id:'bumpy',  ko:'울퉁불퉁',en:'Bumpy',   emoji:'💪', freq:200, type:'sawtooth', dur:0.5, clr:'#00f5d4' },
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
