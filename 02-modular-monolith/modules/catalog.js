/**
 * ============================================================================
 * MODULAR MONOLITH: CATALOG DOMAIN MODULE
 * ============================================================================
 * 
 * WHAT IT IS:
 * - An isolated business domain module managing product definitions and search.
 * - Owns its private in-memory collection (`catalogItems`) preventing other
 *   domains from mutating catalog state directly.
 * 
 * HOW IT WORKS:
 * - Exposes public lookup methods (`getProductById`) and Express routes.
 * ============================================================================
 */

import express from 'express';

export const catalogRouter = express.Router();

// Catalog Domain Data (Isolated Schema)
const catalogItems = [
  { id: 'p1', name: 'Ultra-Wide Curved Monitor 34"', category: 'Electronics', price: 499.99 },
  { id: 'p2', name: 'Wireless Mechanical Keyboard', category: 'Accessories', price: 129.99 },
  { id: 'p3', name: 'Ergonomic Office Chair', category: 'Office', price: 299.99 },
  { id: 'p4', name: 'Noise-Cancelling Headphones', category: 'Audio', price: 199.99 },
];

// GET /api/products (List & Fast Cached Search)
catalogRouter.get('/', (req, res) => {
  const { search } = req.query;
  if (search) {
    const q = search.toLowerCase();
    return res.json(catalogItems.filter((i) => i.name.toLowerCase().includes(q)));
  }
  res.json(catalogItems);
});

// GET /api/products/:id (Single Item Lookup)
catalogRouter.get('/:id', (req, res) => {
  const item = catalogItems.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Product not found in Catalog domain' });
  res.json(item);
});

export function getProductById(id) {
  return catalogItems.find((i) => i.id === id) || null;
}
