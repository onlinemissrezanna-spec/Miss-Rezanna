/**
 * MISS REZANNA - ROYAL ETHNIC WEAR STORY SUITE
 * Immerses visitors in a royal Indian heritage experience with subtle storytelling.
 * Background music and audio soundscape removed per request.
 */

(function() {
  'use strict';

  // 1. FLOATING ROYAL GOLD MOTE PARTICLES
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

  // 2. GARMENT HERITAGE STORY BADGE ON PRODUCT CARDS
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

  // Initialize Royal Ethnic Story Suite (Music & prologue disabled)
  function initEthnicSuite() {
    initRoyalGoldParticles();
    initHeritageBadges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEthnicSuite);
  } else {
    initEthnicSuite();
  }
})();
