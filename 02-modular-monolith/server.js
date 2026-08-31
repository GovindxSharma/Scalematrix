import express from 'express';
import cluster from 'cluster';
import os from 'os';
import { catalogRouter } from './modules/catalog.js';
import { inventoryRouter } from './modules/inventory.js';
import { ordersRouter } from './modules/orders.js';

const PORT = parseInt(process.env.PORT, 10) || 4002;
const NUM_WORKERS = Math.min(4, os.cpus().length || 2);

// Check if multi-core cluster mode is enabled
const USE_CLUSTER = process.env.CLUSTER !== 'false' && cluster.isPrimary;

if (USE_CLUSTER) {
  console.log(`[02-MODULAR-MONOLITH] Primary Master ${process.pid} is running. Forking ${NUM_WORKERS} worker processes...`);

  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Replacing worker...`);
    cluster.fork();
  });
} else {
  // Worker Process running Express with mounted domain modules
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      architecture: 'Modular Monolith',
      workerPid: process.pid,
      port: PORT,
      domains: ['catalog', 'inventory', 'orders'],
    });
  });

  // Mount Domain Modules (Separated Routing Boundaries)
  app.use('/api/products', catalogRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/orders', ordersRouter);

  app.listen(PORT, () => {
    console.log(`[02-MODULAR-MONOLITH] Worker process ${process.pid} listening on http://localhost:${PORT}`);
  });
}
