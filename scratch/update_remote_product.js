async function updateRemoteProduct() {
  const API_URL = 'https://www.missrezanna.com/api/v1';

  try {
    // 1. Admin login to get JWT token
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@missrezanna.com',
        password: 'admin123'
      })
    });

    const loginData = await loginRes.json();
    console.log('Login response status:', loginRes.status);
    
    const token = loginData.data?.accessToken || loginData.accessToken || loginData.token;
    console.log('Obtained Admin Token successfully');

    // 2. Update Product ID 1 to active status with new details
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
        description: 'A refined navy blue kurta pant set featuring intricate multicolour floral embroidery, designed for the modern woman who appreciates understated elegance.',
        seoTitle: 'Navy Blue Embroidered Kurta Pant Set for Women | MISS REZANNA',
        seoDescription: 'Shop the navy blue embroidered kurta pant set by MISS REZANNA, featuring intricate floral embroidery and a sophisticated contemporary silhouette.',
        seoKeywords: 'navy blue kurta pant set, navy blue kurta set for women, floral embroidered kurta set, embroidered kurta pant set, premium kurta set for women',
        images: [
          'images/navy-blue-embroidered-kurta-pant-set-3.png',
          'images/navy-blue-embroidered-kurta-pant-set-1.png',
          'images/navy-blue-embroidered-kurta-pant-set-2.png',
          'images/navy-blue-embroidered-kurta-pant-set-4.png',
          'images/navy-blue-embroidered-kurta-pant-set-5.png'
        ]
      })
    });

    const updateData = await updateRes.json();
    console.log('Product update status:', updateRes.status);
    console.log('Product update response:', JSON.stringify(updateData));

  } catch (err) {
    console.error('Remote update error:', err.message);
  }
}

updateRemoteProduct();
