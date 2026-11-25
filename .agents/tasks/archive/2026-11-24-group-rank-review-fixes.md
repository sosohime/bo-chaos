# Task Record: 群排行审查修复

- State: complete
- Mode: full
- Started: 2026-11-24
- Branch: `codex/group-rank-directory-refresh`
- Request: 修复更新时间迁移和推荐确认弹层的两项审查问题。

## Acceptance Boundaries

- Functional: 更新时间迁移的列、回填、约束和索引在一个事务内生效。旧版服务在回填与切换期间暂停写入。首次从搜索选型号时收起键盘，显示完整确认表单。
- Verification: 隔离 PostgreSQL 验证迁移、并发写入和回滚；小程序交互回归、微信构建和 375×667 本地预览。
- Docs Sync: 更新独立群排行库切换步骤，运行 `pnpm agent:lint`。
- Safety: 数据库复测和页面交互使用隔离样例。
- Archive: 验证后归档。

## Actions

- 更新时间增量迁移显式使用 `BEGIN` 和 `COMMIT`。部署说明要求停止并排空旧后端写入，迁移及后端切换后恢复。
- 首次选择型号、切换型号或取消草稿时收起键盘，输入感受时继续保留焦点。

## Verification Evidence

- 隔离 PostgreSQL 17 注入迁移故障，确认列、回填和索引整段回滚。控制回填与约束之间的时序，确认旧写入被阻塞，提交后插入使用默认值，旧活动时间正确回填。
- 小程序 `typecheck`、`build:weapp` 和 153 项目录及详情交互测试通过。构建输出包含既有 CSS 和包体警告。
- 375×667 本地预览和 300px 模拟键盘复测了输入型号、首次选择、键盘收起、确认按钮完整可见和填写感受后提交。预览服务已停止，微信真机待验收。
- `git diff --check` 和 `pnpm agent:lint` 通过，L1 链接提示已核对。

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-11-24-group-rank-review-fixes.md`
