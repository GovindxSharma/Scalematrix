import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('===============================================================');
console.log('Starting Microservices Architecture Mesh (4 Processes)...');
console.log('===============================================================');

const services = [
  { name: 'Catalog Service', file: 'services/catalog-service.js', port: 5001 },
  { name: 'Inventory Service', file: 'services/inventory-service.js', port: 5002 },
  { name: 'Order Service', file: 'services/order-service.js', port: 5003 },
  { name: 'API Gateway', file: 'gateway.js', port: 4003 },
];

const children = [];

services.forEach((s) => {
  const filePath = path.join(__dirname, s.file);
  const child = fork(filePath, [], {
    env: { ...process.env, PORT: s.port.toString() },
  });

  children.push(child);
});

process.on('SIGINT', () => {
  console.log('\nGracefully stopping all microservices...');
  children.forEach((c) => c.kill());
  process.exit(0);
});
