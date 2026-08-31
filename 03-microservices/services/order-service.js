import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5003;

const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:5001';
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://localhost:5002';

app.use(express.json());

const ordersDb = [];
let nextOrderId = 1;

app.get('/health', (req, res) => {
  res.json({ service: 'Order Microservice', port: PORT, status: 'healthy' });
});

// POST /orders/checkout (Inter-Service Network Orchestration)
app.post('/orders/checkout', async (req, res) => {
  const { productId = 'p1', userId = 'guest_user' } = req.body;

  try {
    // 1. Cross-network HTTP Hop 1: Validate Product in Catalog Service
    const catRes = await fetch(`${CATALOG_URL}/products/${productId}`);
    if (!catRes.ok) {
      return res.status(404).json({ error: 'Product not found in Catalog Service' });
    }
    const product = await catRes.json();

    // 2. Cross-network HTTP Hop 2: Reserve Stock in Inventory Service
    const invRes = await fetch(`${INVENTORY_URL}/inventory/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });

    if (!invRes.ok) {
      return res.status(409).json({ error: 'Inventory Service rejected reservation (Out of stock)' });
    }
    const invData = await invRes.json();

    // 3. Create Order Record in dedicated Orders Database
    const order = {
      orderId: `ord_micro_${nextOrderId++}`,
      productId: product.id,
      productName: product.name,
      price: product.price,
      userId,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    ordersDb.push(order);

    res.status(201).json({
      success: true,
      message: 'Order created via distributed microservices orchestration',
      order,
      remainingStock: invData.remainingStock,
    });
  } catch (err) {
    res.status(502).json({
      error: 'INTER_SERVICE_COMMUNICATION_ERROR',
      message: 'Failed to communicate with downstream microservices',
      detail: err.message,
    });
  }
});

app.get('/orders', (req, res) => {
  res.json(ordersDb);
});

app.listen(PORT, () => {
  console.log(`[MICROSERVICE: ORDER] Running on http://localhost:${PORT}`);
});
