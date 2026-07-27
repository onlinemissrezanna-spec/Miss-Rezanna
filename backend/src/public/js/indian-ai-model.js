/**
 * MISS REZANNA - 3D INDIAN AI MODEL & GREETING EXPERIENCE
 * Indian model wearing suit greets visitor with Namaste and morphs into AI Chatbot icon.
 */

(function() {
  const SESSION_KEY = 'miss_rezanna_model_seen';
  let hasSpoken = false;

  function initIndianAiModel() {
    if (sessionStorage.getItem(SESSION_KEY) || document.getElementById('indianModel3dBackdrop')) {
      upgradeChatbotButtonAvatar();
      return;
    }

    const greetingText = "Namaste! I am your AI agent from Miss Rezanna, how may I help you? If you require any information, I am just right here at your right side.";
    const spokenText = "Namaste! I am your Ay Eye agent from Miss Rezanna, how may I help you? If you require any information, I am just right here at your right side.";

    const modalHTML = `
      <div id="indianModel3dBackdrop" class="indian-model-3d-backdrop" role="dialog" aria-label="Miss Rezanna 3D AI Model Greeting">
        <div id="indianModel3dCard" class="indian-model-3d-card">
          <div class="model-portrait-wrap">
            <img src="images/10.jpeg" alt="Indian Model in Miss Rezanna Suit" class="model-portrait-img">
            <div class="model-namaste-badge">
              <span>🙏</span> ❖ NAMASTE
            </div>
            <div id="modelSpeakingBadge" class="model-speaking-indicator" style="display:none;">
              <span>♫</span> SPEAKING...
            </div>
          </div>

          <div class="model-speech-panel">
            <p id="modelSpeechTranscript" class="speech-transcript-text">
              "Namaste! I am your AI agent from Miss Rezanna. How may I help you?"
            </p>

            <div class="model-action-buttons">
              <button id="btnListenGreeting" class="btn-model-listen">
                <span>♫</span> Hear Namaste Greeting
              </button>
              <button id="btnSkipToChatbot" class="btn-model-skip">
                Skip to AI Chatbot ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const backdropEl = document.getElementById('indianModel3dBackdrop');
    const cardEl = document.getElementById('indianModel3dCard');
    const btnListen = document.getElementById('btnListenGreeting');
    const btnSkip = document.getElementById('btnSkipToChatbot');
    const speakingBadge = document.getElementById('modelSpeakingBadge');
    const transcriptEl = document.getElementById('modelSpeechTranscript');

    setTimeout(() => {
      if (backdropEl) backdropEl.classList.add('open');
    }, 900);

    if (btnListen) {
      btnListen.addEventListener('click', () => {
        btnListen.style.display = 'none';
        btnSkip.innerText = 'Go to AI Chatbot ➤';
        if (speakingBadge) speakingBadge.style.display = 'flex';
        
        speakIndianAiGreeting(greetingText, spokenText, transcriptEl, () => {
          triggerMorphIntoChatbot();
        });
      });
    }

    if (btnSkip) {
      btnSkip.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        triggerMorphIntoChatbot();
      });
    }

    function triggerMorphIntoChatbot() {
      sessionStorage.setItem(SESSION_KEY, 'true');

      if (cardEl) {
        cardEl.classList.add('morphing-to-chatbot');
      }

      setTimeout(() => {
        if (backdropEl) {
          backdropEl.classList.remove('open');
          setTimeout(() => backdropEl.remove(), 600);
        }

        // Pulse the chatbot button & upgrade icon
        const botBtn = document.getElementById('luxuryChatbotLauncher');
        if (botBtn) {
          botBtn.classList.add('ai-landing-pulse');
          upgradeChatbotButtonAvatar();
          setTimeout(() => {
            botBtn.classList.remove('ai-landing-pulse');
          }, 1200);
        }
      }, 950);
    }
  }

  function upgradeChatbotButtonAvatar() {
    const botBtn = document.getElementById('luxuryChatbotLauncher');
    if (!botBtn) return;

    // Replace generic icon with 3D Indian Model thumbnail
    const iconWrap = botBtn.querySelector('.chatbot-avatar-icon');
    if (iconWrap && !iconWrap.querySelector('img')) {
      iconWrap.innerHTML = `<img src="images/10.jpeg" alt="AI Stylist" class="chatbot-model-thumb">`;
      iconWrap.style.background = 'transparent';
    }

    // Also upgrade the chat header icon
    const headerIcon = document.querySelector('.chatbot-header .chatbot-avatar-icon');
    if (headerIcon && !headerIcon.querySelector('img')) {
      headerIcon.innerHTML = `<img src="images/10.jpeg" alt="AI Stylist" class="chatbot-model-thumb">`;
      headerIcon.style.background = 'transparent';
    }
  }

  function speakIndianAiGreeting(displayText, spokenText, transcriptEl, onComplete) {
    if (!('speechSynthesis' in window)) {
      simulateTyping(displayText, transcriptEl, onComplete);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(spokenText || displayText);
    utterance.rate = 0.85; // Soft, polite, unhurried rate
    utterance.pitch = 1.35; // Distinctly sweet, girlish pitch

    const voices = window.speechSynthesis.getVoices() || [];
    const maleNames = ['male', 'david', 'mark', 'george', 'ravi', 'prabhat', 'guy', 'stefan', 'richard', 'sean', 'james', 'alex', 'fred'];
    const femaleKeywords = ['neerja', 'swara', 'heera', 'kalpana', 'anita', 'zira', 'samantha', 'victoria', 'karen', 'google uk english female', 'female', 'natural', 'neural', 'hazel', 'eva'];

    // Filter out male voices
    const femaleOnly = voices.filter(v => {
      const name = v.name.toLowerCase();
      return !maleNames.some(m => name.includes(m));
    });

    let sweetFemaleVoice = femaleOnly.find(v => 
      (v.lang.includes('IN') || v.lang.includes('hi') || v.name.toLowerCase().includes('india')) &&
      femaleKeywords.some(k => v.name.toLowerCase().includes(k))
    );

    if (!sweetFemaleVoice) {
      sweetFemaleVoice = femaleOnly.find(v => 
        (v.lang.includes('IN') || v.lang.includes('hi') || v.name.toLowerCase().includes('india'))
      );
    }

    if (!sweetFemaleVoice) {
      sweetFemaleVoice = femaleOnly.find(v => 
        femaleKeywords.some(k => v.name.toLowerCase().includes(k))
      );
    }

    if (!sweetFemaleVoice && femaleOnly.length > 0) {
      sweetFemaleVoice = femaleOnly[0];
    }

    if (sweetFemaleVoice) {
      utterance.voice = sweetFemaleVoice;
    }

    utterance.onend = () => {
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      if (onComplete) onComplete();
    };

    // Animate typing along with voice
    simulateTyping(displayText, transcriptEl, null);

    window.speechSynthesis.speak(utterance);

    // Safety fallback in case speech doesn't trigger onend
    setTimeout(() => {
      if (onComplete && !sessionStorage.getItem(SESSION_KEY)) {
        onComplete();
      }
    }, 8500);
  }

  function simulateTyping(text, el, onDone) {
    if (!el) return;
    el.innerHTML = "";
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < text.length) {
        el.innerHTML += text.charAt(idx);
        idx++;
      } else {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, 38);
  }

  // Ensure voices are loaded
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIndianAiModel);
  } else {
    initIndianAiModel();
  }
})();
