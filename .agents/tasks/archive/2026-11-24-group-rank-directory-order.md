# Task Record: 榜单目录按更新时间倒序

- State: complete
- Mode: full
- Started: 2026-11-24
- Branch: `codex/group-rank-directory-refresh`
- Request: 将群榜单目录改为按更新时间倒序。

## Acceptance Boundaries

- Functional: 服务端目录优先显示最近更新的榜单。使用已有活动回填旧榜单；本人及代填成绩、推荐、外观和状态的实际变更更新榜单时间；读操作和重复提交不更新时间。
- Verification: Prisma 生成、后端测试和构建、隔离 PostgreSQL 迁移与集成测试、群排行前端类型与翻页回归、`pnpm agent:lint`。
- Docs Sync: 更新群排行 OpenSpec、数据契约与独立库迁移说明。
- Safety: 只测试隔离库，保留现有未提交的目录和推荐改动。
- Archive: 验证后归档。

## Decisions and Assumptions

- 新建榜单以创建为首次更新。更新同一时刻时优先较新的创建时间，其次按 ID 倒序。
- 目录重新读取时更新排序和页码。已打开的详情沿用进入时的目录顺序。

## Actions

- 新增 `GroupRankBoard.updatedAt`、目录排序索引和历史活动回填。空榜以创建时间为准。
- 将更新时间与各类榜单写入放进同一个事务。重复请求、空撤回、等值的状态或外观设置及举报不更新时间。
- 在现有小程序回归中验证从详情返回后，服务端的新顺序同时更新榜名与页码。

## Verification Evidence

- Prisma 生成、后端构建、139 项后端普通测试通过。
- 隔离 PostgreSQL 17 应用 9 条群排行迁移。迁移前写入成绩、代填、推荐和空榜样例，迁移后验证各自的回填时间和顺序。27 项数据库集成测试通过，临时容器已清理。
- 群排行小程序 `typecheck` 和 `journey.test.tsx` 的 26 项测试通过。
- `git diff --check` 和 `pnpm agent:lint` 通过。已核对 L1 文档链接提醒。

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-11-24-group-rank-directory-order.md`
- 升级后端之前对独立群排行库应用 `20261124010000_group_rank_board_updated_at`。部署未执行。
