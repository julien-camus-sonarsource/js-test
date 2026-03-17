/**
 * Order processing and discount calculation engine
 */

function calculateDiscount(order) {
  let discount = 0;

  // Volume discount
  if (order.items.length > 10) {
    discount += 0.15;
  } else if (order.items.length > 5) {
    discount += 0.10;
  }

  // Loyalty discount
  if (order.customer.memberSince) {
    const years = (Date.now() - new Date(order.customer.memberSince).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (years > 5) {
      discount += 0.05;
    }
  }

  // Coupon discount
  if (order.couponCode) {
    const couponDiscount = validateCoupon(order.couponCode);
    discount += couponDiscount;
  }

  // Cap total discount at 30%
  return Math.min(discount, 0.30);
}

function validateCoupon(code) {
  const coupons = {
    'SAVE10': 0.10,
    'WELCOME': 0.05,
    'VIP20': 0.20,
  };
  return coupons[code] || 0;
}

function processOrder(order) {
  if (!order || !order.items || order.items.length === 0) {
    throw new Error('Invalid order: must contain at least one item');
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = calculateDiscount(order);
  const discountedTotal = subtotal * (1 - discount);

  // Tax calculation
  const taxRate = getTaxRate(order.shippingAddress?.state);
  const tax = discountedTotal * taxRate;
  const total = discountedTotal + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100),
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: order.items.length,
  };
}

function getTaxRate(state) {
  const rates = {
    'CA': 0.0725,
    'NY': 0.08,
    'TX': 0.0625,
    'FL': 0.06,
    'WA': 0.065,
  };
  return rates[state] || 0.05; // default 5% for unknown states
}

function refundOrder(order, reason) {
  if (order.status !== 'completed') {
    throw new Error(`Cannot refund order in status: ${order.status}`);
  }

  const daysSinceOrder = (Date.now() - new Date(order.completedAt).getTime()) / (24 * 60 * 60 * 1000);
  if (daysSinceOrder > 30) {
    throw new Error('Refund window has expired (30 days)');
  }

  return {
    orderId: order.id,
    refundAmount: order.total,
    reason,
    processedAt: new Date().toISOString(),
  };
}

module.exports = { calculateDiscount, processOrder, getTaxRate, refundOrder };
