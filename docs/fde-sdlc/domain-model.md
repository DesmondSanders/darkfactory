# Domain Model

## Entities
- Initiative
- DecompositionArtifact (Epic, Story, Task, AcceptanceCriterion)
- AgentAction
- PolicyDecision
- ApprovalRequest
- ExecutionResult
- AuditEvent
- EvidenceLink
- ReleaseGateEvaluation
- DashboardMetric
- ConnectorConfig
- AutonomyPolicy

## Key Relationships
- Initiative 1..* DecompositionArtifact
- AgentAction 1..1 PolicyDecision
- AgentAction 0..1 ApprovalRequest
- AgentAction 1..* AuditEvent
- AgentAction 0..* EvidenceLink
- ReleaseGateEvaluation aggregates CI/Test/Security/Risk/Approval signals

## State Machines

### AgentAction
`requested -> policy_evaluated -> (awaiting_approval | executing | blocked) -> (completed | failed | reverted)`

### ApprovalRequest
`pending -> (approved | rejected | expired)`

### ReleaseGateEvaluation
`collecting_signals -> evaluated -> (passed | failed)`

## Explainability Payload (required)
- rationale
- sourceContext[]
- confidence
- policyReferences[]
