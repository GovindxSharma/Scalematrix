import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5002;

app.use(express.json());

// Dedicated Database Store & Mutex Sharding
const stockLevels = new Map([
  ['p1', 100],
  ['p2', 50],
  ['p3', 30],
  ['p4', 25],
]);

app.get('/health', (req, res) => {
  res.json({ service: 'Inventory Microservice', port: PORT, status: 'healthy' });
});

// GET /inventory/:id
app.get('/inventory/:id', (req, res) => {
  const stock = stockLevels.get(req.params.id);
  if (stock === undefined) return res.status(404).json({ error: 'Stock item not found' });
  res.json({ productId: req.params.id, stock });
});

// POST /inventory/reserve (Atomic Stock Mutation API)
app.post('/inventory/reserve', (req, res) => {
  const { productId } = req.body;
  const current = stockLevels.get(productId) || 0;

  if (current <= 0) {
    return res.status(409).json({ success: false, error: 'Out of stock in Inventory Service' });
  }

  const updated = current - 1;
  stockLevels.set(productId, updated);

  res.status(200).json({
    success: true,
    productId,
    remainingStock: updated,
  });
});

app.listen(PORT, () => {
  console.log(`[MICROSERVICE: INVENTORY] Running on http://localhost:${PORT}`);
});
