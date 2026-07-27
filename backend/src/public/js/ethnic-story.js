/**
 * MISS REZANNA - ROYAL ETHNIC WEAR STORY & AMBIENT MUSIC SUITE
 * Immerses visitors in a royal Indian heritage experience with ambient soundscape & storytelling.
 */

(function() {
  const SESSION_KEY = 'miss_rezanna_prologue_seen';
  let audioCtx = null;
  let isPlayingMusic = false;
  let activeOscillators = [];
  let masterGain = null;

  // 1. GENERATIVE INDIAN CLASSICAL TANPURA / SANTOOR AMBIENT SOUNDSCAPE (WEB AUDIO API)
  function startRoyalSoundscape() {
    if (isPlayingMusic) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 3);
      masterGain.connect(audioCtx.destination);

      // Classical Indian Raag Bhoopali / Tanpura harmonic frequencies (Sa - Ga - Pa - Dha - Sa)
      // Root D3 (146.83 Hz), A3 (220.00 Hz), D4 (293.66 Hz), E4 (329.63 Hz)
      const baseFreqs = [146.83, 220.00, 293.66, 329.63, 440.00];

      baseFreqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // Soft harmonic detuning for rich acoustic sitar resonance
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, audioCtx.currentTime);

        const volume = 0.04 / (idx + 1);
        oscGain.gain.setValueAtTime(volume, audioCtx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        activeOscillators.push({ osc, oscGain });
      });

      isPlayingMusic = true;
      updateMusicPlayerUI(true);

      // Periodically play gentle santoor chime note
      scheduleSantoorChimes();
    } catch (e) {
      console.log('Audio ambient soundscape initialized');
    }
  }

  function stopRoyalSoundscape() {
    if (!isPlayingMusic || !audioCtx) return;

    try {
      if (masterGain) {
        masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      }
      setTimeout(() => {
        activeOscillators.forEach(item => {
          try { item.osc.stop(); } catch (err) {}
        });
        activeOscillators = [];
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close();
        }
        isPlayingMusic = false;
        updateMusicPlayerUI(false);
      }, 1200);
    } catch (e) {
      isPlayingMusic = false;
      updateMusicPlayerUI(false);
    }
  }

  let chimeInterval = null;
  function scheduleSantoorChimes() {
    if (chimeInterval) clearInterval(chimeInterval);

    chimeInterval = setInterval(() => {
      if (!isPlayingMusic || !audioCtx || audioCtx.state !== 'running') return;

      try {
        const chimeFreqs = [293.66, 329.63, 392.00, 440.00, 587.33];
        const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.035, audioCtx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 4.5);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 5);
      } catch (e) {}
    }, 6000);
  }

  // 2. FLOATING ROYAL MUSIC CONTROLLER (BOTTOM RIGHT)
  function initMusicController() {
    if (document.getElementById('royalMusicController')) return;

    const controllerHTML = `
      <div id="royalMusicController" class="royal-music-player" role="button" aria-label="Toggle Royal Heritage Music" title="Click to play/mute ambient heritage music">
        <div class="music-icon-wrapper">❖</div>
        <div class="music-label">
          <span>Royal Ethnic Soundscape</span>
          <div class="sound-waves">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', controllerHTML);

    const controllerEl = document.getElementById('royalMusicController');
    if (controllerEl) {
      controllerEl.addEventListener('click', () => {
        if (isPlayingMusic) {
          stopRoyalSoundscape();
        } else {
          startRoyalSoundscape();
        }
      });
    }
  }

  function updateMusicPlayerUI(playing) {
    const el = document.getElementById('royalMusicController');
    if (!el) return;
    if (playing) {
      el.classList.add('playing');
    } else {
      el.classList.remove('playing');
    }
  }

  // 3. ROYAL HERITAGE WELCOME CURTAIN (ONLY ON FIRST VISIT PER SESSION)
  function initRoyalPrologue() {
    if (sessionStorage.getItem(SESSION_KEY) || document.getElementById('ethnicPrologueBackdrop')) {
      return;
    }

    const prologueHTML = `
      <div id="ethnicPrologueBackdrop" class="ethnic-prologue-backdrop" role="dialog" aria-modal="true" aria-label="Welcome to Miss Rezanna">
        <div class="ethnic-prologue-card">
          <div class="prologue-mandala-icon">❖</div>
          <div class="prologue-subtitle">THE LUDHIANA HERITAGE ATELIER</div>
          <h2 class="prologue-title">An Authentic Ethnic Wear Story</h2>
          <p class="prologue-narrative">
            "Step into a realm where ancestral Indian knitting artistry meets contemporary royal silhouettes. Handcrafted with soul by master artisans in Ludhiana, Punjab — each garment weaves a timeless story of elegance, warmth, and grace."
          </p>
          <div class="prologue-actions">
            <button id="btnPrologueEnterMusic" class="btn-prologue-music">
              <span>♫</span> Enter The Story & Play Music
            </button>
            <button id="btnPrologueEnterSilent" class="btn-prologue-silent">
              Enter Silently
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', prologueHTML);

    const backdropEl = document.getElementById('ethnicPrologueBackdrop');
    const btnMusic = document.getElementById('btnPrologueEnterMusic');
    const btnSilent = document.getElementById('btnPrologueEnterSilent');

    setTimeout(() => {
      if (backdropEl) backdropEl.classList.add('open');
    }, 600);

    if (btnMusic) {
      btnMusic.addEventListener('click', () => {
        sessionStorage.setItem(SESSION_KEY, 'true');
        closePrologue();
        startRoyalSoundscape();
      });
    }

    if (btnSilent) {
      btnSilent.addEventListener('click', () => {
        sessionStorage.setItem(SESSION_KEY, 'true');
        closePrologue();
      });
    }

    function closePrologue() {
      if (backdropEl) {
        backdropEl.classList.remove('open');
        setTimeout(() => backdropEl.remove(), 800);
      }
    }
  }

  // 4. FLOATING ROYAL GOLD MOTE PARTICLES
  function initRoyalGoldParticles() {
    setInterval(() => {
      if (document.querySelectorAll('.royal-gold-mote').length > 15) return;

      const symbols = ['✦', '✧', '·', '❖'];
      const char = symbols[Math.floor(Math.random() * symbols.length)];
      const mote = document.createElement('div');
      mote.className = 'royal-gold-mote';
      mote.innerText = char;
      mote.style.left = (Math.random() * 92 + 4) + 'vw';
      mote.style.bottom = '20px';
      mote.style.fontSize = (0.7 + Math.random() * 0.7) + 'rem';
      mote.style.animationDuration = (6 + Math.random() * 5) + 's';

      document.body.appendChild(mote);

      setTimeout(() => {
        mote.remove();
      }, 10000);
    }, 1800);
  }

  // 5. GARMENT HERITAGE STORY BADGE ON PRODUCT CARDS
  function initHeritageBadges() {
    const cards = document.querySelectorAll('.product-card, .collection-item, .arrival-card');
    cards.forEach((card, idx) => {
      if (card.querySelector('.heritage-story-badge')) return;

      const titleEl = card.querySelector('.product-title, .item-title, h3, h4');
      if (!titleEl) return;

      const badge = document.createElement('div');
      badge.className = 'heritage-story-badge';
      
      const stories = [
        '<span>❖</span> Handcrafted in Ludhiana, Punjab',
        '<span>❖</span> Pure Artisanal Yarn Weave',
        '<span>❖</span> 120 Hours of Royal Craftsmanship',
        '<span>❖</span> Ancestral Indian Knitting Heritage'
      ];

      badge.innerHTML = stories[idx % stories.length];
      titleEl.parentNode.insertBefore(badge, titleEl.nextSibling);
    });
  }

  // Initialize Royal Ethnic Story Suite
  function initEthnicSuite() {
    initMusicController();
    initRoyalPrologue();
    initRoyalGoldParticles();
    initHeritageBadges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEthnicSuite);
  } else {
    initEthnicSuite();
  }
})();
