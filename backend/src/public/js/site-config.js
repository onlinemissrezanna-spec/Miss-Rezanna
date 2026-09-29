/**
 * MISS REZANNA - Central Site Configuration
 * Controls launch state, teaser mode, stock availability, and launch countdown.
 *
 * TO SWITCH TO LAUNCH MODE ON LAUNCH DAY:
 * 1. Set TEASER_MODE: false
 * 2. Set ALL_PRODUCTS_OUT_OF_STOCK: false
 * See LAUNCH.md for full instructions.
 */

window.SITE_CONFIG = {
  // Teaser mode displays the countdown, waitlist hero, and hides seasonal/summer sections
  TEASER_MODE: true,

  // Global out of stock override - disables add-to-cart, buy now, and blocks checkout
  ALL_PRODUCTS_OUT_OF_STOCK: true,

  // Launch Date & Time in Indian Standard Time (IST)
  LAUNCH_DATETIME_IST: "2026-10-15T10:00:00+05:30",

  // Form handler endpoint for waitlist submissions (e.g. Google Apps Script / webhook)
  // If empty, submissions are recorded locally and push dataLayer events
  WAITLIST_ENDPOINT: "", // [OWNER INPUT: Configure Google Sheets / Webhook URL]

  // Brand contact information
  BRAND: {
    name: "MISS REZANNA",
    legalName: "Kinshu Knitwears",
    address: "St. No. 3, E-2/2680/1, Rahon Rd, Guru Vihar, Jodhewal, Ludhiana, Punjab 141007",
    email: "info@missrezanna.com",
    whatsapp: "+91 98773 27186",
    whatsappNumber: "919877327186",
    supportHours: "Monday to Saturday, 10:00 AM – 7:00 PM IST",
    gstNumber: "[OWNER INPUT: GST Number]"
  }
};
