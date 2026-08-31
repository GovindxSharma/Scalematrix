import http from 'http';

const TARGETS = [
  { name: '1. Single Monolith', url: 'http://localhost:4001', health: 'http://localhost:4001/health' },
  { name: '2. Modular Monolith', url: 'http://localhost:4002', health: 'http://localhost:4002/health' },
  { name: '3. Microservices (Gateway)', url: 'http://localhost:4003', health: 'http://localhost:4003/health' },
];

async function checkServiceHealth(healthUrl) {
  try {
    const res = await fetch(healthUrl);
    return res.ok;
  } catch {
    return false;
  }
}

async function runBenchmarkForTarget(target, concurrentUsers = 50, totalRequests = 1000) {
  console.log(`\n===============================================================`);
  console.log(`Testing: ${target.name} (${target.url})`);
  console.log(`Concurrency: ${concurrentUsers} | Total Requests: ${totalRequests}`);
  console.log(`===============================================================`);

  const latencies = [];
  let completed = 0;
  let successes = 0;
  let failures = 0;

  const startHr = process.hrtime.bigint();

  const worker = async () => {
    while (completed < totalRequests) {
      const idx = completed++;
      const reqStart = process.hrtime.bigint();
      try {
        const res = await fetch(`${target.url}/api/products`);
        if (res.ok) {
          successes++;
        } else {
          failures++;
        }
      } catch {
        failures++;
      }
      const reqEnd = process.hrtime.bigint();
      latencies.push(Number(reqEnd - reqStart) / 1_000_000);
    }
  };

  const workers = Array.from({ length: concurrentUsers }, () => worker());
  await Promise.all(workers);

  const endHr = process.hrtime.bigint();
  const totalDurationSec = Math.max(0.001, Number(endHr - startHr) / 1_000_000_000);
  const rps = Math.round(successes / totalDurationSec);

  latencies.sort((a, b) => a - b);
  const avg = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
  const p50 = latencies[Math.floor(latencies.length * 0.5)].toFixed(2);
  const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);
  const p99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2);

  console.log(`Throughput:       ${rps.toLocaleString()} req/s`);
  console.log(`Average Latency:  ${avg} ms`);
  console.log(`p50 Latency:      ${p50} ms`);
  console.log(`p95 Latency:      ${p95} ms`);
  console.log(`p99 Latency:      ${p99} ms`);
  console.log(`Success Rate:     ${((successes / totalRequests) * 100).toFixed(1)}% (${successes}/${totalRequests})`);

  return { target: target.name, rps, avg, p50, p95, p99, successes, failures };
}

async function main() {
  console.log('\n🔍 Detecting running architecture services...');

  const results = [];

  for (const target of TARGETS) {
    const isOnline = await checkServiceHealth(target.health);
    if (!isOnline) {
      console.log(`\n⚠️  ${target.name} is not running on ${target.url}.`);
      console.log(`   (Start with: npm run start:monolith | npm run start:modular | npm run start:microservices)`);
      continue;
    }

    const res = await runBenchmarkForTarget(target, 50, 1500);
    results.push(res);
  }

  if (results.length > 0) {
    console.log('\n===============================================================');
    console.log('📊 CROSS-ARCHITECTURE PERFORMANCE SUMMARY');
    console.log('===============================================================');
    console.table(
      results.map((r) => ({
        Architecture: r.target,
        'Throughput (req/s)': r.rps.toLocaleString(),
        'Avg Latency (ms)': r.avg,
        'p95 Latency (ms)': r.p95,
        'Success Rate': `${((r.successes / (r.successes + r.failures)) * 100).toFixed(1)}%`,
      }))
    );
  } else {
    console.log('\n💡 Tip: Start the target service you want to benchmark in another terminal:');
    console.log('   Terminal 1: npm run start:monolith');
    console.log('   Terminal 2: npm run test:all');
  }
}

main();
