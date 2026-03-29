const crypto = require('crypto');

const isProd = process.env.NODE_ENV === 'production';
const MAX_TOTAL_SAMPLES = 2000;
const MAX_ROUTE_SAMPLES = 500;
const LOG_SLOW_MS = Number(process.env.LOG_SLOW_MS || 0);

const metrics = {
  startedAt: Date.now(),
  totalRequests: 0,
  totalErrors: 0,
  statusCounts: {},
  totalDurations: [],
  routeStats: {}
};

const clampSamples = (arr, max) => {
  if (arr.length > max) {
    arr.splice(0, arr.length - max);
  }
};

const getRouteKey = (req) => {
  const base = req.baseUrl || '';
  const routePath = req.route && req.route.path ? req.route.path : req.path;
  return `${req.method} ${base}${routePath}`;
};

const recordStatus = (status) => {
  const key = String(status);
  metrics.statusCounts[key] = (metrics.statusCounts[key] || 0) + 1;
};

const recordRoute = (key, durationMs, statusCode) => {
  if (!metrics.routeStats[key]) {
    metrics.routeStats[key] = {
      count: 0,
      errorCount: 0,
      totalMs: 0,
      minMs: durationMs,
      maxMs: durationMs,
      durations: []
    };
  }

  const stats = metrics.routeStats[key];
  stats.count += 1;
  stats.totalMs += durationMs;
  stats.minMs = Math.min(stats.minMs, durationMs);
  stats.maxMs = Math.max(stats.maxMs, durationMs);
  stats.durations.push(durationMs);
  clampSamples(stats.durations, MAX_ROUTE_SAMPLES);

  if (statusCode >= 500) {
    stats.errorCount += 1;
  }
};

const percentile = (values, p) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
};

const computeRouteSnapshot = (stats) => {
  const avgMs = stats.count ? stats.totalMs / stats.count : 0;
  const p50 = percentile(stats.durations, 50);
  const p95 = percentile(stats.durations, 95);
  return {
    count: stats.count,
    errorCount: stats.errorCount,
    avgMs: Number(avgMs.toFixed(2)),
    minMs: Number(stats.minMs.toFixed(2)),
    maxMs: Number(stats.maxMs.toFixed(2)),
    p50Ms: Number(p50.toFixed(2)),
    p95Ms: Number(p95.toFixed(2))
  };
};

const getMetricsSnapshot = () => {
  const uptimeMs = Date.now() - metrics.startedAt;
  const totalAvgMs = metrics.totalRequests
    ? metrics.totalDurations.reduce((a, b) => a + b, 0) / metrics.totalRequests
    : 0;
  const totalP50 = percentile(metrics.totalDurations, 50);
  const totalP95 = percentile(metrics.totalDurations, 95);

  const routes = {};
  Object.keys(metrics.routeStats).forEach((key) => {
    routes[key] = computeRouteSnapshot(metrics.routeStats[key]);
  });

  return {
    uptimeMs,
    totalRequests: metrics.totalRequests,
    totalErrors: metrics.totalErrors,
    statusCounts: metrics.statusCounts,
    totalAvgMs: Number(totalAvgMs.toFixed(2)),
    totalP50Ms: Number(totalP50.toFixed(2)),
    totalP95Ms: Number(totalP95.toFixed(2)),
    routes
  };
};

const resetMetrics = () => {
  metrics.startedAt = Date.now();
  metrics.totalRequests = 0;
  metrics.totalErrors = 0;
  metrics.statusCounts = {};
  metrics.totalDurations = [];
  metrics.routeStats = {};
};

const metricsMiddleware = (req, res, next) => {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startNs = process.hrtime.bigint();

  res.on('finish', () => {
    const endNs = process.hrtime.bigint();
    const durationMs = Number(endNs - startNs) / 1e6;
    const statusCode = res.statusCode;
    const routeKey = getRouteKey(req);

    metrics.totalRequests += 1;
    if (statusCode >= 500) metrics.totalErrors += 1;
    recordStatus(statusCode);

    metrics.totalDurations.push(durationMs);
    clampSamples(metrics.totalDurations, MAX_TOTAL_SAMPLES);
    recordRoute(routeKey, durationMs, statusCode);

    if (LOG_SLOW_MS && durationMs >= LOG_SLOW_MS) {
      console.log(JSON.stringify({
        level: 'warn',
        type: 'slow_request',
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode,
        durationMs: Number(durationMs.toFixed(2))
      }));
    }

    console.log(JSON.stringify({
      level: 'info',
      type: 'request',
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      userId: req.user && req.user.userId ? req.user.userId : undefined
    }));
  });

  next();
};

const authorizeMetrics = (req, res) => {
  if (!isProd) return true;
  const secret = process.env.METRICS_SECRET;
  if (!secret) {
    res.status(503).json({ error: 'Metrics disabled in production' });
    return false;
  }
  const provided = req.headers['x-admin-secret'];
  if (!provided || provided !== secret) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
};

const metricsHandler = (req, res) => {
  if (!authorizeMetrics(req, res)) return;
  res.json(getMetricsSnapshot());
};

const metricsResetHandler = (req, res) => {
  if (!authorizeMetrics(req, res)) return;
  resetMetrics();
  res.json({ ok: true });
};

module.exports = {
  metricsMiddleware,
  metricsHandler,
  metricsResetHandler
};
