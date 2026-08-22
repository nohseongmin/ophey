// ──────────────────────────────────────────────
//  maker.js  —  Sequencer with real audio files
// ──────────────────────────────────────────────

const MAKER_SOUNDS = [
  { id: 'gangnam', ko: '강남', en: 'Gangnam', emoji: '🕺', clr: '#8338ec', file: 'audio/강남.MP3' },
  { id: 'op', ko: '옵', en: 'Op', emoji: '🎙️', clr: '#ff006e', file: 'audio/옵.MP3' },
  { id: 'hey', ko: '헤이', en: 'Hey', emoji: '🎤', clr: '#ff4dac', file: 'audio/헤이.MP3' },
  { id: 'gangnamstyle', ko: '강남스타일', en: 'Gangnam Style', emoji: '💥', clr: '#8338ec', file: 'audio/강남style.MP3' },
  { id: 'human', ko: '인간', en: 'Human', emoji: '🧑', clr: '#00f5d4', file: 'audio/인간.MP3' },
  { id: 'human_like', ko: '인간적인', en: 'Human-like', emoji: '😌', clr: '#ffbe0b', file: 'audio/인간적인.MP3' },
  { id: 'sanae', ko: '사나이', en: 'Real Man', emoji: '💪', clr: '#00f5d4', file: 'audio/싸나에.MP3' },
  { id: 'bumpy', ko: '울퉁불퉁', en: 'Bumpy', emoji: '🏋️', clr: '#00f5d4', file: 'audio/울퉁붕퉁.MP3' },
  { id: 'uhh', ko: 'Uhh', en: 'Uhh', emoji: '😮', clr: '#ffbe0b', file: 'audio/uhhh.MP3' },
  { id: 'running', ko: '뛰는놈', en: 'Running', emoji: '🏃', clr: '#ffbe0b', file: 'audio/뛰는놈.MP3' },
  { id: 'flying', ko: '나는놈', en: 'Flying', emoji: '🦅', clr: '#00f5d4', file: 'audio/나는놈.MP3' },
  { id: 'woman', ko: '여자', en: 'Woman', emoji: '💃', clr: '#ff4dac', file: 'audio/여짜.mp3' },
  { id: 'perfect', ko: '완전', en: 'Perfect', emoji: '✨', clr: '#ff006e', file: 'audio/완전.MP3' }
];

const COLS = 16;
let bpm = 120;
let isPlaying = false;
let currentCol = -1;
let intervalId = null;
let makerAudioCtx = null;
let grid = [];
const makerAudioBuffers = {};

function getCtx() {
  if (!makerAudioCtx) makerAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (makerAudioCtx.state === 'suspended') makerAudioCtx.resume();
  return makerAudioCtx;
}

// Preload a single file
async function loadMakerAudioBuffer(url) {
  if (makerAudioBuffers[url]) return makerAudioBuffers[url];
  try {
    const ctx = getCtx();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    makerAudioBuffers[url] = buffer;
    return buffer;
  } catch (e) {
    console.warn('Audio file not found yet:', url);
    return null;
  }
}

function preloadMakerSounds() {
  MAKER_SOUNDS.forEach(s => {
    if (s.file) loadMakerAudioBuffer(s.file);
  });
}


async function playAudioFileMaker(url) {
  if (!url) return;
  const ctx = getCtx();
  const buffer = await loadMakerAudioBuffer(url);
  if (!buffer) return;
  
  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (e) { console.error(e); }
}

function playMakerSound(s) {
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

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64ToBytes(base64) {
  try {
    let b64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch(e) {
    return null;
  }
}

// Pattern share-code byte layout (before base64url encoding), shared by
// exportPattern/importPattern:
//   byte 0    → BPM (60–200, fits a single byte)
//   byte 1..n → one byte per active cell, encoded as row * COLS + col
// Only active cells are stored (sparse), so the code stays short even
// though the grid itself is MAKER_SOUNDS.length * COLS cells.
function exportPattern() {
  let activeIndices = [];
  MAKER_SOUNDS.forEach((s, ri) => {
    if (grid[ri]) {
      for (let c = 0; c < COLS; c++) {
        if (grid[ri][c]) {
          activeIndices.push(ri * COLS + c);
        }
      }
    }
  });

  const bytes = new Uint8Array(1 + activeIndices.length);
  bytes[0] = bpm;
  for (let i = 0; i < activeIndices.length; i++) {
    bytes[1 + i] = activeIndices[i];
  }

  const code = bytesToBase64(bytes);
  const shareInput = document.getElementById('shareInput');
  shareInput.value = code;
  shareInput.select();
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('btnExport');
    const originalText = btn.textContent;
    btn.textContent = '✔️ 복사완료';
    setTimeout(() => btn.textContent = originalText, 2000);
  }).catch(() => {
    const btn = document.getElementById('btnExport');
    const originalText = btn.textContent;
    btn.textContent = '❌ 직접 복사';
    setTimeout(() => btn.textContent = originalText, 2000);
  });
}

function importPattern() {
  const shareInput = document.getElementById('shareInput');
  const code = shareInput.value.trim();
  if (!code) return;
  
  const bytes = base64ToBytes(code);
  if (!bytes || bytes.length === 0) {
    const btn = document.getElementById('btnImport');
    const originalText = btn.textContent;
    btn.textContent = '❌ 형식 오류';
    setTimeout(() => btn.textContent = originalText, 2000);
    return;
  }
  
  const newBpm = bytes[0];
  if (newBpm >= 60 && newBpm <= 200) {
    bpm = newBpm;
    document.getElementById('bpmSlider').value = bpm;
    document.getElementById('bpmVal').textContent = bpm;
    if (isPlaying) { stopPlay(); startPlay(); }
  }
  
  for (let ri = 0; ri < MAKER_SOUNDS.length; ri++) {
    grid[ri] = new Array(COLS).fill(false);
  }
  
  for (let i = 1; i < bytes.length; i++) {
    const idx = bytes[i];
    const ri = Math.floor(idx / COLS);
    const c = idx % COLS;
    if (ri < MAKER_SOUNDS.length) {
      grid[ri][c] = true;
    }
  }
  
  MAKER_SOUNDS.forEach((s, ri) => {
    for (let c = 0; c < COLS; c++) {
      const cell = document.querySelector(`.seq-cell[data-row="${ri}"][data-col="${c}"]`);
      if (cell) {
        cell.classList.toggle('active', grid[ri][c]);
      }
    }
  });
  
  const btn = document.getElementById('btnImport');
  const originalText = btn.textContent;
  btn.textContent = '✔️ 적용완료';
  setTimeout(() => btn.textContent = originalText, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  preloadMakerSounds();
  buildSeqGrid();

  document.getElementById('btnPlay').addEventListener('click', () => {
    isPlaying ? stopPlay() : startPlay();
  });
  document.getElementById('btnClear').addEventListener('click', clearGrid);
  
  const btnExport = document.getElementById('btnExport');
  if (btnExport) btnExport.addEventListener('click', exportPattern);
  const btnImport = document.getElementById('btnImport');
  if (btnImport) btnImport.addEventListener('click', importPattern);

  const bpmSlider = document.getElementById('bpmSlider');
  const bpmVal = document.getElementById('bpmVal');
  bpmSlider.addEventListener('input', e => {
    bpm = parseInt(e.target.value);
    bpmVal.textContent = bpm;
    if (isPlaying) { stopPlay(); startPlay(); }
  });
});
