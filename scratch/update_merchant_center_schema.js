const fs = require('fs');

if (fs.existsSync('product.html')) {
  let content = fs.readFileSync('product.html', 'utf8');

  // Replace existing Product schema script with Google Merchant Center compliant schema
  const merchantSchema = `  <!-- Product Schema JSON-LD (Google Merchant Center & Rich Snippets Compliant) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Navy Blue Floral Embroidered Kurta Pant Set",
    "image": [
      "https://www.missrezanna.com/images/navy-blue-embroidered-kurta-pant-set-1.png",
      "https://www.missrezanna.com/images/navy-blue-embroidered-kurta-pant-set-2.png",
      "https://www.missrezanna.com/images/navy-blue-embroidered-kurta-pant-set-3.png",
      "https://www.missrezanna.com/images/navy-blue-embroidered-kurta-pant-set-4.jpg",
      "https://www.missrezanna.com/images/navy-blue-embroidered-kurta-pant-set-5.jpg"
    ],
    "description": "A refined navy blue kurta pant set featuring intricate multicolour floral embroidery, designed for the modern woman who appreciates understated elegance.",
    "sku": "MR-KU-001",
    "mpn": "MR-KU-001",
    "brand": {
      "@type": "Brand",
      "name": "MISS REZANNA"
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "IN",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 14,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "0",
        "currency": "INR"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "IN"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 2,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 3,
          "maxValue": 5,
          "unitCode": "DAY"
        }
      }
    },
    "offers": {
      "@type": "Offer",
      "url": "https://www.missrezanna.com/product?id=navy-blue-embroidered-kurta-pant-set",
      "priceCurrency": "INR",
      "price": "4500",
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "MISS REZANNA"
      }
    }
  }
  </script>`;

  // Remove previous product schema block
  content = content.replace(/<!-- Product Schema JSON-LD[\s\S]*?<\/script>/gi, '');
  content = content.replace('</head>', `${merchantSchema}\n</head>`);

  fs.writeFileSync('product.html', content, 'utf8');
  console.log('Updated product.html with Google Merchant Center Schema.');
}
