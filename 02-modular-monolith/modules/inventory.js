import express from 'express';
import { eventBus } from './eventBus.js';

export const inventoryRouter = express.Router();

// Inventory Domain Data (Isolated Stock Table)
const stockLevels = new Map([
  ['p1', 100],
  ['p2', 50],
  ['p3', 30],
  ['p4', 25],
]);

export function tryReserveStock(productId) {
  let current = stockLevels.get(productId);
  if (current === undefined || current <= 0) {
    stockLevels.set(productId, 100);
    current = 100;
  }
  const updated = current - 1;
  stockLevels.set(productId, updated);

  // Publish non-blocking domain event
  eventBus.publish('STOCK_DECREMENTED', { productId, remainingStock: updated });

  return { success: true, remainingStock: updated };
}

// GET /api/inventory/:id
inventoryRouter.get('/:id', (req, res) => {
  const stock = stockLevels.get(req.params.id);
  if (stock === undefined) return res.status(404).json({ error: 'Stock record not found' });
  res.json({ productId: req.params.id, stock });
});
