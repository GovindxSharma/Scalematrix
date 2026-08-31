import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Import All 3 Real Architecture Codebases
import { monolithRouter, benchmarkMonolith } from './01-monolith/app.js';
import { modularRouter, benchmarkModular } from './02-modular-monolith/app.js';
import { microservicesRouter, benchmarkMicroservices } from './03-microservices/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// Direct Mount: All 3 Architecture Codebases Under 1 Unified API
// -------------------------------------------------------------
app.use('/arch/monolith/api', monolithRouter);
app.use('/arch/modular/api', modularRouter);
app.use('/arch/microservices/api', microservicesRouter);

// -------------------------------------------------------------
// Real-Time WebSocket Telemetry Stream
// -------------------------------------------------------------
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'INIT', status: 'ScaleMatrix Connected', timestamp: Date.now() }));
});

function broadcastEvent(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
}

// -------------------------------------------------------------
// Multi-Cloud Infrastructure Cost & Capacity Calculator
// -------------------------------------------------------------
export function calculateDevOpsProfile({
  stage = 'monolith',
  cpuCores = 1,
  ramGb = 2,
  loadBalancer = 'none',
  broker = 'none',
  dbEngine = 'postgres_single',
  region = 'us_east',
  pods = 1,
}) {
  const cores = Math.max(1, parseInt(cpuCores, 10) || 1);
  const ram = Math.max(0.5, parseFloat(ramGb) || 2);
  const podCount = stage === 'microservices' ? Math.max(1, parseInt(pods, 10) || 3) : 1;

  // AWS Pricing Baseline ($0.0416/vCPU-hr, $0.0055/GB-RAM-hr)
  const hourlyComputeAws = (cores * 0.0416 + ram * 0.0055) * podCount;
  const monthlyComputeAws = hourlyComputeAws * 24 * 30.5;
  const monthlyLbAws = loadBalancer === 'nginx' ? 12.0 : loadBalancer === 'alb' ? 22.5 : 0.0;
  const monthlyBrokerAws = broker === 'kafka' ? 95.0 : broker === 'rabbitmq' ? 45.0 : broker === 'redis' ? 20.0 : 0.0;
  const monthlyDbAws = dbEngine === 'cockroach_distributed' ? 190.0 : dbEngine === 'mongo_sharded' ? 140.0 : dbEngine === 'postgres_replicas' ? 75.0 : 30.0;
  const totalAws = parseFloat((monthlyComputeAws + monthlyLbAws + monthlyBrokerAws + monthlyDbAws).toFixed(2));

  // GCP Pricing (~8% cheaper compute on N2D, Cloud SQL, Cloud PubSub)
  const monthlyComputeGcp = (cores * 0.0385 + ram * 0.0051) * podCount * 24 * 30.5;
  const monthlyLbGcp = loadBalancer === 'nginx' ? 12.0 : loadBalancer === 'alb' ? 18.0 : 0.0;
  const monthlyBrokerGcp = broker === 'kafka' ? 80.0 : broker === 'rabbitmq' ? 40.0 : broker === 'redis' ? 18.0 : 0.0;
  const monthlyDbGcp = dbEngine === 'cockroach_distributed' ? 175.0 : dbEngine === 'mongo_sharded' ? 130.0 : dbEngine === 'postgres_replicas' ? 68.0 : 28.0;
  const totalGcp = parseFloat((monthlyComputeGcp + monthlyLbGcp + monthlyBrokerGcp + monthlyDbGcp).toFixed(2));

  // DigitalOcean Pricing (Flat Droplets + Managed DBs)
  const monthlyComputeDo = (cores * 6.0 + ram * 3.5) * podCount;
  const monthlyLbDo = loadBalancer !== 'none' ? 12.0 : 0.0;
  const monthlyBrokerDo = broker === 'kafka' ? 60.0 : broker === 'rabbitmq' ? 30.0 : broker === 'redis' ? 15.0 : 0.0;
  const monthlyDbDo = dbEngine === 'cockroach_distributed' ? 120.0 : dbEngine === 'mongo_sharded' ? 90.0 : dbEngine === 'postgres_replicas' ? 50.0 : 20.0;
  const totalDo = parseFloat((monthlyComputeDo + monthlyLbDo + monthlyBrokerDo + monthlyDbDo).toFixed(2));

  // Bare-Metal Kubernetes (Self-Hosted Flat Hardware Server)
  const totalBareMetal = parseFloat((45.0 + cores * 3.2 + (stage === 'microservices' ? 25.0 : 0.0)).toFixed(2));

  // Speed-of-Light Regional Latencies
  const regionalLatencyMap = {
    us_east: { name: 'US-East (N. Virginia)', lagMs: 4.5 },
    eu_central: { name: 'EU-Central (Frankfurt)', lagMs: 82.0 },
    ap_south: { name: 'AP-South (Mumbai)', lagMs: 158.0 },
    global_anycast: { name: 'Global Anycast CDN Edge', lagMs: 11.5 },
  };

  const regionInfo = regionalLatencyMap[region] || regionalLatencyMap.us_east;

  return {
    cores,
    ram,
    podCount,
    loadBalancer,
    broker,
    dbEngine,
    region: regionInfo,
    pricing: {
      totalMonthlyCost: totalAws,
      hourlyCost: parseFloat((totalAws / (30.5 * 24)).toFixed(3)),
      monthlyCompute: parseFloat(monthlyComputeAws.toFixed(2)),
      monthlyLb: monthlyLbAws,
      monthlyBroker: monthlyBrokerAws,
      monthlyDb: monthlyDbAws,
      multiCloud: {
        aws: totalAws,
        gcp: totalGcp,
        digitalOcean: totalDo,
        bareMetal: totalBareMetal,
      },
    },
  };
}

// -------------------------------------------------------------
// Live Hardware Benchmark & Chaos Simulation Engine
// -------------------------------------------------------------
app.post('/api/lab/simulate', (req, res) => {
  const {
    stage = 'monolith',
    isOptimized = false,
    requests = 5000,
    cpuCores = 1,
    ramGb = 2,
    loadBalancer = 'none',
    broker = 'none',
    dbEngine = 'postgres_single',
    region = 'us_east',
    chaosFault = 'none',
    pods = 3,
  } = req.body;

  let reqCount = parseInt(requests, 10) || 5000;
  if (chaosFault === 'flash_surge') {
    reqCount = Math.min(300000, reqCount * 3);
  }

  const profile = calculateDevOpsProfile({ stage, cpuCores, ramGb, loadBalancer, broker, dbEngine, region, pods });

  // 1. Measure actual micro-execution timing on host machine
  const startHr = process.hrtime.bigint();
  let dummy = 0;
  const sampleIterations = Math.min(2000, reqCount);
  for (let i = 0; i < sampleIterations; i++) {
    dummy += (i * 31) % 997;
  }
  const endHr = process.hrtime.bigint();
  const rawHostSpeedNs = Number(endHr - startHr) / sampleIterations;

  // 2. Dynamic Hardware Capacity Multipliers
  const coreMultiplier = Math.pow(profile.cores, 0.88);
  const podMultiplier = stage === 'microservices' ? Math.pow(profile.podCount, 0.92) : 1.0;
  const totalHardwareCapacityMultiplier = coreMultiplier * podMultiplier;

  // Base throughput per core based on architecture paradigm
  const baseCoreRps = stage === 'monolith' ? 32000 : stage === 'modular' ? 24000 : 18000;
  const maxHardwareThroughputCeiling = Math.round(baseCoreRps * totalHardwareCapacityMultiplier);

  // 3. Dynamic Database Engine & Broker Contention
  let dbLockWaitMs = 0.0;
  if (broker === 'none') {
    const contentionRatio = reqCount / (profile.cores * 8000);
    const dbEngineFactor = dbEngine === 'postgres_replicas' ? 0.35 : dbEngine === 'cockroach_distributed' ? 0.25 : 1.0;
    dbLockWaitMs = isOptimized ? Math.max(0.08, contentionRatio * 1.2 * dbEngineFactor) : Math.max(1.2, contentionRatio * 16.0 * dbEngineFactor);
  } else if (broker === 'redis') {
    dbLockWaitMs = isOptimized ? 0.08 : 0.45;
  } else if (broker === 'rabbitmq') {
    dbLockWaitMs = isOptimized ? 0.22 : 0.90;
  } else if (broker === 'kafka') {
    dbLockWaitMs = isOptimized ? 0.10 : 0.55;
  }

  // 4. Dynamic Network Hop & Regional Latency Overhead
  let networkHopMs = 0.0;
  const regionalLag = profile.region.lagMs;

  if (stage === 'monolith') {
    networkHopMs = regionalLag;
  } else if (stage === 'modular') {
    networkHopMs = regionalLag + 0.05;
  } else {
    const lbTax = profile.loadBalancer === 'nginx' ? 0.4 : profile.loadBalancer === 'alb' ? 1.8 : 0.1;
    networkHopMs = regionalLag + (isOptimized ? 1.8 + lbTax : 18.5 + lbTax * 3.2);
  }

  // 5. Chaos Engineering Fault Impacts
  let chaosCrash = false;
  let chaosTitle = '';
  let chaosDesc = '';
  let errorRate = 0.0;

  if (chaosFault === 'db_outage') {
    if (stage === 'monolith') {
      chaosCrash = true;
      errorRate = 1.0; // 100% crash on Monolith
      chaosTitle = 'CHAOS: Primary Database Complete Outage';
      chaosDesc = 'Single Monolith has a single point of failure (SPOF). All HTTP requests fail with 500 Internal Server Error.';
    } else if (stage === 'modular') {
      errorRate = 0.12; // Worker retries and buffers in memory
      chaosTitle = 'CHAOS: DB Outage Buffered by Workers';
      chaosDesc = 'Modular Monolith workers buffer mutations into memory event queue. Reads succeed, writes queued with 12% retries.';
    } else {
      errorRate = 0.03; // Microservices circuit breaker fallback
      chaosTitle = 'CHAOS: Circuit Breaker Isolated Failure';
      chaosDesc = 'Order service circuit breaker tripped. Catalog & Inventory serve cached fallbacks without crashing the app mesh.';
    }
  } else if (chaosFault === 'network_jitter') {
    if (stage === 'microservices' && !isOptimized) {
      networkHopMs += 195.0; // Cascading timeout across REST hops
      errorRate = 0.38;
      chaosTitle = 'CHAOS: Cascading RPC Timeout Collapse';
      chaosDesc = 'Sequential synchronous HTTP REST hops accumulated 200ms+ network jitter, triggering upstream gateway timeouts.';
    } else {
      networkHopMs += 40.0;
      chaosTitle = 'CHAOS: In-Memory / gRPC Resilient Under Jitter';
      chaosDesc = 'Non-blocking in-memory execution or binary gRPC multiplexing prevented timeout cascades.';
    }
  } else if (chaosFault === 'flash_surge') {
    chaosTitle = 'CHAOS: 10x Flash-Sale Traffic Rush Active';
    chaosDesc = `Simulating instantaneous traffic surge to ${reqCount.toLocaleString()} concurrent requests.`;
  }

  // 6. Dynamic Burst & Overload Detection
  const isBurstOverload = chaosCrash || reqCount > maxHardwareThroughputCeiling * 0.95;

  let throughputRps = Math.round(Math.min(maxHardwareThroughputCeiling, (reqCount / (rawHostSpeedNs / 1000 + 0.025)) * (isOptimized ? 1.4 : 0.85)));
  if (chaosCrash) throughputRps = 0;
  else if (isBurstOverload) throughputRps = Math.round(maxHardwareThroughputCeiling * (0.92 + Math.random() * 0.06));

  const loadPercentage = Math.min(1.0, reqCount / maxHardwareThroughputCeiling);
  const cpuUsagePct = chaosCrash ? 0.0 : isBurstOverload ? 100.0 : parseFloat((Math.min(99.0, 15 + loadPercentage * (isOptimized ? 65 : 82))).toFixed(1));
  const memoryMb = parseFloat((profile.ram * 1024 * (0.15 + loadPercentage * 0.65)).toFixed(1));

  const baseLatency = (1000 / Math.max(1, throughputRps)) + networkHopMs + dbLockWaitMs;
  const avgLatencyMs = parseFloat((baseLatency * (isBurstOverload ? 8.5 : 1.0)).toFixed(2));
  const p95LatencyMs = parseFloat((avgLatencyMs * 1.85).toFixed(2));
  const p99LatencyMs = parseFloat((avgLatencyMs * 2.8).toFixed(2));

  const errors = chaosCrash ? reqCount : Math.round(reqCount * (errorRate + (isBurstOverload ? 0.04 : 0)));
  const successes = reqCount - errors;

  const monthlyRequestsProcessed = (throughputRps * 3600 * 24 * 30.5);
  const costPerMillionReqs = monthlyRequestsProcessed > 0
    ? parseFloat(((profile.pricing.totalMonthlyCost / monthlyRequestsProcessed) * 1_000_000).toFixed(4))
    : 0.0;

  // Scaling advice computation
  let bottleneckTitle = chaosTitle;
  let physicalLimitDesc = chaosDesc;
  let resourceToIncrease = '';
  let expectedImprovement = '';

  if (!bottleneckTitle) {
    if (isBurstOverload) {
      bottleneckTitle = `PHYSICAL BREAKING POINT: Hardware Ceiling Saturated at ${profile.cores} vCPUs`;
      physicalLimitDesc = `At ${reqCount.toLocaleString()} requests, compute allocation (${profile.cores} vCPUs, ${profile.ram}GB RAM) reached 100% capacity in ${profile.region.name}.`;
      resourceToIncrease = profile.cores < 8 ? `Scale Compute: Increase to ${profile.cores * 2} vCPU Cores or add Pod replicas` : 'Extract high-traffic domain into dedicated autoscaling microservice';
      expectedImprovement = `Surges physical capacity ceiling from ~${maxHardwareThroughputCeiling.toLocaleString()} to ~${Math.round(maxHardwareThroughputCeiling * 1.8).toLocaleString()} req/s.`;
    } else if (broker === 'none' && dbLockWaitMs > 2.0) {
      bottleneckTitle = 'Synchronous Database Write Queue Saturation';
      physicalLimitDesc = `Synchronous database transaction locks cause ${dbLockWaitMs.toFixed(1)}ms queue latency under high write concurrency.`;
      resourceToIncrease = 'Add Message Broker: Attach Apache Kafka or RabbitMQ write-behind queues';
      expectedImprovement = 'Decouples state mutations into non-blocking background batches, dropping DB lock wait to <0.5ms.';
    } else {
      bottleneckTitle = `Operating Optimally on ${profile.cores} vCPU / ${profile.ram}GB RAM`;
      physicalLimitDesc = `System is healthy in ${profile.region.name} (${cpuUsagePct}% CPU load).`;
      resourceToIncrease = 'Current sizing is cost-efficient and within safe operating thresholds.';
      expectedImprovement = `Delivers ${throughputRps.toLocaleString()} req/s at $${costPerMillionReqs} per 1M requests.`;
    }
  }

  const results = {
    stage,
    isOptimized,
    requests: reqCount,
    throughputRps,
    avgLatencyMs,
    p95LatencyMs,
    p99LatencyMs,
    cpuUsagePct,
    memoryMb,
    dbLockWaitMs: parseFloat(dbLockWaitMs.toFixed(2)),
    networkHopMs: parseFloat(networkHopMs.toFixed(2)),
    successes,
    errors,
    isBurstOverload,
    chaosFault,
    hardware: {
      cores: profile.cores,
      ramGb: profile.ram,
      podCount: profile.podCount,
      loadBalancer: profile.loadBalancer,
      broker: profile.broker,
      dbEngine: profile.dbEngine,
      region: profile.region,
      maxHardwareCapacity: maxHardwareThroughputCeiling,
    },
    costs: {
      totalMonthlyCost: profile.pricing.totalMonthlyCost,
      hourlyCost: profile.pricing.hourlyCost,
      costPerMillionReqs,
      monthlyCompute: profile.pricing.monthlyCompute,
      monthlyLb: profile.pricing.monthlyLb,
      monthlyBroker: profile.pricing.monthlyBroker,
      monthlyDb: profile.pricing.monthlyDb,
      multiCloud: profile.pricing.multiCloud,
    },
    bottleneckData: {
      title: bottleneckTitle,
      physicalLimit: physicalLimitDesc,
    },
    scalingAdvice: {
      resourceToIncrease: resourceToIncrease || 'Review fault tolerance & isolation policies.',
      expectedImprovement: expectedImprovement || 'Prevents single-point-of-failure outages.',
    },
  };

  broadcastEvent({ type: 'BENCHMARK_COMPLETE', results });
  res.json({ success: true, results });
});

// -------------------------------------------------------------
// Live Online Host Hardware Auto-Detection Endpoint
// -------------------------------------------------------------
app.get('/api/system/host-specs', (req, res) => {
  const cpus = os.cpus() || [];
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsage = process.memoryUsage();

  res.json({
    actualCores: Math.max(1, cpus.length),
    cpuModel: cpus[0]?.model || 'Cloud vCPU Processor',
    cpuSpeedMhz: cpus[0]?.speed || 2400,
    totalRamGb: parseFloat((totalMem / (1024 * 1024 * 1024)).toFixed(2)),
    freeRamGb: parseFloat((freeMem / (1024 * 1024 * 1024)).toFixed(2)),
    heapTotalMb: parseFloat((memUsage.heapTotal / (1024 * 1024)).toFixed(1)),
    heapUsedMb: parseFloat((memUsage.heapUsed / (1024 * 1024)).toFixed(1)),
    platform: `${os.platform()} (${os.arch()})`,
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    loadAvg: os.loadavg(),
  });
});

// -------------------------------------------------------------
// Port Allocation & Auto-Increment
// -------------------------------------------------------------
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

function findAvailablePort(startPort, maxAttempts = 15) {
  return new Promise((resolve, reject) => {
    let currentPort = startPort;
    let attempts = 0;

    const tryListen = () => {
      attempts++;
      const tester = http.createServer();

      tester.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${currentPort} is busy. Trying port ${currentPort + 1}...`);
          currentPort++;
          if (attempts < maxAttempts) {
            tryListen();
          } else {
            reject(new Error(`Could not find an open port after ${maxAttempts} attempts.`));
          }
        } else {
          reject(err);
        }
      });

      tester.once('listening', () => {
        tester.close(() => resolve(currentPort));
      });

      tester.listen(currentPort);
    };

    tryListen();
  });
}

findAvailablePort(DEFAULT_PORT)
  .then((port) => {
    server.listen(port, () => {
      console.log('\n===============================================================');
      console.log('ScaleMatrix: Architecture Boundaries & Scaling Lab is LIVE!');
      console.log('All 3 Architecture Codebases Mounted (01, 02, 03)');
      console.log(`Open in your browser: http://localhost:${port}`);
      console.log('===============================================================\n');
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
