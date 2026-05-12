// ──────────────────────────────────────────────
//  launchpad.js  —  Real vocal sounds via TTS
// ──────────────────────────────────────────────

const SOUNDS = [
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

// ── Audio context ──────────────
let audioCtx = null;
let masterGain = null;
let volume = 0.6;
const audioBuffers = {};

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

// Preload a single file
async function loadAudioBuffer(url) {
  if (audioBuffers[url]) return audioBuffers[url];
  try {
    const ctx = getAudioCtx();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    audioBuffers[url] = buffer;
    return buffer;
  } catch (e) {
    console.warn('Audio file not found yet:', url);
    return null;
  }
}

function preloadAllSounds() {
  SOUNDS.forEach(s => {
    if (s.file) loadAudioBuffer(s.file);
  });
}


async function playAudioFile(url) {
  if (!url) return;
  const ctx = getAudioCtx();
  const buffer = await loadAudioBuffer(url);
  if (!buffer) return;
  
  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(masterGain);
    source.start(0);
  } catch (e) { console.error(e); }
}

function playSound(sound) {
  if (sound.file) playAudioFile(sound.file);
}

// ── Build pad grid ────────────────────────────
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
      setTimeout(() => btn.classList.remove('playing'), 500);
    });
    grid.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  preloadAllSounds();
  buildGrid();

  document.getElementById('btnStop').addEventListener('click', () => {
    if (audioCtx) { audioCtx.close(); audioCtx = null; masterGain = null; }
  });

  document.getElementById('volSlider').addEventListener('input', e => {
    volume = e.target.value / 100;
    if (masterGain) masterGain.gain.value = volume;
  });

  // keyboard shortcuts 1–0, q–p, a-d
  const keys = '1234567890qwertyuiopasdfghjkl'.split('');
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    const idx = keys.indexOf(e.key.toLowerCase());
    if (idx >= 0 && idx < SOUNDS.length) {
      playSound(SOUNDS[idx]);
      const btn = document.querySelectorAll('.pad-btn')[idx];
      if (btn) { btn.classList.add('playing'); setTimeout(() => btn.classList.remove('playing'), 500); }
    }
  });
});
