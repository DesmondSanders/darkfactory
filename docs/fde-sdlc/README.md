# Agent-First FDE SDLC Orchestration (HIL → HOL)

This package defines an implementation-ready blueprint for an enterprise control plane that orchestrates end-to-end SDLC workflows with AI agents as the primary interaction model.

## Scope
- Natural-language initiative intake and decomposition into epics/stories/tasks/acceptance criteria.
- Policy-governed agent actions across work tracking, source control, CI/CD, testing, ITSM, collaboration, and observability.
- Progressive autonomy modes:
  - Suggest-only
  - Act-with-approval (HIL)
  - Act-with-notify/exception (HOL)
- Full auditability, explainability, and reversible action history.
- Role-based dashboards for delivery, risk, and autonomy adoption.

## Included artifacts
- `docs/fde-sdlc/spec.md` — acceptance-criteria-driven product/engineering spec.
- `docs/fde-sdlc/architecture.md` — reference architecture and runtime flow.
- `docs/fde-sdlc/api-contracts.yaml` — OpenAPI-style contracts for core control plane APIs.
- `docs/fde-sdlc/domain-model.md` — entities, relationships, and state transitions.
- `docs/fde-sdlc/integrations.md` — adapter contracts for required enterprise tools.
- `docs/fde-sdlc/roadmap.md` — 12–16 week MVP plan + pilot rollout.
- `docs/fde-sdlc/kpis.md` — 90-day pilot KPI framework and measurement method.
- `docs/fde-sdlc/security-compliance.md` — SOC2-ready controls and governance guardrails.

## Delivery intent preserved
- Pilot-first rollout (single product team).
- Mandatory human approval for production-impacting actions in initial phase.
- No direct autonomous production changes until policy/reliability thresholds are met.
- Integrate with existing SDLC tools (do not replace in MVP).

