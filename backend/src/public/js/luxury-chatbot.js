/**
 * MISS REZANNA - LUXURY AI CONCIERGE & HERITAGE STYLIST CHATBOT
 * Intelligent luxury assistant providing instant sizing, craftsmanship, and boutique support.
 */

(function() {
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
              Namaste & welcome to <strong>MISS REZANNA</strong>! I am your personal AI Stylist from our Ludhiana atelier. How may I assist your luxury wardrobe or bespoke sizing today?
            </div>
          </div>
        </div>

        <div class="chatbot-chips">
          <button class="chat-chip" onclick="sendChatChip('✦ What are your shipping & delivery times?')">✦ Shipping Times</button>
          <button class="chat-chip" onclick="sendChatChip('✦ Help me choose my size')">✦ Sizing Guide</button>
          <button class="chat-chip" onclick="sendChatChip('✦ Tell me about Ludhiana craftsmanship')">✦ Our Craftsmanship</button>
          <button class="chat-chip" onclick="sendChatChip('✦ How do I place a bespoke custom order?')">✦ Custom Orders</button>
        </div>

        <form class="chatbot-input-area" onsubmit="handleChatSubmit(event)">
          <input type="text" id="chatbotInput" class="chatbot-input" placeholder="Ask about sizing, fabrics, or orders..." autocomplete="off">
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
    }

    function respondAI(query) {
      const q = query.toLowerCase();
      let answer = "";

      if (q.includes('ship') || q.includes('deliver') || q.includes('time') || q.includes('courier')) {
        answer = "We offer <strong>complimentary express shipping</strong> across India on orders over ₹15,000. Ready-to-wear pieces dispatch in 2–4 business days, arriving within 3–6 working days via insured courier.";
      } else if (q.includes('size') || q.includes('fit') || q.includes('measurement') || q.includes('chart')) {
        answer = "Our knitwear is designed with relaxed luxury drape across sizes XS to XL. For bespoke tailoring or exact bust/waist measurements, you can <a href='https://wa.me/919877327186?text=Hello%20MISS%20REZANNA,%20I%20need%20sizing%20guidance' target='_blank'>connect with our atelier artisans on WhatsApp</a>.";
      } else if (q.includes('craft') || q.includes('ludhiana') || q.includes('punjab') || q.includes('yarn') || q.includes('fabric') || q.includes('material')) {
        answer = "Every garment is handcrafted in our historical <strong>Ludhiana, Punjab atelier</strong>. Our master artisans spend up to 120 hours weaving select luxury yarns, celebrating organic texture and royal silhouettes.";
      } else if (q.includes('return') || q.includes('exchange') || q.includes('refund')) {
        answer = "We offer hassle-free <strong>7-day size exchanges</strong> on unworn garments with tags attached. For artisanal defects or transit inquiries, contact our atelier within 48 hours of receipt.";
      } else if (q.includes('custom') || q.includes('bespoke') || q.includes('order') || q.includes('whatsapp') || q.includes('buy')) {
        answer = "We specialize in bespoke creations! You can place a direct order or request custom sleeves/measurements by messaging us: <a href='https://wa.me/919877327186?text=Hello%20MISS%20REZANNA,%20I%20would%20like%20a%20bespoke%20order' target='_blank'>✦ Click here to chat on WhatsApp (+91 98773 27186)</a>.";
      } else {
        answer = "Thank you for reaching out to the MISS REZANNA atelier! For personalized styling advice or order assistance, our senior fashion consultants are available on WhatsApp: <a href='https://wa.me/919877327186?text=" + encodeURIComponent("Hello MISS REZANNA, " + query) + "' target='_blank'>✦ Click here to connect on WhatsApp (+91 98773 27186)</a>.";
      }

      setTimeout(() => {
        addChatMessage('ai', answer);
      }, 600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLuxuryChatbot);
  } else {
    initLuxuryChatbot();
  }
})();
