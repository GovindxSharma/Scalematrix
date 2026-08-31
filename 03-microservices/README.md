# 03. Microservices Architecture: Architecture & Scaling Guide

A friendly, plain-English guide to understanding how Microservices work, the hidden network taxes they introduce, and how to scale them to millions of requests per second with gRPC and circuit breakers.

---

## 1. What are Microservices in Plain English?

### The Everyday Analogy: Separate Shops Across Town Connected by Couriers
Instead of keeping all chefs in one restaurant kitchen:
- You build a **separate Bakery building** (Catalog Service) on 1st Street.
- You build a **separate Butcher shop** (Inventory Service) on 5th Street.
- You build a **separate Checkout office** (Order Service) on 10th Street.
- You place a **Receptionist** (The API Gateway) at the main plaza.
- Whenever a customer orders a meal, a courier on a bicycle must ride back and forth between all 3 buildings in city traffic (**Network Hop Latency**).

**Why it's awesome:**
- **Infinite Scalability:** If the Bakery gets 10,000 customers for croissants, you can hire 50 bakers for the bakery without touching the butcher shop.
- **Independent Deployments:** The checkout team can update their payment code on Friday morning without needing permission from the catalog team.
- **Fault Isolation:** If the bakery catches fire, people can still buy meat at the butcher shop.

**Where it breaks (The Hidden Taxes):**
- **Network Hop Latency:** Every inter-service HTTP REST call adds 5ms–20ms of network latency. A chain of 4 microservice hops multiplies response times (20ms * 4 = 80ms).
- **High Cloud Bills:** You pay for separate cloud servers, load balancers, and network ingress/egress fees for each shop ($/month).
- **Distributed Transactions:** If the order service charges money, but the inventory service fails, you must execute complex refund logic (**SAGA Pattern**) to prevent orphaned charges.

---

## 2. How the Code Works Step-by-Step

In this directory:
- **`gateway.js`**: Central API Gateway Reverse Proxy running on Port `4003`.
- **`services/catalog-service.js`**: Standalone Product Catalog Service on Port `5001`.
- **`services/inventory-service.js`**: Standalone Stock & Reservation Service on Port `5002`.
- **`services/order-service.js`**: Standalone Order Orchestration Service on Port `5003`.
- **`start-all.js`**: 1-Command script that launches all 4 services concurrently.

### A. The API Gateway (`gateway.js`)
Routes incoming public requests to the appropriate internal microservice:
```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Public entry point proxies to private microservices
app.use('/api/products', createProxyMiddleware({ target: 'http://localhost:5001', changeOrigin: true }));
app.use('/api/inventory', createProxyMiddleware({ target: 'http://localhost:5002', changeOrigin: true }));
app.use('/api/orders', createProxyMiddleware({ target: 'http://localhost:5003', changeOrigin: true }));

app.listen(4003, () => console.log('API Gateway running on Port 4003'));
```

### B. Inter-Service RPC Communication (`services/order-service.js`)
When an order is created, the Order Service makes network calls to the Inventory Service:
```javascript
// Order Service calls Inventory Service across the network
const inventoryRes = await fetch(`http://localhost:5002/api/inventory/reserve`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId, quantity })
});
```

---

## 3. Physical Breaking Points: What Causes It to Fail?

| Physical Limit | What Happens | Real-World Effect |
| :--- | :--- | :--- |
| **1. Synchronous REST Waterfall** | Chaining multiple synchronous HTTP/1.1 REST calls adds TCP connection handshake overhead and JSON text serialization taxes. | Latency cascades from 2ms to 60ms+ per user click. |
| **2. Socket Descriptor Exhaustion (`EMFILE`)** | Under 150,000+ req/s, opening thousands of simultaneous HTTP sockets exhausts the OS file descriptor table. | Server crashes with `Error: EMFILE (Too many open files)`. |
| **3. Cascading Dependency Failure** | If the Inventory Service slows down, the Order Service hangs waiting for replies, creating a backlog that takes down the entire system. | Complete outage unless protected by Circuit Breakers. |

---

## 4. How to Scale & Fix It (Step-by-Step)

### Step 1: Replace HTTP/1.1 REST with Binary gRPC (HTTP/2 Multiplexing)
- Replaces bulky text JSON (~14.8 KB) with compact binary Protocol Buffers (~1.6 KB).
- Reuses 1 single persistent TCP connection for thousands of concurrent multiplexed streams (0ms handshake tax).
*Result:* Network hop latency drops by 75%!

### Step 2: Add Circuit Breakers with Fallbacks
When a downstream microservice fails:
1. Trip the circuit breaker instantly after 3 consecutive errors.
2. Return a lightweight cached fallback response (e.g. cached product catalog) without waiting for timeouts.
3. Automatically probe the service to close the circuit when it recovers.

### Step 3: Distributed Mutex Sharding (Redlock)
Distribute inventory lock keys across Redis cluster nodes to prevent flash-sale lock contention.

---

## 5. How to Run It Standalone

You can start the complete Microservices mesh with 1 command:

```bash
# Launches Gateway (4003) + Catalog (5001) + Inventory (5002) + Orders (5003)
npm run start:microservices
```

Test it through the API Gateway:
```bash
# Get products through API Gateway
curl http://localhost:4003/api/products

# Place an order through API Gateway
curl -X POST http://localhost:4003/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"p1","quantity":1,"userEmail":"alex@example.com"}'
```
