# Per-person record mode

User2026-11-17 requests single/multiple, permits editing original, no quota feature. `entryMode: single|multiple` is an immutable rule in draft definition and board template snapshot. Missing means multiple for existing/official boards. Identity and scoring aggregation remain separate.

- Create: 记录方式 buttons 每人一笔 / 允许多笔. Single hides irrelevant multi-record aggregation and uses latest; existing ranking direction/period remain. Switching back to multiple restores the previous aggregation choice. No numeric quotas/counters added.
- Single allows one nondeleted record in the board ranking period, with original edit/revision semantics. Monthly ranking continues using existing China-time month boundaries; no independent allowance system.
- The client verifies the saved draft confirms single mode before activating or offering it for sharing.
- Own submit serializes on existing board lock, checks request replay before count. Single conflicts with a different active entry. UI loads original into edit flow.
- Proxy uses same participant/period restriction under board lock. New registered names remain distinct; no name-based identity guesses. Claim rejects transfer when it would combine two active records for the same person, atomically without changing identities/records.
- Multiple retains latest/max/sum and current append behavior. Rules are not retroactively changed on existing boards. No schema migration needed; no production release in implementation scope.

Verification: narrow backend contract tests, temporary-PG races/claim transfer/edit/delete/retry, client entry routing and create rules; native current package evidence does not validate the new source until rebuilt/previewed.

2026-11-18 local validation: 296 client tests, 137 backend tests and 22 disposable PostgreSQL tests passed. The database test creates the draft and activates it through the same services as the app before exercising concurrent submissions and claims. Both builds, typecheck and official wcc passed. Candidate bff21e5f… awaits a paired backend and preview deployment.

2026-11-18 update: New custom forms order aggregate choices as max, latest, sum and select max. Official templates still prefill their explicit aggregate. The default multiple mode is represented by omitting entryMode from the draft request. Choosing single sends the explicit rule and requires a matching response before activation.
