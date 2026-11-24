# Task Record: 修改好物榜推荐语

- State: complete
- Mode: full
- Started: 2026-11-24
- Branch: `codex/group-rank-directory-refresh`
- Request: 在「我的推荐」统一提供「修改推荐语」，支持补填历史推荐和修改已有内容。

## Acceptance Boundaries

- Functional: 开放榜单中，本人可以在原推荐上保存 1 至 120 字的已审核推荐语。原推荐时间、票数、额度和今日新增不变，同群推荐人列表显示更新后的文字。
- Verification: 微信构建、前后端回归、隔离 PostgreSQL 验证历史推荐、修改、审核及并发边界，375px 本地预览。
- Docs Sync: 更新 OpenSpec、数据契约和 `pnpm agent:lint`。
- Safety: 测试使用隔离数据库和本地预览数据。
- Archive: 完成后归档。

## Decisions and Assumptions

- 沿用开放榜单的内容修改规则。保存推荐语需要非空内容。
- 内容实际变化时更新榜单活动时间，保留原推荐记录的 `createdAt`。

## Actions

- 空白与已填写条目统一显示「修改推荐语」，在当前型号下编辑。旧记录预置空白，已填写记录预置原文。
- 审核通过后通过新 PATCH 接口更新原推荐中的 `note`，复用既有字段。

## Verification Evidence

- 小程序类型检查、微信构建和 330 项 Vitest 通过。375×667 本地预览验证同一入口补填及二次编辑，额度不变，推荐人列表显示修改后的内容。
- 后端构建、139 项 Jest 和 28 项隔离 PostgreSQL 集成测试通过。数据库测试覆盖原推荐时间和统计保留、同群可见、写入权限、审核拒绝及暂停状态。
- `git diff --check` 和 `pnpm agent:lint` 通过。L1 文档链接提示已核对。

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-11-24-group-rank-edit-recommendation-note.md`
