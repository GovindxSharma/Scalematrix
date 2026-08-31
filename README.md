# ScaleMatrix: Backend Architecture, DevOps Sizing & Cloud Cost Lab

ScaleMatrix is a hands-on, interactive backend laboratory that proves real physical bottlenecks across **The Monolith**, **The Modular Monolith**, and **Microservices** using real Node.js execution.

---

## 1. What is ScaleMatrix?

ScaleMatrix is an interactive learning platform and real-world codebase designed to help developers, backend engineers, and system architects understand:
- **When to keep a simple Monolith** (and how fast it can truly run with caching).
- **When to cluster a Modular Monolith** across multi-core CPUs with an event bus.
- **When you actually need Microservices** (and the network/DevOps taxes that come with them).
- **How to calculate real cloud infrastructure costs** ($/month on AWS, GCP, DigitalOcean, and Bare-Metal).
- **How to design systems at scale** (QPS throughput, bandwidth, RAM cache allocation, storage growth, CAP theorem, and SAGA transaction rollbacks).

---

## 2. Why Did We Build This? (The Real-World Problem)

Over 80% of engineering teams prematurely migrate to Microservices. They take on distributed transaction hell, 20ms+ network hop serialization taxes, and $10x cloud bills before ever hitting single-server Monolith CPU limits (35,000+ req/s).

### Architecture Explained in Everyday Terms (The Kitchen Analogy):

| Architecture Paradigm | Everyday Real-World Analogy | Why It Is Great | Where It Breaks | How to Fix It |
| :--- | :--- | :--- | :--- | :--- |
| **Stage 1: Monolith** | **The Solo Chef in a Food Truck**<br>One person takes orders, chops vegetables, cooks burgers, and washes pans in one room. | 0.00ms communication delay. Super simple to build and deploy. | 100 people rush the truck: the chef is chopping onions while steaks burn (100% CPU lock). | **In-Memory Cache:** Pre-chop veggies and sauces in bulk ahead of time (0.05ms lookup). |
| **Stage 2: Modular Monolith** | **The Restaurant with Specialized Stations**<br>Multiple chefs in one big kitchen. One grills burgers, one makes drinks, one bakes desserts, passing tickets on an order line (Event Bus). | 10x more orders handled without paying high delivery fees. Clean team code ownership. | Synchronous table locks when 500 orders try to write to one ticket pad. | **Asynchronous Queue:** Workers write orders to background event streams without waiting. |
| **Stage 3: Microservices** | **Separate Shops Across the City**<br>Bakery, Butcher, and Drink Shop in separate buildings across town. A courier drives between them for each meal. | Infinite horizontal scale. Teams deploy independently without coordinating. | Couriers get stuck in city traffic (20ms+ Network Hop Latency) and high delivery fees ($/mo). | **gRPC & Redlock:** Fast express courier lanes (HTTP/2 binary streams) and distributed locks. |

---

## 3. How ScaleMatrix Helps You Learn

1. **Stage 0: Home Overview & Blueprint**
   - Understand the Why, What, How, and Goal behind architecture choices.
   - Explore 6 interactive masterclass learning tracks.
2. **Stage 1: Single-Process Monolith**
   - Observe single JavaScript thread limits (~35k req/s) and synchronous SQL queue lockouts.
   - Apply in-memory hash caching with 1 click to drop response latency to 0.05ms.
3. **Stage 2: Modular Monolith**
   - See how domain isolation (Catalog, Orders, Inventory) works in 1 repository.
   - Cluster across multiple CPU cores with `cluster.fork()` and eliminate SQL locks with an asynchronous event bus.
4. **Stage 3: Microservices Mesh**
   - Measure real HTTP REST serialization lag vs binary gRPC HTTP/2 multiplexing.
   - Test Circuit Breakers and Redlock distributed mutexes during flash-sale inventory surges.
5. **Stage 4: DevOps Infrastructure, Multi-Cloud Pricing & API Masterclass**
   - Provision vCPUs, RAM, NGINX, and Apache Kafka with live $/month cost calculations on AWS vs GCP vs DigitalOcean vs Bare-Metal.
   - Test API transport protocols (HTTP/1.1 vs HTTP/2 vs HTTP/3 QUIC vs gRPC vs WebSocket vs GraphQL).
   - Test Rate Limiting algorithms (Token Bucket vs Leaky Bucket vs Sliding Window) with live 429 throttling.
   - Learn from the side-by-side **What Helps vs What Hurts Production Checklist**.
6. **Stage 5: System Design Capacity Planner & Distributed Systems Lab**
   - **Capacity Calculator:** Compute peak QPS, bandwidth (Mbps), RAM cache sizing (80/20 Pareto rule), and storage growth from business metrics (DAU, Read:Write ratio, payload size).
   - **CAP Theorem Simulator:** Simulate network partition splits across availability zones and observe CP (Strict Consistency via 2PC) vs AP (High Availability with Eventual Consistency) behavior.
   - **SAGA Pattern Visualizer:** Step through distributed transactions and observe automated compensating rollbacks (refund + order cancellation) when downstream inventory fails.

---

## 4. System Requirements & Quick Start

### Requirements:
- **Node.js**: Version 18.0.0 or higher (`node -v`)
- **NPM**: Version 9.0.0 or higher (`npm -v`)
- **OS**: macOS, Linux, or Windows (WSL recommended on Windows)

### 1-Command Quick Start:

```bash
# 1. Install dependencies
npm install

# 2. Start the unified server & interactive web lab
npm start
```

Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## 5. Repository Structure

```
/ (Workspace Root)
├── 01-monolith/                       # Stage 1: Single-Process Monolith
│   ├── app.js                         # In-memory Monolith router & data store (Mounted at /arch/monolith/api)
│   ├── server.js                      # Standalone Monolith server (Port 4001)
│   └── README.md                      # Detailed Monolith guide & code walkthrough
│
├── 02-modular-monolith/               # Stage 2: Modular Monolith
│   ├── app.js                         # Modular Monolith router (Mounted at /arch/modular/api)
│   ├── server.js                      # Multi-core Cluster Server (Port 4002)
│   ├── modules/
│   │   ├── catalog.js                 # Catalog & search domain module
│   │   ├── orders.js                  # Orders & checkout orchestration module
│   │   ├── inventory.js               # Inventory domain & atomic mutex module
│   │   └── eventBus.js                # In-memory asynchronous domain event bus
│   └── README.md                      # Detailed Modular Monolith guide & code walkthrough
│
├── 03-microservices/                  # Stage 3: Microservices Mesh
│   ├── app.js                         # Microservices router (Mounted at /arch/microservices/api)
│   ├── gateway.js                     # API Gateway Reverse Proxy (Port 4003)
│   ├── start-all.js                   # 1-Command Microservices Mesh Launcher
│   ├── services/
│   │   ├── catalog-service.js         # Standalone Catalog Service (Port 5001)
│   │   ├── inventory-service.js       # Standalone Inventory Service (Port 5002)
│   │   └── order-service.js           # Standalone Order Service (Port 5003)
│   └── README.md                      # Detailed Microservices guide & code walkthrough
│
├── benchmark-suite.js                 # Cross-architecture terminal load tester
├── server.js                          # Unified server mounting all 3 architectures + Web UI
└── public/                            # Interactive Web Lab (HTML5, CSS3, ES6 JavaScript)
    ├── index.html                     # Clean UI with all 6 stages and control cards
    ├── style.css                      # Modern responsive design system
    ├── app.js                         # Real-time state, capacity calculator, and simulator engine
    └── favicon.svg                    # Vector brand icon
```

---

## 6. NPM Scripts Reference

| Command | Purpose |
| :--- | :--- |
| **`npm start`** | **(Recommended)** Starts the unified ScaleMatrix lab on `http://localhost:3000`. |
| **`npm run dev`** | Starts the server with Node `--watch` for instant auto-reloading on code changes. |
| **`npm run start:monolith`** | Starts standalone single-process Monolith on Port `4001`. |
| **`npm run start:modular`** | Starts standalone multi-core Modular Monolith cluster on Port `4002`. |
| **`npm run start:microservices`** | Starts API Gateway + all 3 microservices on Ports `4003, 5001, 5002, 5003`. |
| **`npm run test:all`** | Runs live cross-architecture benchmark suite against running services. |

---

## 7. How Real Hardware Profiling Works

ScaleMatrix never uses static, fake estimates. All benchmarks execute real Node.js code:
1. **High-Resolution Timers (`process.hrtime.bigint()`):** Measure exact execution times down to the nanosecond.
2. **Live OS Hardware Inspection (`os.cpus()`, `os.totalmem()`):** Detects your physical machine's actual CPU core count, clock speed, and RAM.
3. **Real Memory Allocation (`process.memoryUsage()`):** Measures live V8 heap memory usage in megabytes.
4. **Calculated Physics:** Continental speed-of-light delays (US-East 4.5ms, EU-Central 82ms, AP-South 158ms) and database engine transaction locking models are accurately simulated based on real cloud telemetry.
