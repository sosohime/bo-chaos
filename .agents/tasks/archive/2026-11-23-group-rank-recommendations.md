# Task Record: 群内好物推荐榜

- State: complete
- Mode: full
- Started: 2026-11-23
- Branch: codex/group-rank-share
- Request: 群目录可创建推荐榜，按型号推荐人数排名，可撤回并查看推荐人。

## Acceptance Boundaries

- Functional: 每人每榜最多五个型号，一人一型号计一次，可撤回自己的推荐。
- Verification: 本地预览、后端用例、WeChat 构建。
- Docs Sync: 更新推荐榜规则与数据模型。
- Safety: 保持所有验证在本地。

## Decisions and Assumptions

- 复用群内身份、群目录、榜单翻页、分享和资料能力。
- 同票并列。型号折叠大小写、全半角和空格差异，保留型号版本后缀。

## Actions

- 在群目录新建页加入玩法选择。复用翻页、个人资料、群分享和榜单管理。
- 新增型号及推荐关系表。审核新文本并通过群榜单行锁约束并发写入。
- 在本地预览加入鼠标榜示例和可操作的会话数据。

## Verification Evidence

- Chromium 390px 预览：群目录创建、简介、已有型号搜索、同型号识别、五个名额、撤回补荐、推荐人数排序、头像与昵称列表均通过。
- 临时 PostgreSQL 17：应用七项群排行迁移，23 个数据库集成测试通过，覆盖并发限制、重复推荐、撤回、并列排名、跨群限制、暂停和移除清理。
- 小程序类型检查、330 项客户端和预览测试、后端构建及 HTTP 路由测试通过。微信小程序构建产出 `dist`，保留 Webpack 样式顺序、CSS 计算和体积警告。
- 本地预览使用示例数据。微信真机待验收。

## Handoff / Archive Notes

- Final state: complete
- Archive path: `.agents/tasks/archive/2026-11-23-group-rank-recommendations.md`

## 后续调整

- 推荐弹窗默认显示全部已有型号，搜索结果显示全部匹配项。
- 本地 Chromium 用 12 个已有型号验证默认全部展示。搜索命中 10 个时全部展示，清空恢复全量，可直接点击第 10 个测试型号提交。
- 小程序类型检查、WeChat 构建和 `git diff --check` 通过。`pnpm agent:lint` 仅提示核对目录。此次热更新的规格沿用 AGENTS.md 已记载的 OpenSpec 入口。

## Review 修复

- 浏览器预览按推荐榜 ID 保存暂停和恢复状态。已移除的示例榜和新建榜从目录消失，浏览器刷新后仍保持移除。
- 「我的推荐」及名额满时的「管理推荐」优先展示自己的型号和撤回操作。「推荐型号」仍优先展示搜索和完整候选。
- 390px 浏览器预览覆盖 12 个型号、首屏撤回、暂停时撤回、暂停与恢复状态刷新、移除示例榜与新建榜、移除后的旧入口。
