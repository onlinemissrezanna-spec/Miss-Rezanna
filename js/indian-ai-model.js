/**
 * MISS REZANNA - 3D INDIAN AI AVATAR INTEGRATION
 * Configures the luxury chatbot launcher avatar.
 * Initial calling / automatic modal popup and speech greeting have been disabled per user request.
 */

(function() {
  'use strict';

  function upgradeChatbotButtonAvatar() {
    const botBtn = document.getElementById('luxuryChatbotLauncher');
    if (!botBtn) return;

    // Replace generic icon with 3D Indian Model thumbnail
    const iconWrap = botBtn.querySelector('.chatbot-avatar-icon');
    if (iconWrap && !iconWrap.querySelector('img')) {
      iconWrap.innerHTML = `<img src="images/ai_avatar_3d.jpg" alt="AI Stylist" class="chatbot-model-thumb">`;
      iconWrap.style.background = 'transparent';
    }

    // Also upgrade the chat header icon
    const headerIcon = document.querySelector('.chatbot-header .chatbot-avatar-icon');
    if (headerIcon && !headerIcon.querySelector('img')) {
      headerIcon.innerHTML = `<img src="images/ai_avatar_3d.jpg" alt="AI Stylist" class="chatbot-model-thumb">`;
      headerIcon.style.background = 'transparent';
    }
  }

  function initIndianAiModel() {
    // Ensure any previously created backdrop is cleaned up
    const existing = document.getElementById('indianModel3dBackdrop');
    if (existing) {
      existing.remove();
    }
    // Set launcher avatar thumbnail without any popup or initial audio calling
    upgradeChatbotButtonAvatar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIndianAiModel);
  } else {
    initIndianAiModel();
  }
})();
