import test from 'node:test';
import assert from 'node:assert/strict';
import server from '../src/server.js';

let base;

test.before(async () => {
  await new Promise(resolve => server.listen(0, resolve));
  const { port } = server.address();
  base = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise(resolve => server.close(resolve));
});

const explainability = {
  rationale: 'Based on repo and ticket context',
  sourceContext: ['ticket-123', 'repo:abc'],
  confidence: 0.81,
  policyReferences: ['POL-1']
};

test('initiative intake returns decomposition and sync flag', async () => {
  const r = await fetch(`${base}/initiatives`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Improve CI', description: 'Need better tests', explainability })
  });
  assert.equal(r.status, 201);
  const j = await r.json();
  assert.equal(j.syncedToWorkTracker, true);
  assert.ok(j.decomposition.epics.length > 0);
});

test('HIL requires approval for production-impacting action', async () => {
  const r = await fetch(`${base}/actions`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'create_pr', productionImpacting: true, changeRiskScore: 0.2, explainability })
  });
  assert.equal(r.status, 201);
  const j = await r.json();
  assert.equal(j.status, 'pending_approval');
});

test('approval executes pending action', async () => {
  const create = await fetch(`${base}/actions`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'update_branch', productionImpacting: false, changeRiskScore: 0.2, explainability })
  });
  const action = await create.json();
  const approve = await fetch(`${base}/approvals/${action.id}/decision`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ approver: 'lead@company.com', decision: 'approved', reason: 'looks good' })
  });
  assert.equal(approve.status, 200);
  const j = await approve.json();
  assert.equal(j.action.status, 'executed');
});

test('release readiness evaluates quality gates', async () => {
  const r = await fetch(`${base}/release-readiness/evaluate`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ testPassRate: 0.95, securityScanStatus: 'pass', changeRiskScore: 0.4, approvals: 2, minApprovals: 1 })
  });
  const j = await r.json();
  assert.equal(j.ready, true);
});

test('audit events and revert endpoint exist', async () => {
  const create = await fetch(`${base}/actions`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'draft_pr', productionImpacting: false, changeRiskScore: 0.1, explainability })
  });
  const action = await create.json();
  const rev = await fetch(`${base}/actions/${action.id}/revert`, { method: 'POST' });
  assert.equal(rev.status, 200);

  const audit = await fetch(`${base}/audit/events`);
  const aj = await audit.json();
  assert.ok(Array.isArray(aj.events));
  assert.ok(aj.events.length > 0);
});
