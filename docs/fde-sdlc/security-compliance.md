# Security, Compliance, and Governance

## Security Controls
- TLS in transit, encryption at rest.
- Secrets vault integration.
- Tenant isolation boundaries.
- RBAC with least privilege.

## Compliance Controls (SOC2-ready)
- Immutable audit logs.
- Retention and legal hold policies.
- Evidence export for audits.
- Change management traceability.

## Governance Guardrails
- Environment-based action restrictions.
- Separation of duties for approvals.
- Mandatory HIL for production-impacting actions initially.
- No autonomous production changes until reliability/policy thresholds are met.

## Reliability/SRE
- 99.9% availability target.
- Graceful degradation on model outage.
- SLOs for API latency and async completion.
- Alerting for adapter failures and policy bypass attempts.
