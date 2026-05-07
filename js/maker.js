// maker.js — sequencer logic
// SOUNDS must be loaded from launchpad.js (shared via index)
// For maker.html, we duplicate the minimal SOUNDS def here
const MAKER_SOUNDS = [
  { id:'ophey',  ko:'옵 헤이~',   en:'Op Hey~',   emoji:'🎤', freq:523, type:'sine',     dur:0.5, clr:'#ff006e' },
  { id:'gangnam',ko:'강남스타일', en:'Gangnam',    emoji:'🕺', freq:392, type:'square',   dur:0.4, clr:'#8338ec' },
  { id:'sexy',   ko:'섹시레이디', en:'Sexy Lady',  emoji:'💃', freq:440, type:'sine',     dur:0.4, clr:'#ff4dac' },
  { id:'hey',    ko:'헤이~',      en:'Heyyy~',     emoji:'🙌', freq:587, type:'sine',     dur:0.3, clr:'#00f5d4' },
  { id:'horse',  ko:'말 울음',    en:'Horse',      emoji:'🐴', freq:180, type:'sawtooth', dur:0.4, clr:'#ffbe0b' },
  { id:'eeeee',  ko:'에에에에',   en:'Eeeeee',     emoji:'😱', freq:880, type:'sine',     dur:0.5, clr:'#ff006e' },
  { id:'human',  ko:'인간 여자',  en:'Human Woman',emoji:'👩', freq:330, type:'triangle', dur:0.4, clr:'#8338ec' },
  { id:'bumpy',  ko:'울퉁불퉁',   en:'Bumpy',      emoji:'🏋️', freq:200, type:'sawtooth', dur:0.3, clr:'#ffbe0b' },
];

const COLS = 16;
let bpm = 120;
let isPlaying = false;
let currentCol = -1;
let intervalId = null;
let audioCtx2 = null;
let grid = []; // grid[row][col] = bool

function getCtx() {
  if (!audioCtx2) audioCtx2 = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx2.state === 'suspended') audioCtx2.resume();
  return audioCtx2;
}

function playMakerSound(s) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.type = s.type;
  osc.frequency.value = s.freq;
  g.gain.setValueAtTime(0.4, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.dur);
  osc.start(); osc.stop(ctx.currentTime + s.dur + 0.05);
}

function previewSound(rowIdx) {
  playMakerSound(MAKER_SOUNDS[rowIdx]);
}

function buildSeqGrid() {
  const container = document.getElementById('seqGrid');
  container.innerHTML = '';

  // header row
  const headerLabel = document.createElement('div'); // empty corner
  container.appendChild(headerLabel);
  for (let c = 0; c < COLS; c++) {
    const h = document.createElement('div');
    h.className = 'seq-beat-header' + (c % 4 === 0 ? ' bar-start' : '');
    h.textContent = c % 4 === 0 ? (c/4+1) : '·';
    container.appendChild(h);
  }

  // rows
  MAKER_SOUNDS.forEach((s, ri) => {
    grid[ri] = grid[ri] || new Array(COLS).fill(false);

    const label = document.createElement('div');
    label.className = 'seq-label';
    label.innerHTML = `<button class="seq-preview" onclick="previewSound(${ri})">▶</button>
      <span class="sound-label" data-ko="${s.ko}" data-en="${s.en}">${s.ko}</span>`;
    container.appendChild(label);

    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'seq-cell';
      cell.style.setProperty('--clr', s.clr);
      cell.dataset.row = ri;
      cell.dataset.col = c;
      if (grid[ri][c]) cell.classList.add('active');
      cell.addEventListener('click', () => {
        grid[ri][c] = !grid[ri][c];
        cell.classList.toggle('active', grid[ri][c]);
      });
      container.appendChild(cell);
    }
  });
}

function tick() {
  currentCol = (currentCol + 1) % COLS;
  // highlight column
  document.querySelectorAll('.seq-cell').forEach(cell => {
    cell.classList.toggle('playing-col', parseInt(cell.dataset.col) === currentCol);
  });
  // play active sounds
  MAKER_SOUNDS.forEach((s, ri) => {
    if (grid[ri] && grid[ri][currentCol]) playMakerSound(s);
  });
}

function startPlay() {
  if (isPlaying) return;
  isPlaying = true;
  const msPerBeat = (60000 / bpm) / 4; // 16th notes
  document.getElementById('btnPlay').textContent = t('stop');
  intervalId = setInterval(tick, msPerBeat);
}

function stopPlay() {
  isPlaying = false;
  clearInterval(intervalId);
  currentCol = -1;
  document.querySelectorAll('.seq-cell').forEach(c => c.classList.remove('playing-col'));
  document.getElementById('btnPlay').textContent = t('play');
}

function clearGrid() {
  grid = [];
  buildSeqGrid();
  applyLang();
}

document.addEventListener('DOMContentLoaded', () => {
  buildSeqGrid();

  document.getElementById('btnPlay').addEventListener('click', () => {
    isPlaying ? stopPlay() : startPlay();
  });
  document.getElementById('btnClear').addEventListener('click', clearGrid);

  const bpmSlider = document.getElementById('bpmSlider');
  const bpmVal = document.getElementById('bpmVal');
  bpmSlider.addEventListener('input', e => {
    bpm = parseInt(e.target.value);
    bpmVal.textContent = bpm;
    if (isPlaying) { stopPlay(); startPlay(); }
  });
});
