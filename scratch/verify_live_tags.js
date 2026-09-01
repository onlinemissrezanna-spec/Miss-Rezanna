async function verifyTags() {
  const pages = [
    'https://www.missrezanna.com/',
    'https://www.missrezanna.com/collection',
    'https://www.missrezanna.com/product?id=navy-blue-embroidered-kurta-pant-set',
    'https://www.missrezanna.com/about'
  ];

  console.log('=== VERIFYING LIVE TAG INTEGRATION ===\n');

  for (const pageUrl of pages) {
    try {
      const res = await fetch(pageUrl);
      const html = await res.text();

      const hasGtmHead = html.includes('GTM-KPMHRF2M') && html.includes('gtm.js');
      const hasGtmBody = html.includes('ns.html?id=GTM-KPMHRF2M');
      const hasClarity = html.includes('y7axoaay98') && html.includes('clarity.ms');

      console.log(`Page: ${pageUrl}`);
      console.log(`  - HTTP Status: ${res.status}`);
      console.log(`  - GTM Head Script (GTM-KPMHRF2M): ${hasGtmHead ? '✅ ACTIVE' : '❌ NOT FOUND'}`);
      console.log(`  - GTM Body Noscript: ${hasGtmBody ? '✅ ACTIVE' : '❌ NOT FOUND'}`);
      console.log(`  - Microsoft Clarity (y7axoaay98): ${hasClarity ? '✅ ACTIVE' : '❌ NOT FOUND'}\n`);
    } catch (err) {
      console.error(`Error checking ${pageUrl}:`, err.message);
    }
  }

  console.log('=== TESTING EXTERNAL TAG CONTAINERS ===\n');
  try {
    const gtmRes = await fetch('https://www.googletagmanager.com/gtm.js?id=GTM-KPMHRF2M');
    console.log(`GTM Container URL (GTM-KPMHRF2M): HTTP ${gtmRes.status} ${gtmRes.status === 200 ? '✅ REACHABLE' : '⚠️ PENDING PUBLISH'}`);
  } catch (e) {
    console.log('GTM container check error:', e.message);
  }

  try {
    const clarityRes = await fetch('https://www.clarity.ms/tag/y7axoaay98');
    console.log(`Clarity Tag URL (y7axoaay98): HTTP ${clarityRes.status} ${clarityRes.status === 200 ? '✅ REACHABLE & RECORDING' : '⚠️ UNREACHABLE'}`);
  } catch (e) {
    console.log('Clarity tag check error:', e.message);
  }
}

verifyTags();
