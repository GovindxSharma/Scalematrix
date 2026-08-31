import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5001;

app.use(express.json());

const catalogDb = [
  { id: 'p1', name: 'Ultra-Wide Curved Monitor 34"', category: 'Electronics', price: 499.99 },
  { id: 'p2', name: 'Wireless Mechanical Keyboard', category: 'Accessories', price: 129.99 },
  { id: 'p3', name: 'Ergonomic Office Chair', category: 'Office', price: 299.99 },
  { id: 'p4', name: 'Noise-Cancelling Headphones', category: 'Audio', price: 199.99 },
];

app.get('/health', (req, res) => {
  res.json({ service: 'Catalog Microservice', port: PORT, status: 'healthy' });
});

app.get('/products', (req, res) => {
  const { search } = req.query;
  if (search) {
    const q = search.toLowerCase();
    return res.json(catalogDb.filter((p) => p.name.toLowerCase().includes(q)));
  }
  res.json(catalogDb);
});

app.get('/products/:id', (req, res) => {
  const product = catalogDb.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`[MICROSERVICE: CATALOG] Running on http://localhost:${PORT}`);
});
