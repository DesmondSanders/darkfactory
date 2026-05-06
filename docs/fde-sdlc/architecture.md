# Reference Architecture

## Core Components
1. **Control Plane API**
   - Initiative intake, action requests, approvals, policy evaluation, dashboards.
2. **Agent Orchestrator**
   - Plans workflows, invokes specialized agents, handles retries/timeouts.
3. **Policy Engine**
   - Evaluates autonomy mode, environment restrictions, risk thresholds, SoD.
4. **Approval Service**
   - Human approval workflows via UI + Slack/Teams.
5. **Execution Gateway**
   - Performs side-effecting actions through tool adapters.
6. **Integration Adapters**
   - Jira/ADO, GitHub/GitLab, CI, Test Mgmt, ServiceNow, Collaboration, Observability.
7. **Audit & Evidence Store**
   - Immutable action logs, evidence links, export APIs.
8. **Metrics & Dashboard Service**
   - SDLC KPIs, risk, bottlenecks, autonomy adoption.
9. **Identity & Access Layer**
   - SAML/OIDC SSO, RBAC, tenant isolation.
10. **Model Abstraction Layer**
   - Provider-agnostic LLM runtime with fallback routing.

## Runtime Flow (HIL example)
1. User submits initiative.
2. Orchestrator decomposes into backlog artifacts with explainability metadata.
3. Policy engine classifies requested action risk/scope.
4. If production-impacting + HIL => approval required.
5. Approval granted via UI/Slack/Teams.
6. Execution gateway calls adapters (e.g., create branch + draft PR).
7. Audit service records full event + evidence.
8. Dashboard updates status and KPI counters.

## Reliability & Degradation
- Queue-backed async jobs for long-running tasks.
- Circuit breakers per adapter/provider.
- If model provider unavailable: fallback provider or suggest-only degraded mode.

## Data Stores
- Relational DB: entities/state.
- Immutable log store: append-only audit events.
- Object store: evidence artifacts.
- Cache: policy and dashboard read optimization.
