// Richmond Symphony Advancement Systems & Operations Candidate Suite
// Candidate: Randy Bryan Moore, MSW

(function() {
  function initSuite() {
    // =========================================================================
    // 1. Passcode Gate Logic (PIN: 0000 & 1-Click Unlock)
    // =========================================================================
    const gateOverlay = document.getElementById('passcode-gate');
    const pinInputs = document.querySelectorAll('.pin-digit');
    const gateUnlockBtn = document.getElementById('gate-unlock-btn');

    function unlockDossier() {
      if (gateOverlay) {
        gateOverlay.classList.add('unlocked');
        gateOverlay.style.opacity = '0';
        gateOverlay.style.visibility = 'hidden';
        gateOverlay.style.pointerEvents = 'none';
        setTimeout(() => {
          gateOverlay.style.display = 'none';
        }, 350);
      }
      try {
        sessionStorage.setItem('symphony_dossier_auth', 'true');
        sessionStorage.setItem('rbm_sym_unlocked', '1');
        localStorage.setItem('symphony_dossier_auth', 'true');
      } catch (e) {}
    }

    // Auto-unlock if already authorized in session or local storage
    try {
      if (sessionStorage.getItem('symphony_dossier_auth') === 'true' || 
          sessionStorage.getItem('rbm_sym_unlocked') === '1' ||
          localStorage.getItem('symphony_dossier_auth') === 'true') {
        unlockDossier();
      }
    } catch (e) {}

    // Unlock button handler: auto-fills '0000' and unlocks immediately
    if (gateUnlockBtn) {
      gateUnlockBtn.addEventListener('click', (e) => {
        e.preventDefault();
        pinInputs.forEach(i => i.value = '0');
        unlockDossier();
      });
    }

    // Passcode digit input listeners
    pinInputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        if (e.target.value.length >= 1 && idx < pinInputs.length - 1) {
          pinInputs[idx + 1].focus();
        }
        const entered = Array.from(pinInputs).map(i => i.value).join('');
        if (entered === '0000' || entered.length === 4) {
          unlockDossier();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) {
          pinInputs[idx - 1].focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          unlockDossier();
        }
      });
    });

    // =========================================================================
    // 2. Case Study Explorer Tabs
    // =========================================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const target = document.getElementById('tab-' + tabId);
        if (target) {
          target.classList.add('active');
        }
      });
    });

    // =========================================================================
    // 3. Scroll Progress Indicator
    // =========================================================================
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total > 0) {
          progressBar.style.width = (window.scrollY / total * 100) + '%';
        }
      }, { passive: true });
    }

    // =========================================================================
    // 4. Web Audio Repertoire Synthesis
    // =========================================================================
    const playBtn = document.getElementById('play-trigger-btn');
    const trackOptions = document.querySelectorAll('.track-option');
    const canvas = document.getElementById('waveform-canvas');
    let audioCtx = null;
    let isPlaying = false;
    let synthTimer = null;
    let selectedTrack = 'jefferson';

    const notes = {
      'C3': 130.81, 'E3': 164.81, 'G3': 196.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63,
      'F4': 349.23, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00,
      'Bb4': 466.16, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33,
      'Eb5': 622.25, 'E5': 659.25, 'G5': 783.99
    };

    const trackSequences = {
      jefferson: [
        ['C3', 'G3', 'C4', 'E4'],
        ['A3', 'E4', 'A4', 'C5'],
        ['F3', 'C4', 'F4', 'A4'],
        ['G3', 'D4', 'G4', 'B4']
      ],
      debussy: [
        ['Eb4', 'G4', 'Bb4', 'Eb5'],
        ['Ab4', 'C5', 'Eb5', 'G5'],
        ['F4', 'Ab4', 'C5', 'Eb5'],
        ['Bb3', 'F4', 'Bb4', 'D5']
      ],
      chopin: [
        ['C4', 'Eb4', 'G4', 'C5'],
        ['Ab3', 'Eb4', 'Ab4', 'C5'],
        ['F3', 'C4', 'F4', 'Ab4'],
        ['G3', 'D4', 'G4', 'B4']
      ]
    };

    trackOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        trackOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedTrack = opt.getAttribute('data-track') || 'jefferson';
      });
    });

    function playChord(chord) {
      if (!audioCtx) return;
      chord.forEach(n => {
        if (!notes[n]) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[n], audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.8);
      });
    }

    function drawWaveform() {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      let phase = 0;

      function render() {
        if (!isPlaying) {
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = 'rgba(242, 234, 223, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.stroke();
          return;
        }

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#F2EADF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        phase += 0.08;

        for (let x = 0; x < w; x++) {
          const y = (h / 2) + Math.sin(x * 0.05 + phase) * 14 * Math.sin(phase * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        requestAnimationFrame(render);
      }
      render();
    }

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (!isPlaying) {
          if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          }
          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
          isPlaying = true;
          playBtn.innerText = 'Pause';
          playBtn.classList.add('playing');
          drawWaveform();

          const seq = trackSequences[selectedTrack] || trackSequences.jefferson;
          let step = 0;
          playChord(seq[step]);
          synthTimer = setInterval(() => {
            step = (step + 1) % seq.length;
            playChord(seq[step]);
          }, 1400);
        } else {
          isPlaying = false;
          playBtn.innerText = 'Play';
          playBtn.classList.remove('playing');
          if (synthTimer) clearInterval(synthTimer);
          drawWaveform();
        }
      });
    }

    drawWaveform();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuite);
  } else {
    initSuite();
  }
})();
