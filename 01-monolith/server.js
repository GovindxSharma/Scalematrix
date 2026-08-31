import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 4001;

app.use(express.json());

// -------------------------------------------------------------
// 1. Single In-Memory Data Store (Unified Database Simulation)
// -------------------------------------------------------------
const products = [
  { id: 'p1', name: 'Ultra-Wide Curved Monitor 34"', category: 'Electronics', price: 499.99, stock: 100 },
  { id: 'p2', name: 'Wireless Mechanical Keyboard', category: 'Accessories', price: 129.99, stock: 50 },
  { id: 'p3', name: 'Ergonomic Office Chair', category: 'Office', price: 299.99, stock: 30 },
  { id: 'p4', name: 'Noise-Cancelling Headphones', category: 'Audio', price: 199.99, stock: 25 },
];

const orders = [];
let nextOrderId = 1;

// -------------------------------------------------------------
// 2. Monolith Endpoints (All domains in 1 single process)
// -------------------------------------------------------------

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', architecture: 'Single Monolith', pid: process.pid, port: PORT });
});

// Catalog: List & Search
app.get('/api/products', (req, res) => {
  const { search } = req.query;
  if (search) {
    const q = search.toLowerCase();
    return res.json(products.filter((p) => p.name.toLowerCase().includes(q)));
  }
  res.json(products);
});

// Inventory: Get Product Stock
app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Orders & Checkout (Atomic stock mutation in single process)
app.post('/api/orders/checkout', (req, res) => {
  const { productId = 'p1', userId = 'guest_user' } = req.body;
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Mutex condition check in single thread
  if (product.stock <= 0) {
    return res.status(409).json({ error: 'Out of stock' });
  }

  product.stock--;

  const order = {
    orderId: `ord_mono_${nextOrderId++}`,
    productId: product.id,
    productName: product.name,
    price: product.price,
    userId,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  orders.push(order);

  res.status(201).json({
    success: true,
    message: 'Order confirmed in Monolith',
    order,
    remainingStock: product.stock,
  });
});

app.listen(PORT, () => {
  console.log(`[01-MONOLITH] Single Process Monolith listening on http://localhost:${PORT} (PID: ${process.pid})`);
});
