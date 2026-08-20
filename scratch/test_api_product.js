async function checkProductApi() {
  try {
    const res = await fetch('https://www.missrezanna.com/api/v1/products?limit=100&status=active');
    const data = await res.json();
    console.log('--- PRODUCTS LIST API RESPONSE ---');
    console.log(JSON.stringify(data, null, 2));

    const singleRes = await fetch('https://www.missrezanna.com/api/v1/products/1');
    const singleData = await singleRes.json();
    console.log('--- SINGLE PRODUCT API RESPONSE ---');
    console.log(JSON.stringify(singleData, null, 2));
  } catch (err) {
    console.error('Error fetching API:', err);
  }
}

checkProductApi();
