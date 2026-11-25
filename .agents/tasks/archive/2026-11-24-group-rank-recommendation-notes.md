# Task Record: 好物榜逐款确认与使用感受

- State: complete
- Mode: full
- Started: 2026-11-24
- Branch: `codex/group-rank-directory-refresh`
- Request: 推荐弹层拆分选择和管理标签，逐款确认，可选填使用感受，推荐人列表按人展示感受。

## Acceptance Boundaries

- Functional: 已有或新输入的型号都先展开单款确认。已投型号在选择标签呈现状态，管理标签可撤回，确认成功更新额度。感受经过审核后随推荐写入，仅在本群的推荐人列表展示。
- Verification: 群排行小程序类型检查、交互测试、微信构建、隔离本地浏览器预览、后端测试和构建、隔离 PostgreSQL 集成测试及 `pnpm agent:lint`。
- Docs Sync: 更新群排行 OpenSpec、数据契约和部署迁移说明。
- Safety: 使用本地迁移和隔离样例，保留工作区既有目录改动。
- Archive: 验证后归档。

## Decisions and Assumptions

- 感受最多 120 字。确认成功后留在选择标签，可继续逐款推荐。撤回时一并移除该感受。

## Actions

- 将已有型号和新增型号接入同一套单款确认组件，个人记录只在管理标签提供撤回。
- 给推荐记录添加可空的 `note` 字段。沿用本群身份和现有文字审核，详情按推荐人返回已填内容。
- 沿用头像昵称检查，保留审核失败或关闭资料弹层后的感受草稿。

## Verification Evidence

- 群排行 `typecheck`、`build:weapp` 和 329 项 Vitest 通过。构建输出包含包体和 CSS 警告。
- `pnpm -C packages/prisma-client build`、`pnpm run build:backend` 和 139 项后端 Jest 测试通过。
- 临时 Docker PostgreSQL 17 应用 8 条群排行迁移后，25 项数据库集成测试通过。覆盖审核拒绝、旧推荐、重复提交、跨群读取和撤回。
- `http://127.0.0.1:5198/?screen=group&case=recommendations&keyboard=260` 的 375px 预览验证了模拟键盘中输入、确认前额度、成功后状态、昵称下展示、取消和撤回。本地服务已停止，微信真机待验。
- `git diff --check` 和 `pnpm agent:lint` 通过。L1 链接提醒已核对，相关 L2 路径没有变化。

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-11-24-group-rank-recommendation-notes.md`
- 上线顺序见 `deploy/group-rank/README.md`，先对独立群排行库应用新增迁移，再更新后端。
