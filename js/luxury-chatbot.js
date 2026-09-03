/**
 * MISS REZANNA - LUXURY AI CONCIERGE & HERITAGE STYLIST CHATBOT
 * Intelligent luxury assistant powered by Google Gemini AI.
 * Automatically knows brand details and all products from the database.
 */

(function() {
  // Backend API URL — relative path works since frontend and API are on the same Vercel deployment
  const CHAT_API_URL = '/api/v1/chat';

  // Conversation history for multi-turn context (persists within session)
  let conversationHistory = [];

  function initLuxuryChatbot() {
    if (document.getElementById('luxuryChatbotLauncher')) return;

    const launcherHTML = `
      <div id="luxuryChatbotLauncher" class="chatbot-launcher-btn" role="button" aria-label="Open Draggable Luxury AI Stylist Chatbot" title="Drag to move anywhere, click to chat">
        <img src="images/ai_avatar_3d.jpg" alt="AI Stylist" class="chatbot-avatar-circle">
        <div class="ai-online-dot"></div>
      </div>

      <div id="luxuryChatbotWindow" class="chatbot-window" role="dialog" aria-label="Miss Rezanna AI Stylist">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar-icon" style="background:transparent; color:#111;">
              <img src="images/ai_avatar_3d.jpg" alt="AI Stylist" class="chatbot-model-thumb">
            </div>
            <div>
              <h4 class="chatbot-header-title">MISS REZANNA</h4>
              <div class="chatbot-header-subtitle">AI Heritage Stylist</div>
            </div>
          </div>
          <button class="chatbot-close-btn" onclick="toggleChatbot(event)" aria-label="Close Chat">✕</button>
        </div>

        <div id="chatbotMessages" class="chatbot-messages">
          <div class="chat-bubble-row ai">
            <div class="chat-bubble ai">
              Namaste & welcome to <strong>MISS REZANNA</strong>! I am your personal AI Stylist from our Ludhiana atelier. I know all about our collections, fabrics, sizes, and pricing. How may I assist you today?
            </div>
          </div>
        </div>

        <div class="chatbot-chips">
          <button class="chat-chip" onclick="sendChatChip('What products do you have?')">✦ Our Collection</button>
          <button class="chat-chip" onclick="sendChatChip('Help me choose my size')">✦ Sizing Guide</button>
          <button class="chat-chip" onclick="sendChatChip('What are your shipping & delivery times?')">✦ Shipping Info</button>
          <button class="chat-chip" onclick="sendChatChip('How do I place a bespoke custom order?')">✦ Custom Orders</button>
        </div>

        <form class="chatbot-input-area" onsubmit="handleChatSubmit(event)">
          <input type="text" id="chatbotInput" class="chatbot-input" placeholder="Ask about products, sizing, fabrics, pricing..." autocomplete="off">
          <button type="submit" class="chatbot-send-btn" aria-label="Send Message">➤</button>
        </form>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', launcherHTML);

    const launcherEl = document.getElementById('luxuryChatbotLauncher');
    if (launcherEl) {
      // Load saved position if exists
      const savedLeft = localStorage.getItem('ai_agent_pos_left');
      const savedTop = localStorage.getItem('ai_agent_pos_top');
      if (savedLeft && savedTop) {
        launcherEl.style.left = savedLeft + 'px';
        launcherEl.style.top = savedTop + 'px';
        launcherEl.style.bottom = 'auto';
        launcherEl.style.right = 'auto';
      }

      let isDragging = false;
      let startX, startY, initialLeft, initialTop;
      let dragDistance = 0;

      function onStart(clientX, clientY) {
        isDragging = true;
        dragDistance = 0;
        startX = clientX;
        startY = clientY;
        const rect = launcherEl.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        launcherEl.style.transition = 'none';
      }

      function onMove(clientX, clientY) {
        if (!isDragging) return;
        const dx = clientX - startX;
        const dy = clientY - startY;
        dragDistance = Math.hypot(dx, dy);

        let newLeft = Math.max(8, Math.min(window.innerWidth - 60, initialLeft + dx));
        let newTop = Math.max(8, Math.min(window.innerHeight - 60, initialTop + dy));

        launcherEl.style.left = newLeft + 'px';
        launcherEl.style.top = newTop + 'px';
        launcherEl.style.bottom = 'auto';
        launcherEl.style.right = 'auto';
      }

      function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        launcherEl.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';

        if (dragDistance >= 5) {
          const rect = launcherEl.getBoundingClientRect();
          localStorage.setItem('ai_agent_pos_left', Math.round(rect.left));
          localStorage.setItem('ai_agent_pos_top', Math.round(rect.top));
        } else {
          toggleChatbot();
        }
      }

      // Mouse events
      launcherEl.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        onStart(e.clientX, e.clientY);
      });
      window.addEventListener('mousemove', (e) => {
        onMove(e.clientX, e.clientY);
      });
      window.addEventListener('mouseup', () => {
        onEnd();
      });

      // Touch events for mobile devices
      launcherEl.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        onStart(touch.clientX, touch.clientY);
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY);
      }, { passive: true });
      window.addEventListener('touchend', () => {
        onEnd();
      });
    }

    window.toggleChatbot = function(e) {
      if (e && e.preventDefault) e.preventDefault();
      const winEl = document.getElementById('luxuryChatbotWindow');
      if (winEl) {
        winEl.classList.toggle('open');
        const inputEl = document.getElementById('chatbotInput');
        if (winEl.classList.contains('open') && inputEl) {
          inputEl.focus();
        }
      }
    };

    window.sendChatChip = function(text) {
      addChatMessage('user', text);
      respondAI(text);
    };

    window.handleChatSubmit = function(e) {
      e.preventDefault();
      const inputEl = document.getElementById('chatbotInput');
      if (!inputEl || !inputEl.value.trim()) return;

      const userText = inputEl.value.trim();
      inputEl.value = '';
      addChatMessage('user', userText);
      respondAI(userText);
    };

    function addChatMessage(sender, text) {
      const container = document.getElementById('chatbotMessages');
      if (!container) return;

      const row = document.createElement('div');
      row.className = 'chat-bubble-row ' + sender;

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + sender;
      bubble.innerHTML = text;

      row.appendChild(bubble);
      container.appendChild(row);
      container.scrollTop = container.scrollHeight;

      return bubble;
    }

    /**
     * Show a typing indicator while the AI is thinking
     */
    function showTypingIndicator() {
      const container = document.getElementById('chatbotMessages');
      if (!container) return null;

      const row = document.createElement('div');
      row.className = 'chat-bubble-row ai';
      row.id = 'typingIndicator';

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble ai typing-bubble';
      bubble.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';

      row.appendChild(bubble);
      container.appendChild(row);
      container.scrollTop = container.scrollHeight;

      return row;
    }

    function removeTypingIndicator() {
      const indicator = document.getElementById('typingIndicator');
      if (indicator) indicator.remove();
    }

    /**
     * Format AI response text — converts markdown-style links and formatting to HTML
     */
    function formatAIResponse(text) {
      if (!text) return '';

      // Convert markdown links [text](url) to <a> tags
      text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

      // Convert markdown bold **text** to <strong>
      text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // Convert markdown italic *text* to <em> (but not inside ** pairs)
      text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

      // Convert newlines to <br>
      text = text.replace(/\n/g, '<br>');

      return text;
    }

    /**
     * Sends the user message to the backend AI API and displays the response.
     * Falls back to a WhatsApp link if the API is unreachable.
     */
    async function respondAI(query) {
      // Disable input while processing
      const inputEl = document.getElementById('chatbotInput');
      const sendBtn = document.querySelector('.chatbot-send-btn');
      if (inputEl) inputEl.disabled = true;
      if (sendBtn) sendBtn.disabled = true;

      // Show typing animation
      showTypingIndicator();

      // Add user message to conversation history for context
      conversationHistory.push({
        role: 'user',
        parts: [{ text: query }]
      });

      try {
        const response = await fetch(CHAT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            conversationHistory: conversationHistory.slice(-10) // Send last 10 messages for context
          })
        });

        const data = await response.json();

        removeTypingIndicator();

        if (data.success && data.reply) {
          const formattedReply = formatAIResponse(data.reply);
          addChatMessage('ai', formattedReply);

          // Add AI response to conversation history
          conversationHistory.push({
            role: 'model',
            parts: [{ text: data.reply }]
          });
        } else {
          // API returned an error but with a reply (graceful degradation)
          const fallbackReply = data.reply || 'I apologize, I\'m having trouble connecting right now. Please try again in a moment.';
          addChatMessage('ai', formatAIResponse(fallbackReply));
        }

      } catch (error) {
        console.error('[Miss Rezanna Chatbot] API error:', error);
        removeTypingIndicator();

        // Network error fallback — still provide helpful response
        const fallbackMsg = 'I apologize, I\'m temporarily unable to connect. For immediate assistance, please reach out to our atelier team: <a href="https://wa.me/919877327186?text=' + encodeURIComponent('Hello MISS REZANNA, ' + query) + '" target="_blank">✦ Chat on WhatsApp (+91 98773 27186)</a>';
        addChatMessage('ai', fallbackMsg);
      } finally {
        // Re-enable input
        if (inputEl) {
          inputEl.disabled = false;
          inputEl.focus();
        }
        if (sendBtn) sendBtn.disabled = false;

        // Keep conversation history manageable (max 20 entries)
        if (conversationHistory.length > 20) {
          conversationHistory = conversationHistory.slice(-20);
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLuxuryChatbot);
  } else {
    initLuxuryChatbot();
  }
})();
