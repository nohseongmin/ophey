const LANG = {
  ko: {
    nav_pad: '런치패드', nav_maker: '메이커',
    pad_title: '강남 옵 헤이', pad_subtitle: '버튼을 눌러 효과음을 재생하세요 🎵',
    stop_all: '⏹ 전체 정지', volume: '볼륨',
    maker_title: '강남스타일 메이커', maker_subtitle: '셀을 클릭해 비트를 만들어보세요',
    play: '▶ 재생', stop: '⏹ 정지', clear: '🗑 초기화', bpm: 'BPM',
    disclaimer: 'All audio clips belong to their respective rights holders. Non-commercial fan site.',
  },
  en: {
    nav_pad: 'Launchpad', nav_maker: 'Maker',
    pad_title: 'Gangnam Op Hey', pad_subtitle: 'Press buttons to play sound effects 🎵',
    stop_all: '⏹ Stop All', volume: 'Vol',
    maker_title: 'Gangnam Style Maker', maker_subtitle: 'Click cells to build your beat',
    play: '▶ Play', stop: '⏹ Stop', clear: '🗑 Clear', bpm: 'BPM',
    disclaimer: 'All audio clips belong to their respective rights holders. Non-commercial fan site.',
  }
};

let currentLang = localStorage.getItem('lang') || 'ko';
function t(key) { return LANG[currentLang][key] || key; }

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  document.querySelectorAll('.sound-label').forEach(el => {
    el.textContent = currentLang === 'ko' ? el.dataset.ko : el.dataset.en;
  });
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyLang();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  applyLang();
});
