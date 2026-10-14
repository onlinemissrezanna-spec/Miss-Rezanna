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
  // Live storefront active - ordering open
  TEASER_MODE: false,

  // All products are IN STOCK with 10 units available per size
  ALL_PRODUCTS_OUT_OF_STOCK: false,
  STOCK_PER_SIZE: 10,

  // Razorpay Gateway in Test Mode
  RAZORPAY_TEST_MODE: true,
  RAZORPAY_KEY_ID: 'rzp_test_THMHYLikeuEJLO',

  // Countdown display and launch timing
  COUNTDOWN_START_DATETIME_IST: null,
  LAUNCH_DATETIME_IST: null,

  // Form handler endpoint for waitlist submissions
  WAITLIST_ENDPOINT: "",

  // Brand contact information
  BRAND: {
    name: "MISS REZANNA",
    legalName: "Kinshu Knitwears",
    address: "St. No. 3, E-2/2680/1, Rahon Rd, Guru Vihar, Jodhewal, Ludhiana, Punjab 141007",
    email: "info@missrezanna.com",
    whatsapp: "+91 98773 27186",
    whatsappNumber: "919877327186",
    supportHours: "Monday to Saturday, 10:00 AM – 7:00 PM IST",
    gstNumber: "03BKYPS7000M1ZM"
  }
};
