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
  constructor() {
    this.items = [];
    this.discountCode = null;
  }

  addItem(item) {
    const existing = this.items.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push(item);
    }
  }

  removeItem(id) {
    this.items = this.items.filter((i) => i.id !== id);
  }

  applyDiscount(code) {
    const validCodes = { SAVE10: 0.1, SAVE20: 0.2 };
    if (!validCodes[code]) throw new Error(`Invalid discount code: ${code}`);
    this.discountCode = code;
    return validCodes[code];
  }

  total() {
    const subtotal = this.items.reduce((sum, item) => sum + item.subtotal(), 0);
    if (!this.discountCode) return subtotal;
    const discountRate = { SAVE10: 0.1, SAVE20: 0.2 }[this.discountCode];
    return subtotal * (1 - discountRate);
  }

  checkout(paymentService) {
    if (this.items.length === 0) throw new Error("Cart is empty");
    const amount = this.total();
    return paymentService.charge(amount);
  }
}

class PaymentService {
  charge(amount) {
    if (amount <= 0) throw new Error("Invalid amount");
    console.log(`Charged $${amount.toFixed(2)}`);
    return { success: true, amount };
  }
}

const cart = new Cart();
cart.addItem(new CartItem("a", "Widget", 9.99, 2));
cart.addItem(new CartItem("b", "Gadget", 24.99, 1));
cart.applyDiscount("SAVE10");
const payment = new PaymentService();
console.log(cart.checkout(payment));
