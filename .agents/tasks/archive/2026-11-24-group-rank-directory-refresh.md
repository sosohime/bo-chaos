# Task Record: 好物榜目录改版

- State: complete
- Mode: full
- Started: 2026-11-24
- Branch: `codex/group-rank-directory-refresh`
- Request: 从 `codex/group-rank-share` 拉新分支，实现最初建议的第 1 条，展示好物榜动态。

## Acceptance Boundaries

- Functional: 好物榜目录显示有效推荐数、北京时间今日新增和榜首型号。支持空榜、并列和旧接口。维持原有页码、目录顺序和翻页入口。
- Verification: 本地 PostgreSQL 摘要用例、后端测试及构建、群排行小程序类型检查及微信构建、目录本地浏览器预览、`pnpm agent:lint`。
- Docs Sync: 更新群排行 OpenSpec 和目录摘要数据契约。
- Safety: 使用本地数据库和隔离的预览 fixtures。
- Archive: 完成验证后归档。

## Actions

- 远端基线为 `a25c4b3`，工作区已切到新分支。
- 在本群快照中批量读取推荐摘要，目录行显示推荐动态、榜首及并列状态。
- 确认「改动 1」指原建议第 1 条，移除误加的页码线稿、样式和图集。空榜右侧留空。

## Decisions and Assumptions

- 一条推荐指一个群友对一个型号的一票。今日新增计入北京时间当日且仍有效的推荐。
- 旧接口缺少摘要时沿用原来的类型文案。长型号最多显示两行。

## Files Touched

- `apps/backend-nest/src/group-rank/` 推荐摘要、目录接口、数据库集成断言。
- `apps/group-rank-miniapp/src/components/book-card.*`。
- `packages/types/src/api/group-rank.d.ts`、本地预览 fixture、群排行 OpenSpec 和相关 L2 文档。

## Verification Evidence

- 修正范围后重新运行群排行 `typecheck` 和 `build:weapp`，均通过。构建输出包含 CSS 计算和包体警告。
- `pnpm exec vitest run apps/group-rank-miniapp/src scripts/group-rank-ui-preview/entry.test.ts` 通过，326 项。
- `pnpm -C apps/backend-nest test -- --runInBand` 通过，139 项。`pnpm run build:backend` 通过。
- 临时 Docker PostgreSQL 17 加载原有迁移并运行 `group-rank.database.spec.ts`，24 项通过。覆盖空榜、跨群、北京时间当日票数、并列及撤回。测试容器已停止并移除。
- `http://127.0.0.1:5198/?screen=group&case=recommendations` 的 375px 预览已确认原页码与推荐摘要同时显示。此前提交样例推荐并返回目录，推荐数从 5 增至 6。本地服务已停止，微信真机未验收。
- `pnpm agent:lint` 通过。L1 链接提示已核对，本次只改现有 L2 文件内容。

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-11-24-group-rank-directory-refresh.md`
