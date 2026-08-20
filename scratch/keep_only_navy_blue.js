async function keepOnlyNavyBlueProduct() {
  const API_URL = 'https://www.missrezanna.com/api/v1';

  try {
    // 1. Login to get token
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

    if (!token) {
      throw new Error('Admin login failed');
    }
    console.log('Logged in as Admin successfully.');

    // 2. Fetch all products
    const productsRes = await fetch(`${API_URL}/products?limit=100`);
    const productsData = await productsRes.json();
    const products = productsData.data?.products || [];

    console.log(`Found ${products.length} total products in database.`);

    for (const prod of products) {
      if (prod.slug === 'navy-blue-embroidered-kurta-pant-set' || prod.id === 1) {
        console.log(`Keeping active: ${prod.name} (ID: ${prod.id})`);
        // Ensure it's active
        await fetch(`${API_URL}/products/${prod.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'active' })
        });
      } else {
        console.log(`Archiving product: ${prod.name} (ID: ${prod.id})`);
        await fetch(`${API_URL}/products/${prod.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'archived' })
        });
      }
    }

    console.log('All other products archived successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

keepOnlyNavyBlueProduct();
