async function updateRemoteProduct() {
  const API_URL = 'https://www.missrezanna.com/api/v1';

  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@missrezanna.com',
        password: 'admin123'
      })
    });

    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken || loginData.accessToken || loginData.token;

    const richDesc = `
      <p style="font-size: 1.05rem; font-style: italic; color: #b89728; margin-bottom: 12px;">A deeper expression of contemporary Indian elegance.</p>
      <p style="margin-bottom: 16px; font-weight: 500; line-height: 1.6;">A refined navy blue kurta pant set featuring intricate multicolour floral embroidery, designed for the modern woman who appreciates understated elegance.</p>
      
      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 20px 0 10px; color: #111;">Elegance Meets Contemporary Indian Craftsmanship</h4>
      <p style="margin-bottom: 12px;">This sophisticated navy blue kurta pant set features intricate floral embroidery across the front and sleeves, creating a beautifully balanced statement while keeping the overall look refined.</p>
      <p style="margin-bottom: 12px;">The deep navy base gives the ensemble a timeless character, while the delicate multicolour floral detailing adds depth and individuality. Paired with matching straight-cut pants, the set creates an effortlessly polished silhouette.</p>
      <p style="margin-bottom: 16px;">Designed for women who prefer graceful dressing without excessive embellishment, this ensemble transitions beautifully from festive gatherings to intimate celebrations and elegant evening occasions.</p>
      
      <p style="background: #f9f8f6; padding: 12px 16px; border-left: 3px solid #b89728; margin-bottom: 20px; font-size: 0.95rem;">
        <strong>Style It With:</strong> Minimal earrings, delicate bracelets and classic heels for a polished occasion-ready look.
      </p>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">✦ Key Product Highlights</h4>
      <ul style="padding-left: 20px; margin-bottom: 24px; line-height: 1.9; font-size: 0.95rem;">
        <li>✦ Intricate floral embroidery</li>
        <li>✦ Rich navy blue colour</li>
        <li>✦ Coordinated kurta and pant set</li>
        <li>✦ Contemporary ethnic silhouette</li>
        <li>✦ Elegant 3/4 sleeves</li>
        <li>✦ Refined Mandarin neckline</li>
        <li>✦ Designed for versatile occasions</li>
        <li>✦ Premium statement look with understated elegance</li>
      </ul>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">📋 Kurta Specifications</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; width: 40%;">Colour:</td><td style="padding: 8px 0;">Navy Blue</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Embroidery:</td><td style="padding: 8px 0;">Multicolour Floral Embroidery</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Neck:</td><td style="padding: 8px 0;">Mandarin / Keyhole Neck</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Sleeves:</td><td style="padding: 8px 0;">3/4 Sleeve</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Silhouette:</td><td style="padding: 8px 0;">Straight / Relaxed Fit</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Length:</td><td style="padding: 8px 0;">Long Kurta</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Front:</td><td style="padding: 8px 0;">Embroidered Front &amp; Sleeves</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Side Slit:</td><td style="padding: 8px 0;">Yes</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Hem:</td><td style="padding: 8px 0;">Embroidered Border</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Closure:</td><td style="padding: 8px 0;">Front neckline opening</td></tr>
      </table>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">👖 Pant Specifications</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; width: 40%;">Colour:</td><td style="padding: 8px 0;">Matching Navy Blue</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Style:</td><td style="padding: 8px 0;">Straight / Wide Straight</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Fit:</td><td style="padding: 8px 0;">Regular Fit</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Length:</td><td style="padding: 8px 0;">Full Length</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Pattern:</td><td style="padding: 8px 0;">Solid</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Set Type:</td><td style="padding: 8px 0;">Coordinated Bottom</td></tr>
      </table>
    `;

    const updateRes = await fetch(`${API_URL}/products/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Navy Blue Floral Embroidered Kurta Pant Set',
        slug: 'navy-blue-embroidered-kurta-pant-set',
        status: 'active',
        price: 4500,
        description: richDesc,
        seoTitle: 'Navy Blue Embroidered Kurta Pant Set for Women | MISS REZANNA',
        seoDescription: 'Shop the navy blue embroidered kurta pant set by MISS REZANNA, featuring intricate floral embroidery and a sophisticated contemporary silhouette.',
        seoKeywords: 'navy blue kurta pant set, navy blue kurta set for women, floral embroidered kurta set, embroidered kurta pant set, premium kurta set for women',
        images: [
          'images/navy-blue-embroidered-kurta-pant-set-1.png',
          'images/navy-blue-embroidered-kurta-pant-set-2.png',
          'images/navy-blue-embroidered-kurta-pant-set-3.png',
          'images/navy-blue-embroidered-kurta-pant-set-4.jpg',
          'images/navy-blue-embroidered-kurta-pant-set-5.jpg'
        ]
      })
    });

    const updateData = await updateRes.json();
    console.log('Update status:', updateRes.status, updateData.message);

  } catch (err) {
    console.error('Remote update error:', err.message);
  }
}

updateRemoteProduct();
