const audio = document.querySelector('#site-music');
const toggle = document.querySelector('#music-toggle');
const ring = toggle.querySelector('.music-toggle-ring');
const inkLayer = ring.cloneNode(true);
inkLayer.classList.add('music-toggle-ink-layer');
toggle.append(inkLayer);
const waves = toggle.querySelectorAll('.music-toggle-wave path');
const wave = waves[0];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const restingRing = wave.getAttribute('d');
const radii = Array(48).fill(18);
const inkForView = () => document.body.dataset.view === 'letters' ? '#315b45' : '#fff7df';
let currentInk = inkForView();
let inkAnimation;
let context;
let analyser;
let frequencies;
let frame = 0;

audio.volume = 0.42;

function prepareAnalysis() {
  if (context) return context.resume();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return Promise.resolve();
  try {
    context = new AudioContextClass();
    analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    frequencies = new Uint8Array(analyser.frequencyBinCount);
    const source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
    return context.resume();
  } catch (error) {
    console.warn('音乐频谱不可用', error);
    return Promise.resolve();
  }
}

function drawRing() {
  if (audio.paused || reducedMotion.matches) return;
  if (analyser) {
    analyser.getByteFrequencyData(frequencies);
    const bass = (frequencies[2] + frequencies[3] + frequencies[4]) / 3;
    const points = radii.map((radius, index) => {
      const bin = 2 + Math.floor(index * 42 / radii.length);
      const energy = Math.min(1, (frequencies[bin] * 0.7 + bass * 0.3) / 180);
      radii[index] = radius * 0.72 + (18 + energy * 4.2) * 0.28;
      const angle = index * Math.PI * 2 / radii.length - Math.PI / 2;
      return [(24 + Math.cos(angle) * radii[index]).toFixed(2), (24 + Math.sin(angle) * radii[index]).toFixed(2)];
    });
    const shape = 'M' + points.map(point => point.join(' ')).join('L') + 'Z';
    waves.forEach(path => path.setAttribute('d', shape));
  }
  frame = requestAnimationFrame(drawRing);
}

function syncMusicControl() {
  const playing = !audio.paused && !audio.ended;
  toggle.classList.toggle('is-playing', playing);
  toggle.setAttribute('aria-pressed', String(playing));
  toggle.setAttribute('aria-label', playing ? '关闭背景音乐' : '开启背景音乐');
  cancelAnimationFrame(frame);
  if (playing && !reducedMotion.matches) frame = requestAnimationFrame(drawRing);
  else {
    waves.forEach(path => path.setAttribute('d', restingRing));
    radii.fill(18);
  }
}

function paintMusicInk() {
  const nextInk = inkForView();
  if (nextInk === currentInk) return;
  inkAnimation?.cancel();
  toggle.classList.remove('is-ink-changing');
  if (reducedMotion.matches) {
    toggle.style.removeProperty('color');
    currentInk = nextInk;
    return;
  }
  toggle.style.color = currentInk;
  inkLayer.style.color = nextInk;
  inkLayer.style.visibility = 'visible';
  inkAnimation = inkLayer.animate([
    {maskPosition: '100% 50%', webkitMaskPosition: '100% 50%'},
    {maskPosition: '0% 50%', webkitMaskPosition: '0% 50%'}
  ], {duration: 700, easing: 'cubic-bezier(.22,.7,.2,1)', fill: 'both'});
  toggle.classList.add('is-ink-changing');
  currentInk = nextInk;
  const animation = inkAnimation;
  animation.finished.then(() => {
    if (inkAnimation !== animation) return;
    animation.cancel();
    inkAnimation = null;
    toggle.classList.remove('is-ink-changing');
    toggle.style.removeProperty('color');
    inkLayer.style.removeProperty('color');
    inkLayer.style.removeProperty('visibility');
  }).catch(() => {});
}

new MutationObserver(paintMusicInk).observe(document.body, {attributes: true, attributeFilter: ['data-view']});

toggle.addEventListener('click', async () => {
  if (!audio.paused) {
    audio.pause();
    return;
  }
  try {
    const ready = prepareAnalysis();
    await Promise.all([ready, audio.play()]);
  } catch (error) {
    syncMusicControl();
    console.warn('背景音乐播放失败', error);
  }
});

audio.addEventListener('play', syncMusicControl);
audio.addEventListener('pause', syncMusicControl);
audio.addEventListener('ended', syncMusicControl);
audio.addEventListener('error', syncMusicControl);
reducedMotion.addEventListener('change', syncMusicControl);
syncMusicControl();
