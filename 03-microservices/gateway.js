import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 4003;

const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:5001';
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://localhost:5002';
const ORDER_URL = process.env.ORDER_URL || 'http://localhost:5003';

app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    architecture: 'Microservices with API Gateway',
    gatewayPort: PORT,
    downstreamServices: {
      catalog: CATALOG_URL,
      inventory: INVENTORY_URL,
      order: ORDER_URL,
    },
  });
});

// Proxy route: Products -> Catalog Service
app.get('/api/products', async (req, res) => {
  try {
    const url = new URL(`${CATALOG_URL}/products`);
    if (req.query.search) url.searchParams.set('search', req.query.search);
    const downstream = await fetch(url);
    const data = await downstream.json();
    res.status(downstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Catalog service unreachable', detail: err.message });
  }
});

// Proxy route: Checkout -> Order Service
app.post('/api/orders/checkout', async (req, res) => {
  try {
    const downstream = await fetch(`${ORDER_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await downstream.json();
    res.status(downstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Order service unreachable', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[API GATEWAY] Reverse Proxy running on http://localhost:${PORT}`);
});
