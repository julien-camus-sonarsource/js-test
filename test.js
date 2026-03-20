class CartItem {
  constructor(id, name, price, quantity) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }

  subtotal() {
    return this.price * this.quantity;
  }
}

class Cart {
  constructor(taxRate = 0.08) {
    this.items = new Map();
    this.discountCode = null;
    this.taxRate = taxRate;
  }

  addItem(item) {
    if (this.items.has(item.id)) {
      this.items.get(item.id).quantity += item.quantity;
    } else {
      this.items.set(item.id, item);
    }
  }

  removeItem(id) {
    this.items.delete(id);
  }

  applyDiscount(code) {
    const validCodes = { SAVE10: 0.1, SAVE20: 0.2 };
    if (!validCodes[code]) throw new Error(`Invalid discount code: ${code}`);
    this.discountCode = code;
    return validCodes[code];
  }

  subtotal() {
    return [...this.items.values()].reduce((sum, item) => sum + item.subtotal(), 0);
  }

  tax() {
    return this.subtotal() * this.taxRate;
  }

  total() {
    const sub = this.subtotal();
    const discountRate = this.discountCode ? { SAVE10: 0.1, SAVE20: 0.2 }[this.discountCode] : 0;
    const discounted = sub * (1 - discountRate);
    return discounted + discounted * this.taxRate;
  }

  checkout(paymentService) {
    if (this.items.size === 0) throw new Error("Cart is empty");
    return paymentService.charge(this.total());
  }
}

class PaymentService {
  charge(amount) {
    if (amount <= 0) throw new Error("Invalid amount");
    console.log(`Charged $${amount.toFixed(2)}`);
    return { success: true, amount };
  }
}

const cart = new Cart(0.1);
cart.addItem(new CartItem("a", "Widget", 9.99, 2));
cart.addItem(new CartItem("b", "Gadget", 24.99, 1));
cart.applyDiscount("SAVE20");
console.log(cart.checkout(new PaymentService()));
