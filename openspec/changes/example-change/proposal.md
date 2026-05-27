# Example Change Proposal

## Problem

Describe the user or engineering problem in one or two paragraphs.

## Proposed Behavior

- State the intended behavior.
- Name any API, database, UI, or shared package contracts that change.
- Call out backwards compatibility concerns.

## Affected Areas

- `apps/backend-nest`
- `apps/miniapp-taro`
- `apps/front-next-admin`
- `packages/prisma-client`

## Scenarios

- Given existing data, when the new flow runs, then the expected state is produced.
- Given invalid input, when the API receives it, then it returns a predictable error.

## Verification

```sh
pnpm run verify
```
