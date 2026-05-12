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

function exportPattern() {
  let parts = [bpm];
  MAKER_SOUNDS.forEach((s, ri) => {
    let rowVal = 0;
    if (grid[ri]) {
      for (let c = 0; c < COLS; c++) {
        if (grid[ri][c]) rowVal |= (1 << c);
      }
    }
    parts.push(rowVal.toString(16).padStart(4, '0'));
  });
  const code = parts.join('-');
  const shareInput = document.getElementById('shareInput');
  shareInput.value = code;
  shareInput.select();
  navigator.clipboard.writeText(code).then(() => {
    alert('패턴 코드가 클립보드에 복사되었습니다!\n친구에게 공유해보세요.');
  }).catch(() => {
    alert('코드가 생성되었습니다. 직접 복사해주세요.');
  });
}

function importPattern() {
  const shareInput = document.getElementById('shareInput');
  const code = shareInput.value.trim();
  if (!code) return;
  const parts = code.split('-');
  if (parts.length < 2) {
    alert('잘못된 코드 형식입니다.');
    return;
  }
  
  const newBpm = parseInt(parts[0], 10);
  if (!isNaN(newBpm) && newBpm >= 60 && newBpm <= 200) {
    bpm = newBpm;
    document.getElementById('bpmSlider').value = bpm;
    document.getElementById('bpmVal').textContent = bpm;
    if (isPlaying) { stopPlay(); startPlay(); }
  }
  
  for (let ri = 0; ri < MAKER_SOUNDS.length; ri++) {
    if (ri + 1 < parts.length) {
      const rowVal = parseInt(parts[ri + 1], 16);
      if (!isNaN(rowVal)) {
        grid[ri] = grid[ri] || new Array(COLS).fill(false);
        for (let c = 0; c < COLS; c++) {
          grid[ri][c] = (rowVal & (1 << c)) !== 0;
        }
      }
    }
  }
  
  MAKER_SOUNDS.forEach((s, ri) => {
    if (grid[ri]) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.querySelector(`.seq-cell[data-row="${ri}"][data-col="${c}"]`);
        if (cell) {
          cell.classList.toggle('active', grid[ri][c]);
        }
      }
    }
  });
  alert('패턴을 성공적으로 불러왔습니다!');
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
