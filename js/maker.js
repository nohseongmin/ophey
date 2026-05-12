// ──────────────────────────────────────────────
//  maker.js  —  Sequencer with real audio files
// ──────────────────────────────────────────────

const MAKER_SOUNDS = [
  { id: 'gangnam', ko: '강남', en: 'Gangnam', emoji: '🕺', clr: '#8338ec', file: 'audio/강남.MP3', accent: { freq: 130, type: 'sawtooth', dur: 0.25 } },
  { id: 'op', ko: '옵', en: 'Op', emoji: '🎙️', clr: '#ff006e', file: 'audio/옵.MP3', accent: { freq: 480, type: 'sine', dur: 0.15 } },
  { id: 'hey', ko: '헤이', en: 'Hey', emoji: '🎤', clr: '#ff4dac', file: 'audio/헤이.MP3', accent: { freq: 600, type: 'sine', dur: 0.4 } },
  { id: 'gangnamstyle', ko: '강남스타일', en: 'Gangnam Style', emoji: '💥', clr: '#8338ec', file: 'audio/강남style.MP3', accent: { freq: 150, type: 'sawtooth', dur: 0.3 } },
  { id: 'human', ko: '인간', en: 'Human', emoji: '🧑', clr: '#00f5d4', file: 'audio/인간.MP3', accent: { freq: 340, type: 'triangle', dur: 0.3 } },
  { id: 'sanae', ko: '사나이', en: 'Real Man', emoji: '💪', clr: '#00f5d4', file: 'audio/싸나에.MP3', accent: { freq: 220, type: 'triangle', dur: 0.5 } },
  { id: 'bumpy', ko: '울퉁불퉁', en: 'Bumpy', emoji: '🏋️', clr: '#00f5d4', file: 'audio/울퉁붕퉁.MP3', accent: { freq: 80, type: 'sawtooth', dur: 0.4 } },
  { id: 'uhh', ko: 'Uhh', en: 'Uhh', emoji: '😮', clr: '#ffbe0b', file: 'audio/uhhh.MP3', accent: { freq: 150, type: 'triangle', dur: 0.4 } },
  { id: 'running', ko: '뛰는놈', en: 'Running', emoji: '🏃', clr: '#ffbe0b', file: 'audio/뛰는놈.MP3', accent: { freq: 400, type: 'sine', dur: 0.3 } },
  { id: 'flying', ko: '나는놈', en: 'Flying', emoji: '🦅', clr: '#00f5d4', file: 'audio/나는놈.MP3', accent: { freq: 800, type: 'sine', dur: 0.6 } },
  { id: 'woman', ko: '여자', en: 'Woman', emoji: '💃', clr: '#ff4dac', file: 'audio/여짜.mp3', accent: { freq: 440, type: 'sine', dur: 0.45 } },
  { id: 'perfect', ko: '완전', en: 'Perfect', emoji: '✨', clr: '#ff006e', file: 'audio/완전.MP3', accent: { freq: 500, type: 'sine', dur: 0.3 } }
];

const COLS = 16;
let bpm = 120;
let isPlaying = false;
let currentCol = -1;
let intervalId = null;
let audioCtx2 = null;
let grid = [];
const audioBuffers2 = {};

function getCtx() {
  if (!audioCtx2) audioCtx2 = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx2.state === 'suspended') audioCtx2.resume();
  return audioCtx2;
}

// Preload a single file
async function loadAudioBuffer2(url) {
  if (audioBuffers2[url]) return audioBuffers2[url];
  try {
    const ctx = getCtx();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    audioBuffers2[url] = buffer;
    return buffer;
  } catch (e) {
    console.warn('Audio file not found yet:', url);
    return null;
  }
}

function preloadMakerSounds() {
  MAKER_SOUNDS.forEach(s => {
    if (s.file) loadAudioBuffer2(s.file);
  });
}

function playAccent(accent) {
  if (!accent) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = accent.type;
    osc.frequency.value = accent.freq;
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + accent.dur);
    osc.start(); osc.stop(ctx.currentTime + accent.dur + 0.05);
  } catch (e) { /* silent */ }
}

async function playAudioFileMaker(url) {
  if (!url) return;
  const ctx = getCtx();
  const buffer = await loadAudioBuffer2(url);
  if (!buffer) return;
  
  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (e) { console.error(e); }
}

function playMakerSound(s) {
  if (s.accent) playAccent(s.accent);
  if (s.file) playAudioFileMaker(s.file);
}

function previewSound(rowIdx) {
  playMakerSound(MAKER_SOUNDS[rowIdx]);
}

function buildSeqGrid() {
  const container = document.getElementById('seqGrid');
  container.innerHTML = '';

  // header row
  const headerLabel = document.createElement('div');
  container.appendChild(headerLabel);
  for (let c = 0; c < COLS; c++) {
    const h = document.createElement('div');
    h.className = 'seq-beat-header' + (c % 4 === 0 ? ' bar-start' : '');
    h.textContent = c % 4 === 0 ? (c / 4 + 1) : '·';
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
  document.querySelectorAll('.seq-cell').forEach(cell => {
    cell.classList.toggle('playing-col', parseInt(cell.dataset.col) === currentCol);
  });
  MAKER_SOUNDS.forEach((s, ri) => {
    if (grid[ri] && grid[ri][currentCol]) playMakerSound(s);
  });
}

function startPlay() {
  if (isPlaying) return;
  isPlaying = true;
  const msPerBeat = (60000 / bpm) / 4;
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
  preloadMakerSounds();
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
