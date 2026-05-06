import http from 'node:http';
import { randomUUID } from 'node:crypto';

const db = {
  initiatives: new Map(),
  actions: new Map(),
  approvals: new Map(),
  audits: [],
  kpis: {
    baseline: { leadTimeDays: 10, deploysPerWeek: 4, sev1: 0, sev2: 1 },
    current: { leadTimeDays: 7.8, deploysPerWeek: 4.8, sev1: 0, sev2: 1 }
  }
};

const policy = {
  mode: 'HIL', // Suggest-only | HIL | HOL
  initialPhaseNoAutonomousProd: true,
  exceptionRiskThreshold: 0.7
};

function json(res, code, body) {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => (data += c));
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
  });
}

function now() { return new Date().toISOString(); }

function audit(event) {
  db.audits.push({ id: randomUUID(), timestamp: now(), ...event });
}

function validateExplainability(x = {}) {
  const ok = typeof x.rationale === 'string' && Array.isArray(x.sourceContext) &&
    typeof x.confidence === 'number' && x.confidence >= 0 && x.confidence <= 1 &&
    Array.isArray(x.policyReferences);
  return ok;
}

function decompose(text) {
  return {
    epics: [{ title: `Epic: ${text.slice(0, 40)}` }],
    stories: [{ title: 'Story: Implement core workflow' }],
    tasks: [{ title: 'Task: Build API + tests' }],
    acceptanceCriteria: ['Given initiative, when processed, then backlog artifacts are generated']
  };
}

function policyDecisionForAction(action) {
  const productionImpacting = !!action.productionImpacting;
  const risk = Number(action.changeRiskScore ?? 0.5);

  if (policy.mode === 'Suggest-only') {
    return { allowed: false, requiresApproval: false, reason: 'Suggest-only mode', productionImpacting, risk };
  }

  if (productionImpacting && policy.initialPhaseNoAutonomousProd) {
    return { allowed: true, requiresApproval: true, reason: 'Initial phase requires human approval for production-impacting actions', productionImpacting, risk };
  }

  if (policy.mode === 'HIL') {
    return { allowed: true, requiresApproval: true, reason: 'HIL requires approval', productionImpacting, risk };
  }

  // HOL
  if (risk >= policy.exceptionRiskThreshold) {
    return { allowed: true, requiresApproval: true, reason: 'HOL exception threshold exceeded', productionImpacting, risk };
  }
  return { allowed: true, requiresApproval: false, reason: 'HOL notify/exception path', productionImpacting, risk };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/health') {
      return json(res, 200, { ok: true, availabilityTarget: '99.9%' });
    }

    if (req.method === 'POST' && url.pathname === '/initiatives') {
      const body = await parseBody(req);
      const { title, description, actor = 'user', explainability } = body;
      if (!title || !description) return json(res, 400, { error: 'title and description required' });
      if (explainability && !validateExplainability(explainability)) return json(res, 400, { error: 'invalid explainability' });

      const id = randomUUID();
      const decomposition = decompose(description);
      const initiative = { id, title, description, decomposition, syncedToWorkTracker: true, createdAt: now() };
      db.initiatives.set(id, initiative);

      audit({
        who: actor,
        what: 'initiative.created',
        when: now(),
        why: 'Natural language intake and decomposition',
        evidence: [{ type: 'work-tracker-sync', ref: `mock://tracker/${id}` }],
        explainability: explainability || { rationale: 'Rule-based decomposition', sourceContext: [description], confidence: 0.72, policyReferences: ['POL-DECOMP-1'] }
      });

      return json(res, 201, initiative);
    }

    if (req.method === 'POST' && url.pathname === '/actions') {
      const body = await parseBody(req);
      const { type, actor = 'agent', productionImpacting = false, changeRiskScore = 0.5, explainability } = body;
      if (!type) return json(res, 400, { error: 'type required' });
      if (!validateExplainability(explainability || {})) return json(res, 400, { error: 'invalid explainability' });

      const decision = policyDecisionForAction({ productionImpacting, changeRiskScore });
      if (!decision.allowed) {
        return json(res, 403, { error: 'action blocked by policy', decision });
      }

      const id = randomUUID();
      const status = decision.requiresApproval ? 'pending_approval' : 'executed';
      const action = { id, type, actor, productionImpacting, changeRiskScore, status, decision, createdAt: now(), reversible: true };
      db.actions.set(id, action);

      audit({
        who: actor,
        what: `action.${status}`,
        when: now(),
        why: decision.reason,
        evidence: [{ type: 'policy-decision', ref: `action:${id}` }],
        explainability,
        policyDecision: decision
      });

      return json(res, 201, action);
    }

    if (req.method === 'POST' && url.pathname.match(/^\/approvals\/[^/]+\/decision$/)) {
      const actionId = url.pathname.split('/')[2];
      const body = await parseBody(req);
      const { approver, decision, reason = '' } = body;
      const action = db.actions.get(actionId);
      if (!action) return json(res, 404, { error: 'action not found' });
      if (!approver || !['approved', 'rejected'].includes(decision)) return json(res, 400, { error: 'invalid approval payload' });

      const rec = { id: randomUUID(), actionId, approver, decision, reason, at: now() };
      db.approvals.set(rec.id, rec);
      action.status = decision === 'approved' ? 'executed' : 'rejected';

      audit({
        who: approver,
        what: `approval.${decision}`,
        when: now(),
        why: reason || 'manual review',
        evidence: [{ type: 'approval-record', ref: rec.id }]
      });

      return json(res, 200, { action, approval: rec });
    }

    if (req.method === 'POST' && url.pathname === '/release-readiness/evaluate') {
      const body = await parseBody(req);
      const { testPassRate = 0, securityScanStatus = 'fail', changeRiskScore = 1, approvals = 0, minApprovals = 1 } = body;
      const gates = {
        tests: testPassRate >= 0.9,
        security: securityScanStatus === 'pass',
        risk: changeRiskScore <= 0.7,
        approvals: approvals >= minApprovals
      };
      const ready = Object.values(gates).every(Boolean);
      return json(res, 200, { ready, gates });
    }

    if (req.method === 'GET' && url.pathname === '/audit/events') {
      return json(res, 200, { events: db.audits });
    }

    if (req.method === 'POST' && url.pathname.match(/^\/actions\/[^/]+\/revert$/)) {
      const actionId = url.pathname.split('/')[2];
      const action = db.actions.get(actionId);
      if (!action) return json(res, 404, { error: 'action not found' });
      const revertId = randomUUID();
      audit({ who: 'system', what: 'action.reverted', when: now(), why: 'revert requested', evidence: [{ type: 'revert', ref: revertId }] });
      return json(res, 200, { reverted: true, actionId, revertId });
    }

    if (req.method === 'GET' && url.pathname === '/dashboards/metrics') {
      const b = db.kpis.baseline;
      const c = db.kpis.current;
      const leadTimeReduction = ((b.leadTimeDays - c.leadTimeDays) / b.leadTimeDays) * 100;
      const deployFreqIncrease = ((c.deploysPerWeek - b.deploysPerWeek) / b.deploysPerWeek) * 100;
      const sevNotIncreased = c.sev1 <= b.sev1 && c.sev2 <= b.sev2;
      return json(res, 200, {
        sdlcStatus: 'pilot',
        autonomyMode: policy.mode,
        metrics: {
          leadTimeReductionPct: Number(leadTimeReduction.toFixed(1)),
          deploymentFrequencyIncreasePct: Number(deployFreqIncrease.toFixed(1)),
          sevNotIncreased
        }
      });
    }

    if (req.method === 'POST' && url.pathname === '/policy/mode') {
      const body = await parseBody(req);
      if (!['Suggest-only', 'HIL', 'HOL'].includes(body.mode)) return json(res, 400, { error: 'invalid mode' });
      policy.mode = body.mode;
      return json(res, 200, { mode: policy.mode });
    }

    return json(res, 404, { error: 'not found' });
  } catch (e) {
    return json(res, 500, { error: 'internal_error', detail: String(e.message || e) });
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(3000, () => console.log('fde-sdlc-mvp listening on :3000'));
}

export default server;
