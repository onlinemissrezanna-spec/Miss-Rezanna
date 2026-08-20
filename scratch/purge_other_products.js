async function purgeOtherProducts() {
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

    const listRes = await fetch(`${API_URL}/products?limit=100`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    const products = listData.data?.products || listData.products || [];

    console.log(`Found ${products.length} products total in database.`);

    for (const p of products) {
      if (p.id !== 1 && p.slug !== 'navy-blue-embroidered-kurta-pant-set') {
        console.log(`Deleting product ID ${p.id} (${p.name})...`);
        const delRes = await fetch(`${API_URL}/products/${p.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const delData = await delRes.json();
        console.log(`Deleted ID ${p.id}: ${delRes.status}`, delData.message);
      } else {
        console.log(`PRESERVING Target Product ID ${p.id} (${p.name})`);
      }
    }

    console.log('Purge completed!');
  } catch (err) {
    console.error('Purge error:', err.message);
  }
}

purgeOtherProducts();
