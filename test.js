import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';

import { monolithRouter } from './01-monolith/app.js';
import { modularRouter } from './02-modular-monolith/app.js';
import { microservicesRouter } from './03-microservices/app.js';
import { calculateDevOpsProfile, app } from './server.js';

test('DevOps Profile Calculator computes cloud costs accurately', () => {
  const profile = calculateDevOpsProfile({
    stage: 'monolith',
    cpuCores: 2,
    ramGb: 4,
    loadBalancer: 'none',
    broker: 'none',
    dbEngine: 'postgres_single',
  });

  assert.ok(profile.pricing.totalMonthlyCost > 0, 'Total cost should be positive');
  assert.ok(profile.pricing.multiCloud.aws > 0, 'AWS cost should be positive');
  assert.ok(profile.pricing.multiCloud.gcp > 0, 'GCP cost should be positive');
  assert.ok(profile.pricing.multiCloud.digitalOcean > 0, 'DigitalOcean cost should be positive');
  assert.ok(profile.pricing.multiCloud.bareMetal > 0, 'Bare-Metal cost should be positive');
});

test('All three architecture routers are properly exported', () => {
  assert.ok(monolithRouter, 'monolithRouter should be defined');
  assert.ok(modularRouter, 'modularRouter should be defined');
  assert.ok(microservicesRouter, 'microservicesRouter should be defined');
  assert.ok(app, 'Express app should be exported');
});
