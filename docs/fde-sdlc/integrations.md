# Integration Adapters

## Required Adapters
- Work Mgmt: Jira / Azure DevOps
- SCM: GitHub / GitLab
- CI/CD: GitHub Actions / GitLab CI / Jenkins
- Test Mgmt: TestRail / Zephyr (optional in MVP)
- ITSM: ServiceNow
- Collaboration: Slack / Microsoft Teams
- Identity: SAML/OIDC (Okta/Azure AD)
- Observability: Datadog / New Relic / CloudWatch

## Adapter Contract (common)
- `validateConnection()`
- `execute(action)`
- `dryRun(action)`
- `getEvidence(actionId)`
- `revert(actionId)` (where supported)
- `health()`

## Security Requirements
- OAuth/app tokens in vault.
- Least-privilege scopes.
- Per-tenant connector isolation.

## Failure Handling
- Retry with backoff for transient failures.
- Dead-letter queue for unrecoverable failures.
- Emit audit event on every failure path.
