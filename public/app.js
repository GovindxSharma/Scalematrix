// -------------------------------------------------------------
// ScaleMatrix State & Diagnostics
// -------------------------------------------------------------
let currentStage = 0;
let monolithOptimized = false;
let modularOptimized = false;
let microOptimized = false;

// Store latest simulation metrics for report generation
const latestTelemetry = {
  monolith: null,
  modular: null,
  microservices: null,
};

// Navigation Stepper Buttons
const navStep0 = document.getElementById('navStep0');
const navStep1 = document.getElementById('navStep1');
const navStep2 = document.getElementById('navStep2');
const navStep3 = document.getElementById('navStep3');
const navStep4 = document.getElementById('navStep4');
const navStep5 = document.getElementById('navStep5');

// Stage Views
const stage0View = document.getElementById('stage0');
const stage1View = document.getElementById('stage1View');
const stage2View = document.getElementById('stage2View');
const stage3View = document.getElementById('stage3View');
const stage4View = document.getElementById('stage4View');
const stage5View = document.getElementById('stage5');

const btnHomeStartLab = document.getElementById('btnHomeStartLab');
const btnHomeJumpCalc = document.getElementById('btnHomeJumpCalc');

const wsStatusLabel = document.getElementById('wsStatusLabel');
const customAlertContainer = document.getElementById('customAlertContainer');

// -------------------------------------------------------------
// DevOps Hardware & Cloud Cost DOM Elements
// -------------------------------------------------------------
const devopsCpuSlider = document.getElementById('devopsCpuSlider');
const valDevopsCpu = document.getElementById('valDevopsCpu');
const devopsRamSlider = document.getElementById('devopsRamSlider');
const valDevopsRam = document.getElementById('valDevopsRam');
const devopsLbSelect = document.getElementById('devopsLbSelect');
const devopsBrokerSelect = document.getElementById('devopsBrokerSelect');
const costTotalMonthly = document.getElementById('costTotalMonthly');
const costPerMillion = document.getElementById('costPerMillion');
const sliderPods = document.getElementById('sliderPods');
const valPods = document.getElementById('valPods');
const topoMonoCoresTitle = document.getElementById('topoMonoCoresTitle');
const topoModCoresTitle = document.getElementById('topoModCoresTitle');
const hostSpecsText = document.getElementById('hostSpecsText');
const btnSyncHostSpecs = document.getElementById('btnSyncHostSpecs');
const devopsRegionSelect = document.getElementById('devopsRegionSelect');
const devopsDbEngineSelect = document.getElementById('devopsDbEngineSelect');

// Multi-Cloud Cost Elements
const cloudCostAws = document.getElementById('cloudCostAws');
const cloudCostGcp = document.getElementById('cloudCostGcp');
const cloudCostDo = document.getElementById('cloudCostDo');
const cloudCostBare = document.getElementById('cloudCostBare');

// Chaos Engineering Triggers
const btnChaosDb = document.getElementById('btnChaosDb');
const btnChaosJitter = document.getElementById('btnChaosJitter');
const btnChaosSurge = document.getElementById('btnChaosSurge');
const btnChaosReset = document.getElementById('btnChaosReset');
let activeChaos = 'none';

let detectedHostSpecs = null;

// -------------------------------------------------------------
// Live Cloud Cost & Multi-Cloud Matrix Calculator
// -------------------------------------------------------------
function calculateAndRenderLiveCost() {
  if (!devopsCpuSlider || !devopsRamSlider || !devopsLbSelect || !devopsBrokerSelect) return;

  const cores = parseInt(devopsCpuSlider.value, 10) || 1;
  const ram = parseFloat(devopsRamSlider.value) || 2;
  const lb = devopsLbSelect.value;
  const broker = devopsBrokerSelect.value;
  const dbEngine = devopsDbEngineSelect ? devopsDbEngineSelect.value : 'postgres_single';
  const pods = sliderPods ? parseInt(sliderPods.value, 10) || 3 : 1;

  // AWS Calculation
  const hourlyComputeAws = (cores * 0.0416 + ram * 0.0055) * (currentStage === 3 ? pods : 1);
  const monthlyComputeAws = hourlyComputeAws * 24 * 30.5;
  const monthlyLbAws = lb === 'nginx' ? 12.0 : lb === 'alb' ? 22.5 : 0.0;
  const monthlyBrokerAws = broker === 'kafka' ? 95.0 : broker === 'rabbitmq' ? 45.0 : broker === 'redis' ? 20.0 : 0.0;
  const monthlyDbAws = dbEngine === 'cockroach_distributed' ? 190.0 : dbEngine === 'mongo_sharded' ? 140.0 : dbEngine === 'postgres_replicas' ? 75.0 : 30.0;
  const totalAws = monthlyComputeAws + monthlyLbAws + monthlyBrokerAws + monthlyDbAws;

  // GCP Calculation
  const monthlyComputeGcp = (cores * 0.0385 + ram * 0.0051) * (currentStage === 3 ? pods : 1) * 24 * 30.5;
  const monthlyLbGcp = lb === 'nginx' ? 12.0 : lb === 'alb' ? 18.0 : 0.0;
  const monthlyBrokerGcp = broker === 'kafka' ? 80.0 : broker === 'rabbitmq' ? 40.0 : broker === 'redis' ? 18.0 : 0.0;
  const monthlyDbGcp = dbEngine === 'cockroach_distributed' ? 175.0 : dbEngine === 'mongo_sharded' ? 130.0 : dbEngine === 'postgres_replicas' ? 68.0 : 28.0;
  const totalGcp = monthlyComputeGcp + monthlyLbGcp + monthlyBrokerGcp + monthlyDbGcp;

  // DigitalOcean Calculation
  const monthlyComputeDo = (cores * 6.0 + ram * 3.5) * (currentStage === 3 ? pods : 1);
  const monthlyLbDo = lb !== 'none' ? 12.0 : 0.0;
  const monthlyBrokerDo = broker === 'kafka' ? 60.0 : broker === 'rabbitmq' ? 30.0 : broker === 'redis' ? 15.0 : 0.0;
  const monthlyDbDo = dbEngine === 'cockroach_distributed' ? 120.0 : dbEngine === 'mongo_sharded' ? 90.0 : dbEngine === 'postgres_replicas' ? 50.0 : 20.0;
  const totalDo = monthlyComputeDo + monthlyLbDo + monthlyBrokerDo + monthlyDbDo;

  // Bare-Metal Kubernetes
  const totalBare = 45.0 + cores * 3.2 + (currentStage === 3 ? 25.0 : 0.0);

  if (costTotalMonthly) costTotalMonthly.textContent = `$${totalAws.toFixed(2)} / mo`;
  if (cloudCostAws) cloudCostAws.textContent = `$${totalAws.toFixed(2)} / mo`;
  if (cloudCostGcp) cloudCostGcp.textContent = `$${totalGcp.toFixed(2)} / mo`;
  if (cloudCostDo) cloudCostDo.textContent = `$${totalDo.toFixed(2)} / mo`;
  if (cloudCostBare) cloudCostBare.textContent = `$${totalBare.toFixed(2)} / mo`;

  // Update dynamic topology node labels
  if (topoMonoCoresTitle) topoMonoCoresTitle.textContent = `Monolith (${cores} vCPU${cores > 1 ? 's' : ''})`;
  if (topoModCoresTitle) topoModCoresTitle.textContent = `${cores}-Core Worker Cluster`;
  if (valDevopsCpu) valDevopsCpu.textContent = `${cores} vCPU Core${cores > 1 ? 's' : ''}`;
  if (valDevopsRam) valDevopsRam.textContent = `${ram} GB RAM`;

  if (broker === 'kafka') {
    if (topoDbState) topoDbState.textContent = 'Kafka Log Queue';
    if (topoModularDbState) topoModularDbState.textContent = 'Kafka Event Stream';
  } else if (broker === 'rabbitmq') {
    if (topoDbState) topoDbState.textContent = 'RabbitMQ Queue';
    if (topoModularDbState) topoModularDbState.textContent = 'RabbitMQ AMQP';
  } else if (broker === 'redis') {
    if (topoDbState) topoDbState.textContent = 'Redis Stream Queue';
    if (topoModularDbState) topoModularDbState.textContent = 'BullMQ Redis Queue';
  } else {
    if (topoDbState) topoDbState.textContent = 'File Disk I/O';
    if (topoModularDbState) topoModularDbState.textContent = 'SQL Table Mutex';
  }
}

async function fetchLiveHostSpecs() {
  try {
    const res = await fetch('/api/system/host-specs');
    if (!res.ok) return;
    const data = await res.json();
    detectedHostSpecs = data;

    if (hostSpecsText) {
      hostSpecsText.textContent = `${data.actualCores} vCPUs | ${data.totalRamGb} GB RAM (${data.freeRamGb} GB Free) | ${data.platform} | Node ${data.nodeVersion}`;
    }
  } catch (err) {
    if (hostSpecsText) hostSpecsText.textContent = 'Hardware auto-detection unavailable';
  }
}

if (btnSyncHostSpecs) {
  btnSyncHostSpecs.addEventListener('click', () => {
    if (!detectedHostSpecs) {
      showToast('Fetching live host hardware specs...', 'info');
      fetchLiveHostSpecs();
      return;
    }
    devopsCpuSlider.value = Math.min(32, Math.max(1, detectedHostSpecs.actualCores));
    devopsRamSlider.value = Math.min(32, Math.max(0.5, Math.round(detectedHostSpecs.totalRamGb)));
    calculateAndRenderLiveCost();
    renderActiveAttachedChips();
    showToast(`Calibrated to live server hardware: ${detectedHostSpecs.actualCores} Cores, ${detectedHostSpecs.totalRamGb} GB RAM!`, 'success');
  });
}

// Stage 1 DOM Elements (Monolith)
const topoMonolithNode = document.getElementById('topoMonolithNode');
const topoMonolithState = document.getElementById('topoMonolithState');
const topoMonolithDb = document.getElementById('topoMonolithDb');
const topoDbState = document.getElementById('topoDbState');
const topoDbHopLabel = document.getElementById('topoDbHopLabel');
const monolithConfigLabel = document.getElementById('monolithConfigLabel');
const clientLoadLabel1 = document.getElementById('clientLoadLabel1');
const sliderStress1 = document.getElementById('sliderStress1');
const valStress1 = document.getElementById('valStress1');

const btnTestMonolith = document.getElementById('btnTestMonolith');
const btnRampMonolith = document.getElementById('btnRampMonolith');
const btnFixMonolith = document.getElementById('btnFixMonolith');
const btnCodeMono = document.getElementById('btnCodeMono');
const diagMonoCard = document.getElementById('diagMonoCard');
const diagMonoBadge = document.getElementById('diagMonoBadge');
const diagMonoTitle = document.getElementById('diagMonoTitle');
const diagMonoDesc = document.getElementById('diagMonoDesc');
const adviceMonoAction = document.getElementById('adviceMonoAction');
const adviceMonoImpact = document.getElementById('adviceMonoImpact');
const btnAdvanceToStage2 = document.getElementById('btnAdvanceToStage2');

const telMonoRps = document.getElementById('telMonoRps');
const telMonoLatency = document.getElementById('telMonoLatency');
const telMonoCpu = document.getElementById('telMonoCpu');
const telMonoDbLock = document.getElementById('telMonoDbLock');
const barMonoRps = document.getElementById('barMonoRps');
const barMonoLatency = document.getElementById('barMonoLatency');
const barMonoCpu = document.getElementById('barMonoCpu');
const barMonoDbLock = document.getElementById('barMonoDbLock');

// Stage 2 DOM Elements (Modular Monolith)
const topoModularNode = document.getElementById('topoModularNode');
const topoModularState = document.getElementById('topoModularState');
const topoModularDb = document.getElementById('topoModularDb');
const topoModularDbState = document.getElementById('topoModularDbState');
const topoModularDbHopLabel = document.getElementById('topoModularDbHopLabel');
const modularConfigLabel = document.getElementById('modularConfigLabel');
const clientLoadLabel2 = document.getElementById('clientLoadLabel2');
const sliderStress2 = document.getElementById('sliderStress2');
const valStress2 = document.getElementById('valStress2');

const btnTestModular = document.getElementById('btnTestModular');
const btnRampModular = document.getElementById('btnRampModular');
const btnFixModular = document.getElementById('btnFixModular');
const btnCodeMod = document.getElementById('btnCodeMod');
const diagModCard = document.getElementById('diagModCard');
const diagModBadge = document.getElementById('diagModBadge');
const diagModTitle = document.getElementById('diagModTitle');
const diagModDesc = document.getElementById('diagModDesc');
const adviceModAction = document.getElementById('adviceModAction');
const adviceModImpact = document.getElementById('adviceModImpact');
const btnAdvanceToStage3 = document.getElementById('btnAdvanceToStage3');

const telModRps = document.getElementById('telModRps');
const telModLatency = document.getElementById('telModLatency');
const telModCpu = document.getElementById('telModCpu');
const telModDbLock = document.getElementById('telModDbLock');
const barModRps = document.getElementById('barModRps');
const barModLatency = document.getElementById('barModLatency');
const barModCpu = document.getElementById('barModCpu');
const barModDbLock = document.getElementById('barModDbLock');

// Stage 3 DOM Elements (Microservices)
const microConfigLabel = document.getElementById('microConfigLabel');
const podInventoryState = document.getElementById('podInventoryState');
const topoRpcHopLabel = document.getElementById('topoRpcHopLabel');
const clientLoadLabel3 = document.getElementById('clientLoadLabel3');
const sliderStress3 = document.getElementById('sliderStress3');
const valStress3 = document.getElementById('valStress3');

const btnTestMicro = document.getElementById('btnTestMicro');
const btnRampMicro = document.getElementById('btnRampMicro');
const btnFixMicro = document.getElementById('btnFixMicro');
const btnCodeMicro = document.getElementById('btnCodeMicro');
const diagMicroCard = document.getElementById('diagMicroCard');
const diagMicroBadge = document.getElementById('diagMicroBadge');
const diagMicroTitle = document.getElementById('diagMicroTitle');
const diagMicroDesc = document.getElementById('diagMicroDesc');
const adviceMicroAction = document.getElementById('adviceMicroAction');
const adviceMicroImpact = document.getElementById('adviceMicroImpact');
const btnAdvanceToStage4 = document.getElementById('btnAdvanceToStage4');

const telMicroRps = document.getElementById('telMicroRps');
const telMicroNetwork = document.getElementById('telMicroNetwork');
const telMicroLatency = document.getElementById('telMicroLatency');
const telMicroErrors = document.getElementById('telMicroErrors');
const barMicroRps = document.getElementById('barMicroRps');
const barMicroNetwork = document.getElementById('barMicroNetwork');
const barMicroLatency = document.getElementById('barMicroLatency');

// Stage 4 DOM Elements (Summary & Sandbox)
const btnRestartLab = document.getElementById('btnRestartLab');
const btnExportReport = document.getElementById('btnExportReport');
const exportModal = document.getElementById('exportModal');
const closeExportModalBtn = document.getElementById('closeExportModalBtn');
const exportReportText = document.getElementById('exportReportText');
const btnCopyReport = document.getElementById('btnCopyReport');

// Code Modal
const codeModal = document.getElementById('codeModal');
const closeCodeModalBtn = document.getElementById('closeCodeModalBtn');
const codeModalTitle = document.getElementById('codeModalTitle');
const codeModalDesc = document.getElementById('codeModalDesc');
const codeDiffContent = document.getElementById('codeDiffContent');

// -------------------------------------------------------------
// Toast Notifications
// -------------------------------------------------------------
function showToast(message, type = 'info') {
  if (!customAlertContainer) return;
  const alertEl = document.createElement('div');
  alertEl.className = `custom-alert alert-${type}`;
  alertEl.textContent = message;
  customAlertContainer.appendChild(alertEl);
  setTimeout(() => {
    if (alertEl.parentNode) alertEl.parentNode.removeChild(alertEl);
  }, 4000);
}

// -------------------------------------------------------------


// -------------------------------------------------------------
// Slider & Hardware Event Listeners
// -------------------------------------------------------------
devopsCpuSlider.addEventListener('input', calculateAndRenderLiveCost);
devopsRamSlider.addEventListener('input', calculateAndRenderLiveCost);

sliderStress1.addEventListener('input', () => {
  const reqs = parseInt(sliderStress1.value, 10);
  valStress1.textContent = `${reqs.toLocaleString()} req`;
  clientLoadLabel1.textContent = `${reqs.toLocaleString()} Users`;
});

sliderStress2.addEventListener('input', () => {
  const reqs = parseInt(sliderStress2.value, 10);
  valStress2.textContent = `${reqs.toLocaleString()} req`;
  clientLoadLabel2.textContent = `${reqs.toLocaleString()} Users`;
});

sliderStress3.addEventListener('input', () => {
  const reqs = parseInt(sliderStress3.value, 10);
  valStress3.textContent = `${reqs.toLocaleString()} req`;
  clientLoadLabel3.textContent = `${reqs.toLocaleString()} Users`;
});

if (sliderPods) {
  sliderPods.addEventListener('input', () => {
    const p = parseInt(sliderPods.value, 10);
    valPods.textContent = `${p} Pod Replica${p > 1 ? 's' : ''}`;
    calculateAndRenderLiveCost();
  });
}

// -------------------------------------------------------------
// Navigation Stepper
// -------------------------------------------------------------
function goToStage(stageNum) {
  currentStage = stageNum;

  [navStep0, navStep1, navStep2, navStep3, navStep4, navStep5].forEach((b) => b?.classList.remove('active'));
  [stage0View, stage1View, stage2View, stage3View, stage4View, stage5View].forEach((v) => {
    if (v) {
      v.classList.remove('active');
      v.classList.add('hidden');
    }
  });

  if (stageNum === 0 && stage0View) {
    navStep0?.classList.add('active');
    stage0View.classList.add('active');
    stage0View.classList.remove('hidden');
  } else if (stageNum === 1 && stage1View) {
    navStep1?.classList.add('active');
    stage1View.classList.add('active');
    stage1View.classList.remove('hidden');
  } else if (stageNum === 2 && stage2View) {
    navStep2?.classList.add('active');
    stage2View.classList.add('active');
    stage2View.classList.remove('hidden');
  } else if (stageNum === 3 && stage3View) {
    navStep3?.classList.add('active');
    stage3View.classList.add('active');
    stage3View.classList.remove('hidden');
  } else if (stageNum === 4 && stage4View) {
    navStep4?.classList.add('active');
    stage4View.classList.add('active');
    stage4View.classList.remove('hidden');
  } else if (stageNum === 5 && stage5View) {
    navStep5?.classList.add('active');
    stage5View.classList.add('active');
    stage5View.classList.remove('hidden');
    calculateSystemDesignCapacity();
  }

  calculateAndRenderLiveCost();
  renderActiveAttachedChips();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.goToStage = goToStage;

// -------------------------------------------------------------
// Interactive Architecture Drag & Drop Playground Engine
// -------------------------------------------------------------
function initPlaygroundPalette() {
  const chips = document.querySelectorAll('.palette-chip');
  const dropZone = document.querySelector('.playground-palette-box');

  function attachComponent(type) {
    if (type === 'nginx') {
      devopsLbSelect.value = 'nginx';
      syncDropdownValue('devopsLbSelect', 'nginx', 'NGINX Reverse Proxy (Keepalive - $12/mo)');
      showToast('Attached NGINX Load Balancer (+Keepalive).', 'info');
    } else if (type === 'redis') {
      devopsBrokerSelect.value = 'redis';
      monolithOptimized = true;
      modularOptimized = true;
      syncDropdownValue('devopsBrokerSelect', 'redis', 'Redis Streams / BullMQ ($20/mo)');
      showToast('Attached Redis In-Memory Cache (0.08ms read latency).', 'success');
    } else if (type === 'rabbitmq') {
      devopsBrokerSelect.value = 'rabbitmq';
      syncDropdownValue('devopsBrokerSelect', 'rabbitmq', 'RabbitMQ AMQP Broker ($45/mo)');
      showToast('Attached RabbitMQ AMQP Broker.', 'info');
    } else if (type === 'kafka') {
      devopsBrokerSelect.value = 'kafka';
      syncDropdownValue('devopsBrokerSelect', 'kafka', 'Apache Kafka Distributed Stream ($95/mo)');
      showToast('Attached Apache Kafka Distributed Partitioned Stream.', 'success');
    } else if (type === 'cpu') {
      const current = parseInt(devopsCpuSlider.value, 10) || 1;
      devopsCpuSlider.value = Math.min(32, current + 2);
      showToast(`Scaled compute pool to ${devopsCpuSlider.value} vCPU Cores.`, 'info');
    } else if (type === 'pod') {
      if (sliderPods) {
        const p = parseInt(sliderPods.value, 10) || 3;
        sliderPods.value = Math.min(20, p + 2);
        showToast(`Scaled microservices to ${sliderPods.value} Pod Replicas.`, 'info');
      }
    }

    calculateAndRenderLiveCost();
    renderActiveAttachedChips();
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const type = chip.getAttribute('data-type');
      attachComponent(type);
    });

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', chip.getAttribute('data-type'));
    });
  });

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const type = e.dataTransfer.getData('text/plain');
      if (type) attachComponent(type);
    });
  }
}

function renderActiveAttachedChips() {
  const tray = document.getElementById('activeChipsTray');
  if (!tray) return;
  tray.innerHTML = '';

  const cores = parseInt(devopsCpuSlider.value, 10) || 1;
  const lb = devopsLbSelect.value;
  const broker = devopsBrokerSelect.value;
  const pods = sliderPods ? parseInt(sliderPods.value, 10) : 1;

  const items = [];
  if (cores > 1) items.push({ id: 'cpu', label: `${cores}x vCPU Cores`, onRemove: () => { devopsCpuSlider.value = 1; } });
  if (lb === 'nginx') items.push({ id: 'nginx', label: 'NGINX Proxy', onRemove: () => { devopsLbSelect.value = 'none'; syncDropdownValue('devopsLbSelect', 'none', 'None (Direct Node Ingress - $0)'); } });
  if (lb === 'alb') items.push({ id: 'alb', label: 'Cloud ALB', onRemove: () => { devopsLbSelect.value = 'none'; syncDropdownValue('devopsLbSelect', 'none', 'None (Direct Node Ingress - $0)'); } });
  if (broker === 'redis') items.push({ id: 'redis', label: 'Redis Cache', onRemove: () => { devopsBrokerSelect.value = 'none'; monolithOptimized = false; syncDropdownValue('devopsBrokerSelect', 'none', 'None (Synchronous DB Contention - $0)'); } });
  if (broker === 'rabbitmq') items.push({ id: 'rabbitmq', label: 'RabbitMQ AMQP', onRemove: () => { devopsBrokerSelect.value = 'none'; syncDropdownValue('devopsBrokerSelect', 'none', 'None (Synchronous DB Contention - $0)'); } });
  if (broker === 'kafka') items.push({ id: 'kafka', label: 'Apache Kafka', onRemove: () => { devopsBrokerSelect.value = 'none'; syncDropdownValue('devopsBrokerSelect', 'none', 'None (Synchronous DB Contention - $0)'); } });
  if (currentStage === 3 && pods > 1) items.push({ id: 'pods', label: `${pods}x Pod Replicas`, onRemove: () => { if (sliderPods) sliderPods.value = 1; } });

  if (items.length === 0) {
    tray.innerHTML = '<span class="mono text-muted" style="font-size:11px;">Default Base Node (No extra extensions attached)</span>';
    return;
  }

  items.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'attached-chip';
    el.innerHTML = `<span>${item.label}</span><button class="attached-chip-remove" title="Remove">&times;</button>`;
    el.querySelector('.attached-chip-remove').addEventListener('click', () => {
      item.onRemove();
      calculateAndRenderLiveCost();
      renderActiveAttachedChips();
      showToast(`Removed ${item.label}.`, 'info');
    });
    tray.appendChild(el);
  });
}

function syncDropdownValue(targetId, val, labelText) {
  const dd = document.querySelector(`.custom-dropdown[data-target="${targetId}"]`);
  if (!dd) return;
  const valSpan = dd.querySelector('.dropdown-value');
  const hidden = document.getElementById(targetId);
  if (valSpan) valSpan.textContent = labelText;
  if (hidden) hidden.value = val;
  dd.querySelectorAll('.custom-dropdown-item').forEach((i) => {
    i.classList.toggle('selected', i.getAttribute('data-value') === val);
  });
}

// -------------------------------------------------------------
// 1-Click Auto-Remedy Scaling Handlers
// -------------------------------------------------------------
const btnAutoFixMono = document.getElementById('btnAutoFixMono');
if (btnAutoFixMono) {
  btnAutoFixMono.addEventListener('click', async () => {
    const currentCores = parseInt(devopsCpuSlider.value, 10) || 1;
    devopsCpuSlider.value = Math.min(32, Math.max(4, currentCores * 2));
    devopsRamSlider.value = Math.min(32, Math.max(4, parseFloat(devopsRamSlider.value) * 2));
    devopsLbSelect.value = 'nginx';
    devopsBrokerSelect.value = 'redis';
    monolithOptimized = true;

    syncDropdownValue('devopsLbSelect', 'nginx', 'NGINX Reverse Proxy (Keepalive - $12/mo)');
    syncDropdownValue('devopsBrokerSelect', 'redis', 'Redis Streams / BullMQ ($20/mo)');

    calculateAndRenderLiveCost();
    renderActiveAttachedChips();

    showToast('Auto-scaled to 4 vCPUs, NGINX Load Balancer & Redis Cache!', 'success');
    btnTestMonolith.click();
  });
}

const btnAutoFixMod = document.getElementById('btnAutoFixMod');
if (btnAutoFixMod) {
  btnAutoFixMod.addEventListener('click', async () => {
    const currentCores = parseInt(devopsCpuSlider.value, 10) || 4;
    devopsCpuSlider.value = Math.min(32, Math.max(8, currentCores * 2));
    devopsLbSelect.value = 'alb';
    devopsBrokerSelect.value = 'kafka';
    modularOptimized = true;

    syncDropdownValue('devopsLbSelect', 'alb', 'Cloud Application Load Balancer ($22.50/mo)');
    syncDropdownValue('devopsBrokerSelect', 'kafka', 'Apache Kafka Distributed Stream ($95/mo)');

    calculateAndRenderLiveCost();
    renderActiveAttachedChips();

    showToast('Auto-scaled to 8-Core Cluster, ALB & Apache Kafka Event Stream!', 'success');
    btnTestModular.click();
  });
}

const btnAutoFixMicro = document.getElementById('btnAutoFixMicro');
if (btnAutoFixMicro) {
  btnAutoFixMicro.addEventListener('click', async () => {
    if (sliderPods) {
      sliderPods.value = Math.min(20, (parseInt(sliderPods.value, 10) || 3) + 4);
    }
    devopsBrokerSelect.value = 'kafka';
    devopsLbSelect.value = 'alb';
    microOptimized = true;

    syncDropdownValue('devopsBrokerSelect', 'kafka', 'Apache Kafka Distributed Stream ($95/mo)');
    syncDropdownValue('devopsLbSelect', 'alb', 'Cloud Application Load Balancer ($22.50/mo)');

    calculateAndRenderLiveCost();
    renderActiveAttachedChips();

    showToast('Auto-scaled Pods & enabled gRPC multiplexing with Redlock!', 'success');
    btnTestMicro.click();
  });
}

navStep0?.addEventListener('click', () => goToStage(0));
navStep1?.addEventListener('click', () => goToStage(1));
navStep2?.addEventListener('click', () => goToStage(2));
navStep3?.addEventListener('click', () => goToStage(3));
navStep4?.addEventListener('click', () => goToStage(4));
navStep5?.addEventListener('click', () => goToStage(5));

btnHomeStartLab?.addEventListener('click', () => goToStage(1));
btnHomeJumpCalc?.addEventListener('click', () => goToStage(5));

btnAdvanceToStage2?.addEventListener('click', () => goToStage(2));
btnAdvanceToStage3?.addEventListener('click', () => goToStage(3));
btnAdvanceToStage4?.addEventListener('click', () => goToStage(4));

btnRestartLab?.addEventListener('click', () => {
  monolithOptimized = false;
  modularOptimized = false;
  microOptimized = false;
  resetStageUI();
  goToStage(0);
  showToast('Lab reset back to Home Blueprint.', 'info');
});

// -------------------------------------------------------------
// Dynamic Simulation API Helper
// -------------------------------------------------------------
async function runSimulation(stage, isOptimized, requests) {
  try {
    const payload = {
      stage,
      isOptimized,
      requests,
      cpuCores: parseInt(devopsCpuSlider.value, 10) || 1,
      ramGb: parseFloat(devopsRamSlider.value) || 2,
      loadBalancer: devopsLbSelect.value,
      broker: devopsBrokerSelect.value,
      dbEngine: devopsDbEngineSelect ? devopsDbEngineSelect.value : 'postgres_single',
      region: devopsRegionSelect ? devopsRegionSelect.value : 'us_east',
      chaosFault: activeChaos,
      pods: sliderPods ? parseInt(sliderPods.value, 10) || 3 : 1,
    };

    const res = await fetch('/api/lab/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.results;
  } catch (err) {
    console.error('Simulation error', err);
    return null;
  }
}

// -------------------------------------------------------------
// Chaos Engineering Fault Injection Triggers
// -------------------------------------------------------------
function initChaosControls() {
  function resetChaosButtons() {
    [btnChaosDb, btnChaosJitter, btnChaosSurge].forEach((b) => b?.classList.remove('active'));
  }

  function triggerActiveStageTest() {
    if (currentStage === 1 && btnTestMonolith) btnTestMonolith.click();
    else if (currentStage === 2 && btnTestModular) btnTestModular.click();
    else if (currentStage === 3 && btnTestMicro) btnTestMicro.click();
  }

  if (btnChaosDb) {
    btnChaosDb.addEventListener('click', () => {
      resetChaosButtons();
      btnChaosDb.classList.add('active');
      activeChaos = 'db_outage';
      showToast('INJECTED CHAOS: Primary Database Outage Triggered!', 'danger');
      triggerActiveStageTest();
    });
  }

  if (btnChaosJitter) {
    btnChaosJitter.addEventListener('click', () => {
      resetChaosButtons();
      btnChaosJitter.classList.add('active');
      activeChaos = 'network_jitter';
      showToast('INJECTED CHAOS: 200ms Network RPC Jitter Active!', 'danger');
      triggerActiveStageTest();
    });
  }

  if (btnChaosSurge) {
    btnChaosSurge.addEventListener('click', () => {
      resetChaosButtons();
      btnChaosSurge.classList.add('active');
      activeChaos = 'flash_surge';
      showToast('INJECTED CHAOS: 10x Flash-Sale Traffic Surge Active!', 'danger');
      triggerActiveStageTest();
    });
  }

  if (btnChaosReset) {
    btnChaosReset.addEventListener('click', () => {
      resetChaosButtons();
      activeChaos = 'none';
      showToast('Cleared all Chaos faults. Operating normally.', 'success');
      triggerActiveStageTest();
    });
  }
}

// -------------------------------------------------------------
// STAGE 1: Monolith Handlers
// -------------------------------------------------------------
async function executeMonolithTest(requests) {
  topoMonolithNode.classList.add('node-hot');
  topoMonolithDb.classList.add('node-hot');

  const r = await runSimulation('monolith', monolithOptimized, requests);

  if (r) {
    latestTelemetry.monolith = r;
    telMonoRps.textContent = `${r.throughputRps.toLocaleString()} req/s`;
    barMonoRps.style.width = `${Math.min(100, (r.throughputRps / r.hardware.maxHardwareCapacity) * 100)}%`;

    telMonoLatency.textContent = `${r.p95LatencyMs} ms`;
    barMonoLatency.style.width = `${Math.min(100, (r.p95LatencyMs / 25) * 100)}%`;

    telMonoCpu.textContent = `${r.cpuUsagePct}%`;
    barMonoCpu.style.width = `${r.cpuUsagePct}%`;

    telMonoDbLock.textContent = `${r.dbLockWaitMs} ms`;
    barMonoDbLock.style.width = `${Math.min(100, (r.dbLockWaitMs / 100) * 100)}%`;

    if (costPerMillion) costPerMillion.textContent = `$${r.costs.costPerMillionReqs.toFixed(4)} / 1M reqs`;

    diagMonoCard.classList.remove('hidden');
    diagMonoTitle.textContent = r.bottleneckData.title;
    diagMonoDesc.textContent = r.bottleneckData.physicalLimit;
    adviceMonoAction.textContent = r.scalingAdvice.resourceToIncrease;
    adviceMonoImpact.textContent = r.scalingAdvice.expectedImprovement;

    if (r.isBurstOverload) {
      topoMonolithNode.className = 'topo-node topo-monolith node-burst';
      diagMonoBadge.textContent = 'HARDWARE SATURATED';
      diagMonoBadge.className = 'diag-badge';
      showToast(`Hardware ceiling hit at ${r.throughputRps.toLocaleString()} req/s. CPU 100% saturated.`, 'danger');
      btnAdvanceToStage2.classList.remove('hidden');
    } else if (!monolithOptimized) {
      diagMonoBadge.textContent = 'BOTTLENECK DETECTED';
      diagMonoBadge.className = 'diag-badge';
      btnFixMonolith.classList.remove('hidden');
    } else {
      diagMonoBadge.textContent = 'OPTIMAL SCALE';
      diagMonoBadge.className = 'diag-badge opt-badge';
      btnFixMonolith.classList.add('hidden');
      btnAdvanceToStage2.classList.remove('hidden');
    }
  }
}

btnTestMonolith.addEventListener('click', async () => {
  btnTestMonolith.disabled = true;
  btnTestMonolith.textContent = 'Executing...';
  const reqs = parseInt(sliderStress1.value, 10);
  await executeMonolithTest(reqs);
  btnTestMonolith.disabled = false;
  btnTestMonolith.textContent = 'Inject Load';
});

btnRampMonolith.addEventListener('click', async () => {
  btnRampMonolith.disabled = true;
  btnRampMonolith.textContent = 'Ramping Stress...';
  showToast('Ramping stress through hardware limits...', 'info');

  const steps = [5000, 15000, 25000, 38000];
  for (const step of steps) {
    sliderStress1.value = step;
    sliderStress1.dispatchEvent(new Event('input'));
    await executeMonolithTest(step);
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  btnRampMonolith.disabled = false;
  btnRampMonolith.textContent = 'Ramp Stress Till Burst';
});

btnFixMonolith.addEventListener('click', async () => {
  monolithOptimized = true;
  monolithConfigLabel.textContent = 'Optimized: In-Memory Redis Cache Active';
  monolithConfigLabel.className = 'status-pill status-opt';

  topoMonolithNode.className = 'topo-node topo-monolith node-optimized';
  topoMonolithDb.className = 'topo-node topo-db node-optimized';
  topoMonolithState.textContent = 'In-Memory Cache (0.08ms)';
  topoDbState.textContent = 'Connection Pooled';
  topoDbHopLabel.textContent = 'Cached (85% Hit)';

  showToast('Applied In-Memory Caching & Pool Tuning. Re-testing...', 'success');
  btnTestMonolith.click();
});

// -------------------------------------------------------------
// STAGE 2: Modular Monolith Handlers
// -------------------------------------------------------------
async function executeModularTest(requests) {
  topoModularNode.classList.add('node-hot');
  topoModularDb.classList.add('node-hot');

  const r = await runSimulation('modular', modularOptimized, requests);

  if (r) {
    latestTelemetry.modular = r;
    telModRps.textContent = `${r.throughputRps.toLocaleString()} req/s`;
    barModRps.style.width = `${Math.min(100, (r.throughputRps / r.hardware.maxHardwareCapacity) * 100)}%`;

    telModLatency.textContent = `${r.p95LatencyMs} ms`;
    barModLatency.style.width = `${Math.min(100, (r.p95LatencyMs / 25) * 100)}%`;

    telModCpu.textContent = `${r.cpuUsagePct}%`;
    barModCpu.style.width = `${r.cpuUsagePct}%`;

    telModDbLock.textContent = `${r.dbLockWaitMs} ms`;
    barModDbLock.style.width = `${Math.min(100, (r.dbLockWaitMs / 100) * 100)}%`;

    if (costPerMillion) costPerMillion.textContent = `$${r.costs.costPerMillionReqs.toFixed(4)} / 1M reqs`;

    diagModCard.classList.remove('hidden');
    diagModTitle.textContent = r.bottleneckData.title;
    diagModDesc.textContent = r.bottleneckData.physicalLimit;
    adviceModAction.textContent = r.scalingAdvice.resourceToIncrease;
    adviceModImpact.textContent = r.scalingAdvice.expectedImprovement;

    if (r.isBurstOverload) {
      topoModularNode.className = 'topo-node topo-modular node-burst';
      diagModBadge.textContent = 'CLUSTER SATURATED';
      diagModBadge.className = 'diag-badge';
      showToast(`Cluster hardware ceiling reached at ${r.throughputRps.toLocaleString()} req/s.`, 'danger');
      btnAdvanceToStage3.classList.remove('hidden');
    } else if (!modularOptimized) {
      diagModBadge.textContent = 'BOTTLENECK DETECTED';
      diagModBadge.className = 'diag-badge';
      btnFixModular.classList.remove('hidden');
    } else {
      diagModBadge.textContent = 'OPTIMAL SCALE';
      diagModBadge.className = 'diag-badge opt-badge';
      btnFixModular.classList.add('hidden');
      btnAdvanceToStage3.classList.remove('hidden');
    }
  }
}

btnTestModular.addEventListener('click', async () => {
  btnTestModular.disabled = true;
  btnTestModular.textContent = 'Executing...';
  const reqs = parseInt(sliderStress2.value, 10);
  await executeModularTest(reqs);
  btnTestModular.disabled = false;
  btnTestModular.textContent = 'Inject Cluster Load';
});

btnRampModular.addEventListener('click', async () => {
  btnRampModular.disabled = true;
  btnRampModular.textContent = 'Ramping Stress...';
  showToast('Ramping Modular cluster stress...', 'info');

  const steps = [15000, 45000, 70000, 90000];
  for (const step of steps) {
    sliderStress2.value = step;
    sliderStress2.dispatchEvent(new Event('input'));
    await executeModularTest(step);
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  btnRampModular.disabled = false;
  btnRampModular.textContent = 'Ramp Stress Till Burst';
});

btnFixModular.addEventListener('click', async () => {
  modularOptimized = true;
  modularConfigLabel.textContent = 'Optimized: Async Message Queue (BullMQ)';
  modularConfigLabel.className = 'status-pill status-opt';

  topoModularNode.className = 'topo-node topo-modular node-optimized';
  topoModularDb.className = 'topo-node topo-db node-optimized';
  topoModularState.textContent = 'Async Domain Event Bus';
  topoModularDbState.textContent = 'Write-Behind Batching';
  topoModularDbHopLabel.textContent = 'Non-blocking Queue';

  showToast('Enabled Asynchronous Write-Behind Queue. Re-testing...', 'success');
  btnTestModular.click();
});

// -------------------------------------------------------------
// STAGE 3: Microservices Handlers
// -------------------------------------------------------------
async function executeMicroTest(requests) {
  const r = await runSimulation('microservices', microOptimized, requests);

  if (r) {
    latestTelemetry.microservices = r;
    telMicroRps.textContent = `${r.throughputRps.toLocaleString()} req/s`;
    barMicroRps.style.width = `${Math.min(100, (r.throughputRps / r.hardware.maxHardwareCapacity) * 100)}%`;

    telMicroNetwork.textContent = `${r.networkHopMs} ms`;
    barMicroNetwork.style.width = `${Math.min(100, (r.networkHopMs / 40) * 100)}%`;

    telMicroLatency.textContent = `${r.p95LatencyMs} ms`;
    barMicroLatency.style.width = `${Math.min(100, (r.p95LatencyMs / 25) * 100)}%`;

    telMicroErrors.textContent = `${r.errors} errors`;

    if (costPerMillion) costPerMillion.textContent = `$${r.costs.costPerMillionReqs.toFixed(4)} / 1M reqs`;

    diagMicroCard.classList.remove('hidden');
    diagMicroTitle.textContent = r.bottleneckData.title;
    diagMicroDesc.textContent = r.bottleneckData.physicalLimit;
    adviceMicroAction.textContent = r.scalingAdvice.resourceToIncrease;
    adviceMicroImpact.textContent = r.scalingAdvice.expectedImprovement;

    if (r.isBurstOverload) {
      diagMicroBadge.textContent = 'POD SATURATION LIMIT';
      diagMicroBadge.className = 'diag-badge';
      showToast(`Microservices reached compute limits at ${r.throughputRps.toLocaleString()} req/s.`, 'danger');
      btnAdvanceToStage4.classList.remove('hidden');
    } else if (!microOptimized) {
      diagMicroBadge.textContent = 'RPC OVERHEAD DETECTED';
      diagMicroBadge.className = 'diag-badge';
      btnFixMicro.classList.remove('hidden');
    } else {
      diagMicroBadge.textContent = 'OPTIMAL SCALE';
      diagMicroBadge.className = 'diag-badge opt-badge';
      btnFixMicro.classList.add('hidden');
      btnAdvanceToStage4.classList.remove('hidden');
    }
  }
}

btnTestMicro.addEventListener('click', async () => {
  btnTestMicro.disabled = true;
  btnTestMicro.textContent = 'Executing...';
  const reqs = parseInt(sliderStress3.value, 10);
  await executeMicroTest(reqs);
  btnTestMicro.disabled = false;
  btnTestMicro.textContent = 'Inject Distributed Load';
});

btnRampMicro.addEventListener('click', async () => {
  btnRampMicro.disabled = true;
  btnRampMicro.textContent = 'Ramping Stress...';
  showToast('Ramping distributed load across pods...', 'info');

  const steps = [30000, 80000, 140000, 190000];
  for (const step of steps) {
    sliderStress3.value = step;
    sliderStress3.dispatchEvent(new Event('input'));
    await executeMicroTest(step);
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  btnRampMicro.disabled = false;
  btnRampMicro.textContent = 'Ramp Stress Till Burst';
});

btnFixMicro.addEventListener('click', async () => {
  microOptimized = true;
  microConfigLabel.textContent = 'Optimized: gRPC Protocol Buffers & Key Sharding';
  microConfigLabel.className = 'status-pill status-opt';

  topoRpcHopLabel.textContent = 'gRPC Multiplexing (2.1ms)';
  podInventoryState.textContent = 'Port 5002 (Redlock Sharded)';

  showToast('Enabled gRPC HTTP/2 Multiplexing & Sharding. Re-testing...', 'success');
  btnTestMicro.click();
});

// -------------------------------------------------------------
// Interactive Multi-Architecture Sandbox Controller
// -------------------------------------------------------------
const sbLatencyMono = document.getElementById('sbLatencyMono');
const sbLatencyMod = document.getElementById('sbLatencyMod');
const sbLatencyMicro = document.getElementById('sbLatencyMicro');
const sbResMono = document.getElementById('sbResMono');
const sbResMod = document.getElementById('sbResMod');
const sbResMicro = document.getElementById('sbResMicro');

document.querySelectorAll('.sandbox-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const method = btn.getAttribute('data-method');
    const endpoint = btn.getAttribute('data-url');
    const bodyStr = btn.getAttribute('data-body');

    // UI Loading indicator
    [sbLatencyMono, sbLatencyMod, sbLatencyMicro].forEach((l) => (l.textContent = 'Running...'));
    sbResMono.textContent = 'Waiting for response...';
    sbResMod.textContent = 'Waiting for response...';
    sbResMicro.textContent = 'Waiting for response...';

    // Helper to send real request and measure duration
    async function testTarget(archPrefix) {
      const start = performance.now();
      try {
        const options = {
          method,
          headers: { 'Content-Type': 'application/json' },
        };
        if (bodyStr && method === 'POST') {
          options.body = bodyStr;
        }
        const res = await fetch(`/arch/${archPrefix}/api${endpoint}`, options);
        let data;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          data = { status: res.status, text: await res.text() };
        }
        const duration = (performance.now() - start).toFixed(2);
        return { ok: res.ok, duration, data };
      } catch (err) {
        const duration = (performance.now() - start).toFixed(2);
        return { ok: false, duration, error: err.message };
      }
    }

    const [rMono, rMod, rMicro] = await Promise.all([
      testTarget('monolith'),
      testTarget('modular'),
      testTarget('microservices'),
    ]);

    // Render Monolith
    sbLatencyMono.textContent = `${rMono.duration} ms`;
    sbResMono.textContent = JSON.stringify(rMono.data || rMono.error, null, 2);

    // Render Modular
    sbLatencyMod.textContent = `${rMod.duration} ms`;
    sbResMod.textContent = JSON.stringify(rMod.data || rMod.error, null, 2);

    // Render Microservices
    sbLatencyMicro.textContent = `${rMicro.duration} ms`;
    sbResMicro.textContent = JSON.stringify(rMicro.data || rMicro.error, null, 2);

    showToast(`Executed ${method} ${endpoint} across all 3 architectures.`, 'info');
  });
});

// -------------------------------------------------------------
// Architecture Decision Wizard Controller
// -------------------------------------------------------------
const wizTeamSize = document.getElementById('wizTeamSize');
const wizTraffic = document.getElementById('wizTraffic');
const wizConsistency = document.getElementById('wizConsistency');
const wizDevOps = document.getElementById('wizDevOps');
const wizRecBadge = document.getElementById('wizRecBadge');
const wizRecTitle = document.getElementById('wizRecTitle');
const wizRecWhy = document.getElementById('wizRecWhy');
const wizRecWatch = document.getElementById('wizRecWatch');
const wizRecHow = document.getElementById('wizRecHow');
const wizRecBox = document.getElementById('wizRecBox');

function updateArchitectureRecommendation() {
  if (!wizTeamSize || !wizTraffic || !wizConsistency || !wizDevOps) return;

  const team = wizTeamSize.value;
  const traffic = wizTraffic.value;
  const consistency = wizConsistency.value;
  const devops = wizDevOps.value;

  if (team === 'large' || traffic === 'high' || (devops === 'high' && consistency === 'distributed')) {
    wizRecBadge.textContent = 'RECOMMENDED: MICROSERVICES';
    wizRecBadge.className = 'badge-pill bg-purple';
    wizRecTitle.textContent = 'Decoupled Distributed Microservices Mesh';
    wizRecWhy.textContent = 'Your team size (20+ engineers) or peak throughput (>100k req/s) requires independent deployment autonomy and horizontal container autoscaling.';
    wizRecWatch.textContent = 'Watch out for network serialization tax (2-5ms per hop) and cascading failures. Implement gRPC multiplexing and circuit breakers.';
    wizRecHow.textContent = 'Scale horizontally across Kubernetes pods behind Anycast load balancers with sharded distributed mutexes (Redlock).';
  } else if (team === 'small' && traffic === 'low' && devops === 'low') {
    wizRecBadge.textContent = 'RECOMMENDED: SINGLE MONOLITH';
    wizRecBadge.className = 'badge-pill bg-blue';
    wizRecTitle.textContent = 'Single-Process In-Memory Monolith';
    wizRecWhy.textContent = 'For 1-5 engineers and <20k req/s, a single monolith gives you 10x faster shipping speed, zero network serialization latency, and simple 1-server deployments.';
    wizRecWatch.textContent = 'Watch out for single-core CPU saturation (~35k req/s) and synchronous unindexed query locks.';
    wizRecHow.textContent = 'Add In-Memory Caching (Redis/RAM) and DB Connection Pooling. When single-core CPU hits 100%, cluster across CPU cores in a Modular Monolith.';
  } else {
    wizRecBadge.textContent = 'RECOMMENDED: MODULAR MONOLITH';
    wizRecBadge.className = 'badge-pill bg-emerald';
    wizRecTitle.textContent = 'Domain Isolated Multi-Core Monolith';
    wizRecWhy.textContent = 'The gold standard sweet spot: Segregated domain modules give 6-20 engineers clean code ownership and 80k+ req/s multi-core speed without microservices DevOps overhead.';
    wizRecWatch.textContent = 'Avoid synchronous cross-domain database transactions. Use the asynchronous in-memory event bus (eventBus.js).';
    wizRecHow.textContent = 'Add an Asynchronous Write-Behind Queue (BullMQ/Redis), then extract only high-traffic domains into standalone services as needed.';
  }
}

// -------------------------------------------------------------
// Custom Dropdown Interactive Engine
// -------------------------------------------------------------
function initCustomDropdowns() {
  document.querySelectorAll('.custom-dropdown').forEach((dropdown) => {
    const trigger = dropdown.querySelector('.custom-dropdown-trigger');
    const menu = dropdown.querySelector('.custom-dropdown-menu');
    const valueSpan = dropdown.querySelector('.dropdown-value');
    const inputId = dropdown.getAttribute('data-target');
    const hiddenInput = document.getElementById(inputId);

    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');

      document.querySelectorAll('.custom-dropdown.open').forEach((d) => {
        if (d !== dropdown) {
          d.classList.remove('open');
          const t = d.querySelector('.custom-dropdown-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        dropdown.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    dropdown.querySelectorAll('.custom-dropdown-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = item.getAttribute('data-value');
        const text = item.textContent;

        dropdown.querySelectorAll('.custom-dropdown-item').forEach((i) => i.classList.remove('selected'));
        item.classList.add('selected');

        if (valueSpan) valueSpan.textContent = text;
        if (hiddenInput) {
          hiddenInput.value = value;
          hiddenInput.dispatchEvent(new Event('change'));
        }

        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');

        updateArchitectureRecommendation();
        calculateAndRenderLiveCost();
        updateApiMasterclass();
      });
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown.open').forEach((d) => {
      d.classList.remove('open');
      const t = d.querySelector('.custom-dropdown-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  });
}

// -------------------------------------------------------------
// Interactive API Masterclass Simulator Engine
// -------------------------------------------------------------
const apiProtoSelect = document.getElementById('apiProtoSelect');
const apiFormatSelect = document.getElementById('apiFormatSelect');
const apiWireSize = document.getElementById('apiWireSize');
const apiTcpTax = document.getElementById('apiTcpTax');
const apiCpuOverhead = document.getElementById('apiCpuOverhead');
const apiHolStatus = document.getElementById('apiHolStatus');

const apiRateAlgoSelect = document.getElementById('apiRateAlgoSelect');
const apiBurstSlider = document.getElementById('apiBurstSlider');
const valApiBurst = document.getElementById('valApiBurst');
const apiAllowedCount = document.getElementById('apiAllowedCount');
const apiThrottledCount = document.getElementById('apiThrottledCount');
const apiRetryAfter = document.getElementById('apiRetryAfter');
const apiAlgoAssessment = document.getElementById('apiAlgoAssessment');

function updateApiMasterclass() {
  const proto = apiProtoSelect ? apiProtoSelect.value : 'http2';
  const format = apiFormatSelect ? apiFormatSelect.value : 'json_gzip';

  // 1. Calculate Wire Size
  let baseSizeKb = 14.8;
  if (format === 'json_raw') baseSizeKb = 14.8;
  else if (format === 'json_gzip') baseSizeKb = 4.2;
  else if (format === 'protobuf') baseSizeKb = 1.6;
  else if (format === 'msgpack') baseSizeKb = 2.8;

  let headerTaxKb = 0.85;
  if (proto === 'http2') headerTaxKb = 0.12;
  else if (proto === 'http3') headerTaxKb = 0.08;
  else if (proto === 'grpc') headerTaxKb = 0.05;
  else if (proto === 'websocket') headerTaxKb = 0.002;

  const totalWireKb = (baseSizeKb + headerTaxKb).toFixed(2);
  const reductionPct = Math.round((1 - (baseSizeKb + headerTaxKb) / 15.65) * 100);
  if (apiWireSize) {
    apiWireSize.textContent = `${totalWireKb} KB (${reductionPct > 0 ? `${reductionPct}% smaller` : 'Baseline'})`;
  }

  // 2. TCP Handshake Tax
  if (apiTcpTax) {
    if (proto === 'http1') apiTcpTax.textContent = '45.0 ms (New TCP SYN per call)';
    else if (proto === 'http3') apiTcpTax.textContent = '0.0 ms (QUIC 0-RTT UDP)';
    else apiTcpTax.textContent = '0.0 ms (Connection Reused / Keep-Alive)';
  }

  // 3. Serialization CPU Overhead
  if (apiCpuOverhead) {
    if (format === 'protobuf') apiCpuOverhead.textContent = '0.04 ms (Direct Binary Shift)';
    else if (format === 'json_gzip') apiCpuOverhead.textContent = '0.22 ms (V8 Parse + Deflate)';
    else if (format === 'msgpack') apiCpuOverhead.textContent = '0.09 ms (Binary Packer)';
    else apiCpuOverhead.textContent = '0.14 ms (JSON.stringify)';
  }

  // 4. Head-of-Line Status
  if (apiHolStatus) {
    if (proto === 'http1') {
      apiHolStatus.textContent = 'High (Sequential Request Blocking)';
      apiHolStatus.className = 'mono text-danger';
    } else if (proto === 'http2') {
      apiHolStatus.textContent = 'Zero (Multiplexed Streams in 1 Socket)';
      apiHolStatus.className = 'mono text-emerald';
    } else if (proto === 'http3') {
      apiHolStatus.textContent = 'Zero (QUIC Independent Packet Streams)';
      apiHolStatus.className = 'mono text-emerald';
    } else if (proto === 'grpc') {
      apiHolStatus.textContent = 'Zero (HTTP/2 Multiplexed Binary)';
      apiHolStatus.className = 'mono text-emerald';
    } else {
      apiHolStatus.textContent = 'Zero (Full-Duplex Socket Stream)';
      apiHolStatus.className = 'mono text-emerald';
    }
  }

  // 5. Rate Limiter Calculation
  if (apiBurstSlider && valApiBurst) {
    const burst = parseInt(apiBurstSlider.value, 10) || 1200;
    valApiBurst.textContent = `${burst.toLocaleString()} req/s`;
    const algo = apiRateAlgoSelect ? apiRateAlgoSelect.value : 'token_bucket';

    const capacity = 1000;
    let allowed = Math.min(capacity, burst);
    let throttled = Math.max(0, burst - capacity);

    if (algo === 'leaky_bucket') {
      allowed = Math.min(800, burst);
      throttled = Math.max(0, burst - 800);
      if (apiAlgoAssessment) apiAlgoAssessment.textContent = 'Enforces strictly smooth constant outflow (800/s)';
      if (apiRetryAfter) apiRetryAfter.textContent = 'Retry-After: 1.2s';
    } else if (algo === 'fixed_window') {
      allowed = Math.min(1000, burst);
      throttled = Math.max(0, burst - 1000);
      if (apiAlgoAssessment) apiAlgoAssessment.textContent = 'Warning: Boundary reset allows 2x burst vulnerability';
      if (apiRetryAfter) apiRetryAfter.textContent = 'Retry-After: 0.5s';
    } else if (algo === 'sliding_window') {
      allowed = Math.min(1000, burst);
      throttled = Math.max(0, burst - 1000);
      if (apiAlgoAssessment) apiAlgoAssessment.textContent = 'Accurate weighted rolling calculation without spike loopholes';
      if (apiRetryAfter) apiRetryAfter.textContent = 'Retry-After: 0.7s';
    } else {
      allowed = Math.min(1000, burst);
      throttled = Math.max(0, burst - 1000);
      if (apiAlgoAssessment) apiAlgoAssessment.textContent = 'Allows burst capacity up to bucket size, refills steadily';
      if (apiRetryAfter) apiRetryAfter.textContent = 'Retry-After: 0.8s';
    }

    if (apiAllowedCount) apiAllowedCount.textContent = `${allowed.toLocaleString()} req/s (${Math.round((allowed / burst) * 100)}%)`;
    if (apiThrottledCount) {
      apiThrottledCount.textContent = throttled > 0 ? `${throttled.toLocaleString()} req/s (Throttled)` : '0 req/s (Zero 429s)';
      apiThrottledCount.className = throttled > 0 ? 'mono text-danger' : 'mono text-emerald';
    }
  }
}

if (apiBurstSlider) apiBurstSlider.addEventListener('input', updateApiMasterclass);

// -------------------------------------------------------------
// Stage 5: System Design Capacity Planner Engine
// -------------------------------------------------------------
const sysDauSlider = document.getElementById('sysDauSlider');
const valSysDau = document.getElementById('valSysDau');
const sysRwRatioSelect = document.getElementById('sysRwRatioSelect');
const sysPayloadSelect = document.getElementById('sysPayloadSelect');
const sysRetentionSelect = document.getElementById('sysRetentionSelect');

const sysPeakQps = document.getElementById('sysPeakQps');
const sysAvgQps = document.getElementById('sysAvgQps');
const sysBandwidth = document.getElementById('sysBandwidth');
const sysBandwidthGb = document.getElementById('sysBandwidthGb');
const sysCacheRam = document.getElementById('sysCacheRam');
const sysStorageGrowth = document.getElementById('sysStorageGrowth');
const sysStorageDaily = document.getElementById('sysStorageDaily');

function calculateSystemDesignCapacity() {
  if (!sysDauSlider) return;
  const dau = parseInt(sysDauSlider.value, 10) || 5000000;
  const rwRatio = parseInt(sysRwRatioSelect?.value || '50', 10);
  const payloadKb = parseFloat(sysPayloadSelect?.value || '10');
  const retentionDays = parseInt(sysRetentionSelect?.value || '365', 10);

  if (valSysDau) valSysDau.textContent = `${dau.toLocaleString()} DAU`;

  // Assuming average user makes 100 requests/day
  const totalDailyRequests = dau * 100;
  const avgQps = Math.round(totalDailyRequests / 86400);
  const peakQps = Math.round(avgQps * 3.0);

  if (sysAvgQps) sysAvgQps.textContent = `Avg: ${avgQps.toLocaleString()} req/s (3x Peak)`;
  if (sysPeakQps) sysPeakQps.textContent = `${peakQps.toLocaleString()} req/s`;

  // Bandwidth (Mbps) = (Peak QPS * Payload Size in KB * 8 bits) / 1024
  const bandwidthMbps = (peakQps * payloadKb * 8) / 1024;
  const mbPerSec = (peakQps * payloadKb) / 1024;

  if (sysBandwidth) {
    sysBandwidth.textContent = bandwidthMbps >= 1000
      ? `${(bandwidthMbps / 1000).toFixed(2)} Gbps`
      : `${bandwidthMbps.toFixed(1)} Mbps`;
  }
  if (sysBandwidthGb) {
    sysBandwidthGb.textContent = `~${mbPerSec.toFixed(1)} MB/sec Network I/O`;
  }

  // Storage writes per day: (Total Daily Reqs / (rwRatio + 1)) * payloadKb in GB
  const dailyWrites = totalDailyRequests / (rwRatio + 1);
  const dailyStorageGb = (dailyWrites * payloadKb) / (1024 * 1024);
  const totalRetentionTb = (dailyStorageGb * retentionDays) / 1024;

  if (sysStorageDaily) sysStorageDaily.textContent = `~${dailyStorageGb.toFixed(1)} GB / day data writes`;
  if (sysStorageGrowth) {
    sysStorageGrowth.textContent = totalRetentionTb >= 1.0
      ? `${totalRetentionTb.toFixed(1)} TB / ${retentionDays >= 365 ? 'year' : `${retentionDays}d`}`
      : `${(totalRetentionTb * 1024).toFixed(0)} GB / ${retentionDays}d`;
  }

  // Cache RAM (80/20 Pareto Principle: 20% of daily read requests stored in RAM)
  const dailyReads = totalDailyRequests * (rwRatio / (rwRatio + 1));
  const dailyReadVolumeGb = (dailyReads * payloadKb) / (1024 * 1024);
  const cacheRamGb = dailyReadVolumeGb * 0.20;

  if (sysCacheRam) {
    sysCacheRam.textContent = cacheRamGb >= 1024
      ? `${(cacheRamGb / 1024).toFixed(2)} TB RAM`
      : `${cacheRamGb.toFixed(1)} GB RAM`;
  }
}

if (sysDauSlider) sysDauSlider.addEventListener('input', calculateSystemDesignCapacity);

// -------------------------------------------------------------
// Stage 5: CAP Theorem Partition Simulator
// -------------------------------------------------------------
function initCapSimulator() {
  const btnTogglePartition = document.getElementById('btnTogglePartition');
  const btnCapCP = document.getElementById('btnCapCP');
  const btnCapAP = document.getElementById('btnCapAP');
  const capSplitLine = document.getElementById('capSplitLine');
  const capNode1 = document.getElementById('capNode1');
  const capNode2 = document.getElementById('capNode2');
  const capExplanation = document.getElementById('capExplanation');

  let isPartitionActive = false;
  let capMode = 'cp';

  function renderCapState() {
    if (!btnTogglePartition || !capExplanation) return;

    if (!isPartitionActive) {
      btnTogglePartition.textContent = 'Inject Network Partition Split';
      btnTogglePartition.className = 'btn btn-danger btn-sm';
      if (capSplitLine) capSplitLine.classList.remove('broken');
      if (capNode1) {
        capNode1.className = 'cap-node healthy';
        const s = capNode1.querySelector('span');
        if (s) s.textContent = 'State: Quorum Leader';
      }
      if (capNode2) {
        capNode2.className = 'cap-node healthy';
        const s = capNode2.querySelector('span');
        if (s) s.textContent = 'State: Sync Replica';
      }
      capExplanation.innerHTML = '<strong>Normal Healthy Operations:</strong> Both availability zones replicate data synchronously with zero dirty reads and zero downtime.';
      return;
    }

    btnTogglePartition.textContent = 'Heal Network Partition';
    btnTogglePartition.className = 'btn btn-success btn-sm';
    if (capSplitLine) capSplitLine.classList.add('broken');

    if (capMode === 'cp') {
      if (capNode1) {
        capNode1.className = 'cap-node healthy';
        const s = capNode1.querySelector('span');
        if (s) s.textContent = 'State: Primary (Accepting Writes)';
      }
      if (capNode2) {
        capNode2.className = 'cap-node isolated';
        const s = capNode2.querySelector('span');
        if (s) s.textContent = 'State: 503 Read-Only (Rejecting Writes)';
      }
      capExplanation.innerHTML = '<strong>CP Mode (Consistency Chosen):</strong> Secondary Zone rejects write mutations with <code>503 Service Unavailable</code> to prevent split-brain dirty data divergence. Preserves 100% ACID consistency at the expense of availability.';
    } else {
      if (capNode1) {
        capNode1.className = 'cap-node healthy';
        const s = capNode1.querySelector('span');
        if (s) s.textContent = 'State: Accepting Writes (Vector v1)';
      }
      if (capNode2) {
        capNode2.className = 'cap-node healthy';
        const s = capNode2.querySelector('span');
        if (s) s.textContent = 'State: Accepting Writes (Vector v2)';
      }
      capExplanation.innerHTML = '<strong>AP Mode (Availability Chosen):</strong> Both zones continue accepting user writes independently. When the partition heals, conflicts are resolved via Vector Clocks / Last-Write-Wins CRDT merging. Preserves 100% uptime with eventual consistency.';
    }
  }

  btnTogglePartition?.addEventListener('click', () => {
    isPartitionActive = !isPartitionActive;
    showToast(isPartitionActive ? 'Simulated Network Split Partition across zones!' : 'Network partition healed.', isPartitionActive ? 'danger' : 'success');
    renderCapState();
  });

  btnCapCP?.addEventListener('click', () => {
    capMode = 'cp';
    btnCapCP.classList.add('active');
    btnCapAP.classList.remove('active');
    renderCapState();
  });

  btnCapAP?.addEventListener('click', () => {
    capMode = 'ap';
    btnCapAP.classList.add('active');
    btnCapCP.classList.remove('active');
    renderCapState();
  });
}

// -------------------------------------------------------------
// Stage 5: SAGA Distributed Transaction Rollback Visualizer
// -------------------------------------------------------------
function initSagaVisualizer() {
  const btnRunSagaSuccess = document.getElementById('btnRunSagaSuccess');
  const btnRunSagaFailure = document.getElementById('btnRunSagaFailure');
  const s1 = document.getElementById('sagaStep1');
  const s2 = document.getElementById('sagaStep2');
  const s3 = document.getElementById('sagaStep3');
  const s4 = document.getElementById('sagaStep4');
  const sagaLiveDesc = document.getElementById('sagaLiveDesc');

  function resetSagaSteps() {
    [s1, s2, s3, s4].forEach((s) => {
      if (s) {
        s.className = 'saga-step';
        s.querySelector('.saga-status').textContent = 'Ready';
      }
    });
  }

  btnRunSagaSuccess?.addEventListener('click', async () => {
    resetSagaSteps();
    if (sagaLiveDesc) sagaLiveDesc.textContent = '[Step 1/4]: Orders Service creating pending order #ord_9821...';
    s1.className = 'saga-step active';
    s1.querySelector('.saga-status').textContent = 'Creating...';

    await new Promise((r) => setTimeout(r, 600));
    s1.className = 'saga-step completed';
    s1.querySelector('.saga-status').textContent = 'Created (201)';
    if (sagaLiveDesc) sagaLiveDesc.textContent = '[Step 2/4]: Payment Service reserving $120.00 via Stripe API...';
    s2.className = 'saga-step active';
    s2.querySelector('.saga-status').textContent = 'Reserving...';

    await new Promise((r) => setTimeout(r, 600));
    s2.className = 'saga-step completed';
    s2.querySelector('.saga-status').textContent = 'Reserved (Auth)';
    if (sagaLiveDesc) sagaLiveDesc.textContent = '[Step 3/4]: Inventory Service decrementing warehouse SKU stock...';
    s3.className = 'saga-step active';
    s3.querySelector('.saga-status').textContent = 'Deducting...';

    await new Promise((r) => setTimeout(r, 600));
    s3.className = 'saga-step completed';
    s3.querySelector('.saga-status').textContent = 'Deducted (OK)';
    if (sagaLiveDesc) sagaLiveDesc.textContent = '[Step 4/4]: Dispatch Service notifying customer and issuing shipping label...';
    s4.className = 'saga-step completed';
    s4.querySelector('.saga-status').textContent = 'Dispatched (Done)';

    if (sagaLiveDesc) sagaLiveDesc.textContent = 'SUCCESS: All 4 SAGA distributed transactions committed cleanly across all microservices!';
    showToast('Distributed SAGA completed with zero failures!', 'success');
  });

  btnRunSagaFailure?.addEventListener('click', async () => {
    resetSagaSteps();
    if (sagaLiveDesc) sagaLiveDesc.textContent = '[Step 1/4]: Orders Service creating pending order #ord_9822...';
    s1.className = 'saga-step active';
    s1.querySelector('.saga-status').textContent = 'Creating...';

    await new Promise((r) => setTimeout(r, 500));
    s1.className = 'saga-step completed';
    s1.querySelector('.saga-status').textContent = 'Created (201)';
    if (sagaLiveDesc) sagaLiveDesc.textContent = '[Step 2/4]: Payment Service reserving $120.00...';
    s2.className = 'saga-step active';
    s2.querySelector('.saga-status').textContent = 'Reserving...';

    await new Promise((r) => setTimeout(r, 500));
    s2.className = 'saga-step completed';
    s2.querySelector('.saga-status').textContent = 'Reserved (Auth)';
    if (sagaLiveDesc) sagaLiveDesc.textContent = '[Step 3/4]: Inventory Service trying to reserve SKU... (OUT OF STOCK ERROR 409!)';
    s3.className = 'saga-step failed';
    s3.querySelector('.saga-status').textContent = 'Stock Exhausted (409)';

    await new Promise((r) => setTimeout(r, 700));
    if (sagaLiveDesc) sagaLiveDesc.textContent = '[COMPENSATING SAGA TRIGGERED]: Reversing Step 2 — Issuing automated Payment Refund...';
    s2.className = 'saga-step compensated';
    s2.querySelector('.saga-status').textContent = 'Refunded ($120 back)';

    await new Promise((r) => setTimeout(r, 600));
    if (sagaLiveDesc) sagaLiveDesc.textContent = '[COMPENSATING SAGA TRIGGERED]: Reversing Step 1 — Marking Order as Cancelled.';
    s1.className = 'saga-step compensated';
    s1.querySelector('.saga-status').textContent = 'Cancelled (Void)';
    s4.className = 'saga-step';
    s4.querySelector('.saga-status').textContent = 'Skipped';

    if (sagaLiveDesc) sagaLiveDesc.textContent = 'COMPENSATION COMPLETE: SAGA successfully rolled back payment and cancelled order without leaving orphaned state.';
    showToast('Compensating transactions executed successfully!', 'info');
  });
}

initCustomDropdowns();
initPlaygroundPalette();
initChaosControls();
initCapSimulator();
initSagaVisualizer();
updateArchitectureRecommendation();
updateApiMasterclass();
calculateSystemDesignCapacity();
fetchLiveHostSpecs();
calculateAndRenderLiveCost();
renderActiveAttachedChips();
goToStage(0);

// -------------------------------------------------------------
// Code Deep-Dive Modal Handlers
// -------------------------------------------------------------
const codeSnippets = {
  monolith: {
    title: 'Monolith: In-Memory Bottleneck vs Hash Cache',
    desc: 'Why un-indexed array scans in a single JavaScript thread cause 100% CPU lock vs Map.get() O(1) in-memory cache:',
    unopt: `// UNOPTIMIZED: O(N) linear array filter blocking single event loop
app.get('/api/products', (req, res) => {
  const result = monolithDb.products.filter(p => {
    return p.name.includes(req.query.search); // Blocks 100% CPU on 35k req/s
  });
  res.json(result);
});`,
    opt: `// OPTIMIZED: O(1) Hash Map Cache
const productCache = new Map();
app.get('/api/products', (req, res) => {
  const cached = productCache.get(req.query.search);
  if (cached) return res.json(cached); // 0.05ms response time
  const result = queryIndexedDatabase(req.query.search);
  productCache.set(req.query.search, result);
  res.json(result);
});`,
  },
  modular: {
    title: 'Modular Monolith: Synchronous Locks vs Async Event Bus',
    desc: 'Why synchronous cross-domain database transactions create lock wait spikes vs async event decoupling:',
    unopt: `// UNOPTIMIZED: Synchronous inter-domain row locking
ordersRouter.post('/checkout', (req, res) => {
  db.transaction(() => {
    inventoryDb.lockRow(req.body.productId); // Contention bottleneck
    ordersDb.insertOrder(req.body);
  });
  res.status(201).json({ success: true });
});`,
    opt: `// OPTIMIZED: Asynchronous Domain Event Bus (eventBus.js)
ordersRouter.post('/checkout', (req, res) => {
  const reservation = tryReserveStock(req.body.productId);
  if (!reservation.success) return res.status(409).json({ error: 'Out of stock' });
  
  // Non-blocking background event dispatch
  eventBus.publish('ORDER_CREATED', req.body);
  res.status(201).json({ success: true, remaining: reservation.remainingStock });
});`,
  },
  microservices: {
    title: 'Microservices: Chained REST Hops vs gRPC Multiplexing',
    desc: 'How synchronous HTTP/1.1 JSON hops accumulate 20ms+ latency vs binary gRPC HTTP/2 multiplexing:',
    unopt: `// UNOPTIMIZED: Sequential synchronous REST HTTP hops
gateway.post('/checkout', async (req, res) => {
  const catalog = await fetch('http://catalog:5001/products/' + req.body.id); // +8ms
  const stock = await fetch('http://inventory:5002/reserve', { method: 'POST' }); // +12ms
  const order = await fetch('http://orders:5003/create', { method: 'POST' }); // +10ms
  res.json(order); // Total network hop tax: 30ms!
});`,
    opt: `// OPTIMIZED: gRPC HTTP/2 Multiplexing + Distributed Mutex
gateway.post('/checkout', async (req, res) => {
  // Binary Protobuf multiplexed over 1 persistent TCP socket
  const [catalog, stock] = await Promise.all([
    grpcCatalogClient.getProduct({ id: req.body.id }),
    grpcInventoryClient.tryReserve({ id: req.body.id })
  ]);
  const order = await grpcOrdersClient.createOrder({ ...catalog, ...stock });
  res.json(order); // Total hop tax: 2.1ms!
});`,
  },
};

function openCodeModal(archKey) {
  const snippet = codeSnippets[archKey];
  if (!snippet) return;
  codeModalTitle.textContent = snippet.title;
  codeModalDesc.textContent = snippet.desc;
  codeDiffContent.innerHTML = `
    <div class="code-diff-col">
      <div class="code-diff-header text-danger">Unoptimized Bottleneck</div>
      <pre class="code-block">${snippet.unopt}</pre>
    </div>
    <div class="code-diff-col">
      <div class="code-diff-header text-emerald">Optimized Implementation</div>
      <pre class="code-block">${snippet.opt}</pre>
    </div>
  `;
  codeModal.classList.remove('hidden');
}

btnCodeMono.addEventListener('click', () => openCodeModal('monolith'));
btnCodeMod.addEventListener('click', () => openCodeModal('modular'));
btnCodeMicro.addEventListener('click', () => openCodeModal('microservices'));

closeCodeModalBtn.addEventListener('click', () => codeModal.classList.add('hidden'));
codeModal.addEventListener('click', (e) => {
  if (e.target === codeModal) codeModal.classList.add('hidden');
});

// -------------------------------------------------------------
// Export Performance Benchmark Report
// -------------------------------------------------------------
btnExportReport.addEventListener('click', () => {
  const rMono = latestTelemetry.monolith;
  const rMod = latestTelemetry.modular;
  const rMicro = latestTelemetry.microservices;
  const cores = devopsCpuSlider ? devopsCpuSlider.value : 1;
  const ram = devopsRamSlider ? devopsRamSlider.value : 2;
  const lb = devopsLbSelect ? devopsLbSelect.value : 'none';
  const broker = devopsBrokerSelect ? devopsBrokerSelect.value : 'none';

  const report = `===============================================================
SCALEMATRIX: BACKEND ARCHITECTURE & DEVOPS BENCHMARK REPORT
Generated on: ${new Date().toUTCString()}
DevOps Hardware Profile: ${cores} vCPUs | ${ram} GB RAM | LB: ${lb} | Broker: ${broker}
===============================================================

1. SINGLE MONOLITH
---------------------------------------------------------------
Throughput:           ${rMono ? `${rMono.throughputRps.toLocaleString()} req/s` : 'Not Executed'}
95% Latency (p95):    ${rMono ? `${rMono.p95LatencyMs} ms` : '--'}
CPU Load:             ${rMono ? `${rMono.cpuUsagePct}%` : '--'}
DB Lock Wait Time:    ${rMono ? `${rMono.dbLockWaitMs} ms` : '--'}
Monthly Cloud Cost:   ${rMono ? `$${rMono.costs.totalMonthlyCost} / mo` : '--'}
Cost per 1M Reqs:     ${rMono ? `$${rMono.costs.costPerMillionReqs} / 1M` : '--'}
Physical Limit:       ~${rMono ? rMono.hardware.maxHardwareCapacity.toLocaleString() : '35,000'} req/s (Hardware ceiling)

2. MODULAR MONOLITH
---------------------------------------------------------------
Throughput:           ${rMod ? `${rMod.throughputRps.toLocaleString()} req/s` : 'Not Executed'}
95% Latency (p95):    ${rMod ? `${rMod.p95LatencyMs} ms` : '--'}
Cluster CPU Load:     ${rMod ? `${rMod.cpuUsagePct}%` : '--'}
Cross-Domain DB Lock: ${rMod ? `${rMod.dbLockWaitMs} ms` : '--'}
Monthly Cloud Cost:   ${rMod ? `$${rMod.costs.totalMonthlyCost} / mo` : '--'}
Cost per 1M Reqs:     ${rMod ? `$${rMod.costs.costPerMillionReqs} / 1M` : '--'}
Physical Limit:       ~${rMod ? rMod.hardware.maxHardwareCapacity.toLocaleString() : '85,000'} req/s (IPC & DB contention)

3. MICROSERVICES (DISTRIBUTED MESH)
---------------------------------------------------------------
Throughput:           ${rMicro ? `${rMicro.throughputRps.toLocaleString()} req/s` : 'Not Executed'}
95% Latency (p95):    ${rMicro ? `${rMicro.p95LatencyMs} ms` : '--'}
Network Hop Tax:      ${rMicro ? `${rMicro.networkHopMs} ms` : '--'}
Overselling Errors:   ${rMicro ? `${rMicro.errors} (Mutex Guaranteed)` : '--'}
Monthly Cloud Cost:   ${rMicro ? `$${rMicro.costs.totalMonthlyCost} / mo` : '--'}
Cost per 1M Reqs:     ${rMicro ? `$${rMicro.costs.costPerMillionReqs} / 1M` : '--'}
Scaling Strategy:     Horizontal Container Pod Autoscaling

===============================================================
RECOMMENDATION SUMMARY:
- Start with a Single Monolith for rapid MVP velocity (1-5 engineers, <20k req/s).
- Transition to Modular Monolith for domain separation & multi-core performance (6-20 engineers).
- Scale to Microservices only when team autonomy and horizontal autoscaling exceed single-server capacity.
===============================================================`;

  exportReportText.value = report;
  exportModal.classList.remove('hidden');
});

closeExportModalBtn.addEventListener('click', () => exportModal.classList.add('hidden'));
exportModal.addEventListener('click', (e) => {
  if (e.target === exportModal) exportModal.classList.add('hidden');
});

btnCopyReport.addEventListener('click', () => {
  navigator.clipboard.writeText(exportReportText.value);
  showToast('Performance benchmark report copied to clipboard!', 'success');
});

// -------------------------------------------------------------
// Viewport-Clamped Floating Tooltip Engine
// -------------------------------------------------------------
function initDynamicTooltips() {
  let tooltipEl = document.getElementById('globalFloatingTooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'globalFloatingTooltip';
    tooltipEl.className = 'global-floating-tooltip';
    document.body.appendChild(tooltipEl);
  }

  function showTooltipFor(target) {
    const text = target.getAttribute('data-tooltip');
    if (!text) return;
    tooltipEl.textContent = text;
    tooltipEl.classList.add('visible');

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const padding = 12;

    let top = targetRect.bottom + 8;
    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = targetRect.top - tooltipRect.height - 8;
    }

    let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    if (left < padding) left = padding;
    else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    tooltipEl.style.top = `${Math.max(padding, top)}px`;
    tooltipEl.style.left = `${Math.max(padding, left)}px`;
  }

  function hideTooltip() {
    tooltipEl.classList.remove('visible');
  }

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) showTooltipFor(target);
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) hideTooltip();
  });

  document.addEventListener('scroll', hideTooltip, { passive: true });
}

initDynamicTooltips();

// -------------------------------------------------------------
// Real-Time WebSocket Connection
// -------------------------------------------------------------
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  try {
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      if (wsStatusLabel) wsStatusLabel.textContent = 'Live Synced';
    };
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'BENCHMARK_COMPLETE') {
        console.log('Real hardware telemetry received:', msg.results);
      }
    };
    ws.onclose = () => {
      if (wsStatusLabel) wsStatusLabel.textContent = 'Offline';
      setTimeout(initWebSocket, 3000);
    };
  } catch (err) {
    console.warn('WebSocket init skipped in local environment', err);
  }
}

initWebSocket();
