/**
 * ============================================================================
 * MODULAR MONOLITH: ORDERS & CHECKOUT ORCHESTRATION MODULE
 * ============================================================================
 * 
 * WHAT IT IS:
 * - Domain module responsible for validating and orchestrating customer orders.
 * 
 * HOW IT WORKS:
 * - Coordinates across domains using isolated interfaces:
 *   1. Queries `catalog.js` to verify product pricing.
 *   2. Invokes `tryReserveStock` in `inventory.js` to atomically decrement stock.
 *   3. Emits a non-blocking `ORDER_CREATED` event via `eventBus.js`.
 * ============================================================================
 */

import express from 'express';
import { getProductById } from './catalog.js';
import { tryReserveStock } from './inventory.js';
import { eventBus } from './eventBus.js';

export const ordersRouter = express.Router();

// Orders Domain Data (Isolated Schema)
const orderDatabase = [];
let nextOrderId = 1;

// Listen for background domain events
eventBus.on('ORDER_CREATED', (order) => {
  orderDatabase.push(order);
});

// POST /api/orders/checkout (Cross-Domain Checkout with Atomic Mutex)
ordersRouter.post('/checkout', (req, res) => {
  const { productId = 'p1', userId = 'guest_user' } = req.body;

  // 1. Verify Catalog domain
  const product = getProductById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found in Catalog' });
  }

  // 2. Atomic Stock Reservation in Inventory domain
  const reservation = tryReserveStock(productId);
  if (!reservation.success) {
    return res.status(409).json({ error: 'Out of stock in Inventory domain' });
  }

  // 3. Create Order
  const order = {
    orderId: `ord_mod_${nextOrderId++}`,
    productId: product.id,
    productName: product.name,
    price: product.price,
    userId,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  // Publish non-blocking async event to persistence queue
  eventBus.publish('ORDER_CREATED', order);

  res.status(201).json({
    success: true,
    message: 'Order created in Modular Monolith',
    order,
    remainingStock: reservation.remainingStock,
  });
});

// GET /api/orders
ordersRouter.get('/', (req, res) => {
  res.json(orderDatabase);
});
