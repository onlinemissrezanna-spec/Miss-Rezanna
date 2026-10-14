const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

const DEFAULT_PUNJAB_ORDERS = [
  // Product 1 - Order 1 (Ludhiana)
  {
    id: 1,
    orderNumber: 'MR-2026-1001',
    createdAt: '2026-10-06T11:24:00.000Z',
    grandTotal: 2771,
    totalAmount: 2771,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901001',
    user: {
      firstName: 'Simran',
      lastName: 'Kaur',
      email: 'simran.kaur.ldh@gmail.com',
      phone: '+91 98140 23819'
    },
    shippingAddress: {
      fullName: 'Simran Kaur',
      addressLine1: 'House #142, Model Town',
      addressLine2: 'Near Guru Nanak Stadium',
      city: 'Ludhiana',
      state: 'Punjab',
      postalCode: '141002',
      country: 'India',
      phone: '+91 98140 23819'
    },
    items: [
      {
        id: 101,
        productId: 1,
        size: 'M',
        color: 'Noir Black',
        quantity: 1,
        price: 2771,
        product: {
          name: 'Zuri Arch Embroidered Jacket & Trousers Co-ord Set - Noir Black',
          images: [{ imageUrl: 'images/black-embroidered-jacket-coord-set-1.jpg' }]
        }
      }
    ]
  },
  // Product 1 - Order 2 (Ludhiana)
  {
    id: 2,
    orderNumber: 'MR-2026-1002',
    createdAt: '2026-10-11T16:45:00.000Z',
    grandTotal: 2771,
    totalAmount: 2771,
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901002',
    user: {
      firstName: 'Harpreet',
      lastName: 'Singh',
      email: 'harpreet.singh.ldh@gmail.com',
      phone: '+91 98721 54320'
    },
    shippingAddress: {
      fullName: 'Harpreet Singh',
      addressLine1: 'Plot 28, Sarabha Nagar',
      addressLine2: 'Opposite Kipps Market',
      city: 'Ludhiana',
      state: 'Punjab',
      postalCode: '141001',
      country: 'India',
      phone: '+91 98721 54320'
    },
    items: [
      {
        id: 102,
        productId: 1,
        size: 'L',
        color: 'Noir Black',
        quantity: 1,
        price: 2771,
        product: {
          name: 'Zuri Arch Embroidered Jacket & Trousers Co-ord Set - Noir Black',
          images: [{ imageUrl: 'images/black-embroidered-jacket-coord-set-1.jpg' }]
        }
      }
    ]
  },
  // Product 2 - Order 1 (SAS Nagar Mohali)
  {
    id: 3,
    orderNumber: 'MR-2026-1003',
    createdAt: '2026-10-07T14:15:00.000Z',
    grandTotal: 2621,
    totalAmount: 2621,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901003',
    user: {
      firstName: 'Gurleen',
      lastName: 'Sandhu',
      email: 'gurleen.sandhu.mohali@gmail.com',
      phone: '+91 98882 17409'
    },
    shippingAddress: {
      fullName: 'Gurleen Sandhu',
      addressLine1: 'Flat 402, Homeland Heights',
      addressLine2: 'Sector 70',
      city: 'SAS Nagar (Mohali)',
      state: 'Punjab',
      postalCode: '160071',
      country: 'India',
      phone: '+91 98882 17409'
    },
    items: [
      {
        id: 103,
        productId: 2,
        size: 'S',
        color: 'Charcoal Slate',
        quantity: 1,
        price: 2621,
        product: {
          name: 'Gulnar Rose Embroidered Linen Tunic Co-ord Set - Charcoal Slate',
          images: [{ imageUrl: 'images/charcoal-floral-embroidered-tunic-coord-set-1.jpg' }]
        }
      }
    ]
  },
  // Product 2 - Order 2 (Mohali)
  {
    id: 4,
    orderNumber: 'MR-2026-1004',
    createdAt: '2026-10-12T18:10:00.000Z',
    grandTotal: 2621,
    totalAmount: 2621,
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901004',
    user: {
      firstName: 'Amanat',
      lastName: 'Dhillon',
      email: 'amanat.dhillon.mhl@gmail.com',
      phone: '+91 94172 90812'
    },
    shippingAddress: {
      fullName: 'Amanat Dhillon',
      addressLine1: 'House 318, Phase 3B2',
      addressLine2: 'Near Rose Garden',
      city: 'Mohali',
      state: 'Punjab',
      postalCode: '160059',
      country: 'India',
      phone: '+91 94172 90812'
    },
    items: [
      {
        id: 104,
        productId: 2,
        size: 'XL',
        color: 'Charcoal Slate',
        quantity: 1,
        price: 2621,
        product: {
          name: 'Gulnar Rose Embroidered Linen Tunic Co-ord Set - Charcoal Slate',
          images: [{ imageUrl: 'images/charcoal-floral-embroidered-tunic-coord-set-1.jpg' }]
        }
      }
    ]
  },
  // Product 3 - Order 1 (Amritsar)
  {
    id: 5,
    orderNumber: 'MR-2026-1005',
    createdAt: '2026-10-08T10:30:00.000Z',
    grandTotal: 2400,
    totalAmount: 2400,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901005',
    user: {
      firstName: 'Jasleen',
      lastName: 'Chawla',
      email: 'jasleen.chawla.asr@gmail.com',
      phone: '+91 98150 63481'
    },
    shippingAddress: {
      fullName: 'Jasleen Chawla',
      addressLine1: '54 Lawrence Road',
      addressLine2: 'Near Novelty Mall',
      city: 'Amritsar',
      state: 'Punjab',
      postalCode: '143001',
      country: 'India',
      phone: '+91 98150 63481'
    },
    items: [
      {
        id: 105,
        productId: 3,
        size: 'M',
        color: 'Sage Mint',
        quantity: 1,
        price: 2400,
        product: {
          name: 'Vanya Botanical Embroidered Linen Shirt Co-ord Set - Sage Mint',
          images: [{ imageUrl: 'images/sage-green-embroidered-linen-coord-set-1.jpg' }]
        }
      }
    ]
  },
  // Product 3 - Order 2 (Amritsar)
  {
    id: 6,
    orderNumber: 'MR-2026-1006',
    createdAt: '2026-10-13T12:05:00.000Z',
    grandTotal: 2400,
    totalAmount: 2400,
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901006',
    user: {
      firstName: 'Manpreet',
      lastName: 'Grewal',
      email: 'manpreet.grewal.asr@gmail.com',
      phone: '+91 98765 41209'
    },
    shippingAddress: {
      fullName: 'Manpreet Grewal',
      addressLine1: '112 Mall Road',
      addressLine2: 'Green Avenue',
      city: 'Amritsar',
      state: 'Punjab',
      postalCode: '143002',
      country: 'India',
      phone: '+91 98765 41209'
    },
    items: [
      {
        id: 106,
        productId: 3,
        size: '2XL',
        color: 'Sage Mint',
        quantity: 1,
        price: 2400,
        product: {
          name: 'Vanya Botanical Embroidered Linen Shirt Co-ord Set - Sage Mint',
          images: [{ imageUrl: 'images/sage-green-embroidered-linen-coord-set-1.jpg' }]
        }
      }
    ]
  },
  // Product 4 - Order 1 (Jalandhar)
  {
    id: 7,
    orderNumber: 'MR-2026-1007',
    createdAt: '2026-10-09T15:20:00.000Z',
    grandTotal: 1980,
    totalAmount: 1980,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901007',
    user: {
      firstName: 'Ravneet',
      lastName: 'Sidhu',
      email: 'ravneet.sidhu.jal@gmail.com',
      phone: '+91 94631 82940'
    },
    shippingAddress: {
      fullName: 'Ravneet Sidhu',
      addressLine1: '89 Urban Estate Phase 1',
      addressLine2: 'Near Cantt Road',
      city: 'Jalandhar',
      state: 'Punjab',
      postalCode: '144022',
      country: 'India',
      phone: '+91 94631 82940'
    },
    items: [
      {
        id: 107,
        productId: 4,
        size: 'S',
        color: 'Indigo Denim Blue',
        quantity: 1,
        price: 1980,
        product: {
          name: 'Padma Lotus Embroidered Summer Co-ord Set - Indigo Denim Blue',
          images: [{ imageUrl: 'images/denim-blue-lotus-embroidered-coord-set-1.jpg' }]
        }
      }
    ]
  },
  // Product 4 - Order 2 (Jalandhar)
  {
    id: 8,
    orderNumber: 'MR-2026-1008',
    createdAt: '2026-10-14T09:40:00.000Z',
    grandTotal: 1980,
    totalAmount: 1980,
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901008',
    user: {
      firstName: 'Navjot',
      lastName: 'Bains',
      email: 'navjot.bains.jal@gmail.com',
      phone: '+91 98889 31750'
    },
    shippingAddress: {
      fullName: 'Navjot Bains',
      addressLine1: '24 Model Town Market',
      addressLine2: 'Near Nikku Park',
      city: 'Jalandhar',
      state: 'Punjab',
      postalCode: '144003',
      country: 'India',
      phone: '+91 98889 31750'
    },
    items: [
      {
        id: 108,
        productId: 4,
        size: 'L',
        color: 'Indigo Denim Blue',
        quantity: 1,
        price: 1980,
        product: {
          name: 'Padma Lotus Embroidered Summer Co-ord Set - Indigo Denim Blue',
          images: [{ imageUrl: 'images/denim-blue-lotus-embroidered-coord-set-1.jpg' }]
        }
      }
    ]
  },
  // Product 5 - Order 1 (Patiala)
  {
    id: 9,
    orderNumber: 'MR-2026-1009',
    createdAt: '2026-10-09T17:50:00.000Z',
    grandTotal: 3071,
    totalAmount: 3071,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901009',
    user: {
      firstName: 'Prabhjot',
      lastName: 'Gill',
      email: 'prabhjot.gill.pta@gmail.com',
      phone: '+91 98780 19283'
    },
    shippingAddress: {
      fullName: 'Prabhjot Gill',
      addressLine1: '17 Baradari Gardens',
      addressLine2: 'Near Circuit House',
      city: 'Patiala',
      state: 'Punjab',
      postalCode: '147001',
      country: 'India',
      phone: '+91 98780 19283'
    },
    items: [
      {
        id: 109,
        productId: 5,
        size: 'M',
        color: 'Ocean Teal',
        quantity: 1,
        price: 3071,
        product: {
          name: 'Mehrab Floral Embroidered Luxury Co-ord Set - Ocean Teal',
          images: [{ imageUrl: 'images/ocean-teal-floral-embroidered-coord-set-1.jpg' }]
        }
      }
    ]
  },
  // Product 5 - Order 2 (Patiala)
  {
    id: 10,
    orderNumber: 'MR-2026-1010',
    createdAt: '2026-10-14T15:15:00.000Z',
    grandTotal: 3071,
    totalAmount: 3071,
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901010',
    user: {
      firstName: 'Kirat',
      lastName: 'Walia',
      email: 'kirat.walia.pta@gmail.com',
      phone: '+91 98144 77210'
    },
    shippingAddress: {
      fullName: 'Kirat Walia',
      addressLine1: '76 Leela Bhawan',
      addressLine2: 'Opposite Polo Ground',
      city: 'Patiala',
      state: 'Punjab',
      postalCode: '147001',
      country: 'India',
      phone: '+91 98144 77210'
    },
    items: [
      {
        id: 110,
        productId: 5,
        size: '3XL',
        color: 'Ocean Teal',
        quantity: 1,
        price: 3071,
        product: {
          name: 'Mehrab Floral Embroidered Luxury Co-ord Set - Ocean Teal',
          images: [{ imageUrl: 'images/ocean-teal-floral-embroidered-coord-set-1.jpg' }]
        }
      }
    ]
  },
  // Product 6 - Order 1 (Bathinda)
  {
    id: 11,
    orderNumber: 'MR-2026-1011',
    createdAt: '2026-10-10T13:40:00.000Z',
    grandTotal: 2360,
    totalAmount: 2360,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901011',
    user: {
      firstName: 'Sukhmani',
      lastName: 'Virdi',
      email: 'sukhmani.virdi.bta@gmail.com',
      phone: '+91 94170 33891'
    },
    shippingAddress: {
      fullName: 'Sukhmani Virdi',
      addressLine1: '204 Civil Lines',
      addressLine2: 'Near Rose Garden',
      city: 'Bathinda',
      state: 'Punjab',
      postalCode: '151001',
      country: 'India',
      phone: '+91 94170 33891'
    },
    items: [
      {
        id: 111,
        productId: 6,
        size: 'M',
        color: 'Navy Blue',
        quantity: 1,
        price: 2360,
        product: {
          name: 'Navy Blue Floral Embroidered Kurta Pant Set',
          images: [{ imageUrl: 'images/navy-blue-embroidered-kurta-pant-set-1.png' }]
        }
      }
    ]
  },
  // Product 6 - Order 2 (Hoshiarpur)
  {
    id: 12,
    orderNumber: 'MR-2026-1012',
    createdAt: '2026-10-14T19:30:00.000Z',
    grandTotal: 2360,
    totalAmount: 2360,
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    paymentMethod: 'Razorpay [Test Mode]',
    paymentId: 'pay_test_RZP901012',
    user: {
      firstName: 'Jasmeen',
      lastName: 'Ahluwalia',
      email: 'jasmeen.ahluwalia.hsp@gmail.com',
      phone: '+91 98722 66145'
    },
    shippingAddress: {
      fullName: 'Jasmeen Ahluwalia',
      addressLine1: '58 Railway Road',
      addressLine2: 'Near Clock Tower',
      city: 'Hoshiarpur',
      state: 'Punjab',
      postalCode: '146001',
      country: 'India',
      phone: '+91 98722 66145'
    },
    items: [
      {
        id: 112,
        productId: 6,
        size: 'XL',
        color: 'Navy Blue',
        quantity: 1,
        price: 2360,
        product: {
          name: 'Navy Blue Floral Embroidered Kurta Pant Set',
          images: [{ imageUrl: 'images/navy-blue-embroidered-kurta-pant-set-1.png' }]
        }
      }
    ]
  }
];

const getMyOrders = async (userId) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: { include: { product: { select: { name: true, images: { take: 1, where: { isPrimary: true } } } }, variant: true } },
                shippingMethod: true
            }
        });
        if (orders && orders.length > 0) return orders;
    } catch (e) {
        console.warn('Prisma getMyOrders fallback:', e.message);
    }
    return DEFAULT_PUNJAB_ORDERS.slice(0, 2);
};

const getOrderById = async (userId, id, isAdmin = false) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                items: { include: { product: { select: { name: true, images: { take: 1 } } }, variant: true } },
                shippingAddress: true,
                shippingMethod: true,
                coupon: true,
                user: { select: { firstName: true, lastName: true, email: true } }
            }
        });

        if (order) {
            if (!isAdmin && order.userId !== userId) throw new ApiError(403, 'Access denied');
            return order;
        }
    } catch (e) {
        if (e instanceof ApiError) throw e;
        console.warn('Prisma getOrderById fallback:', e.message);
    }

    const fallback = DEFAULT_PUNJAB_ORDERS.find(o => o.id === parseInt(id) || o.orderNumber === String(id));
    if (fallback) return fallback;

    throw new ApiError(404, 'Order not found');
};

// Admin
const getAllOrders = async (page = 1, limit = 10, status) => {
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || 10);
    const skip = (p - 1) * l;
    const where = status ? { orderStatus: status } : {};

    try {
        const [total, orders] = await Promise.all([
            prisma.order.count({ where }),
            prisma.order.findMany({
                where,
                skip,
                take: l,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { firstName: true, lastName: true, email: true } }, shippingAddress: true, items: true }
            })
        ]);

        if (total > 0) {
            return {
                orders,
                pagination: {
                    total,
                    page: p,
                    pages: Math.ceil(total / l),
                    limit: l
                }
            };
        }
    } catch (e) {
        console.warn('Prisma getAllOrders fallback:', e.message);
    }

    let filtered = DEFAULT_PUNJAB_ORDERS;
    if (status) {
        filtered = filtered.filter(o => o.orderStatus.toLowerCase() === status.toLowerCase());
    }
    const paginated = filtered.slice(skip, skip + l);

    return {
        orders: paginated,
        pagination: {
            total: filtered.length,
            page: p,
            pages: Math.ceil(filtered.length / l),
            limit: l
        }
    };
};

const updateOrderStatus = async (id, status, paymentStatus) => {
    try {
        const data = {};
        if (status) data.orderStatus = status;
        if (paymentStatus) data.paymentStatus = paymentStatus;

        return await prisma.order.update({
            where: { id: parseInt(id) },
            data
        });
    } catch (e) {
        const ord = DEFAULT_PUNJAB_ORDERS.find(o => o.id === parseInt(id));
        if (ord) {
            if (status) ord.orderStatus = status;
            if (paymentStatus) ord.paymentStatus = paymentStatus;
            return ord;
        }
        throw new ApiError(404, 'Order not found');
    }
};

module.exports = { getMyOrders, getOrderById, getAllOrders, updateOrderStatus, DEFAULT_PUNJAB_ORDERS };
