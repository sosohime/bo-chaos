# 群排行：独立小程序与群内直达

- 日期：2026-10-26
- 用户确认：独立小程序，同仓库复用技术；从群内打开直接参与，不做申请审批。
- 当前状态：独立前端、后端业务与增量数据模型已实现；测试 API/专用数据库已部署在 yuanbo.online 并通过公网冒烟和备份恢复检查；目标 AppID `wx27c85260fc7a7163`、凭据和合法域名已接入，开发者工具请求与真实登录交换通过；真实群/真机验收待完成，未发布小程序。
- 当前契约：[群内直达规格](../../specs/group-ranking/spec.md)
- 需求来源：[原始 PRD v0.1](./prd-v0.1-source.md)，后续对群入口的用户决定优先。

## Problem

用户希望群友打开卡片即可看到自己群的排行、填写成绩。空间之间必须隔离，卡片转发不能把原群成绩带到另一个群。额外的申请和审批会阻断这个主路径，首版不采用。

## Proposed Behavior

1. 小程序使用 Taro/React/TypeScript；后端沿用 NestJS、Prisma/PostgreSQL，新业务使用独立身份、路由及环境配置。现有 BoFans 不切换账号、页面或认证规则。
2. 客户端临时登录凭证和当前群加密来源交由服务端验证；服务端自动创建/复用空间与参与身份，再签发绑定本群的短期凭证。客户端自报群 ID 不产生授权。
3. 成员直接建榜/填成绩，创建者可暂停/恢复提交。榜单详情、排名、历史和所有写操作检查群归属；用户只能修改/删除自己的成绩。
4. 分享路径只指向首页。A 群卡片转发至 B 群，必须基于 B 群入口进入 B 空间；无法获得可信来源时引导从群聊卡片打开，不使用审批降级。
5. 首版提供跑步里程、引体向上、游戏高分三个官方模板，固定版本快照，支持 Max/Sum、北京时间本月/全部时间、精确小数和并列排名。保留成绩历史与修改删除。
6. 自定义多字段、其余聚合、模板投稿及平台审核在后续实现；2026-11-03按用户要求，自定义名称与单位不再设健康主题关键词限制。没有预先引入 Redis、表达式执行、文件上传或新付费服务。

## Affected Areas

- `apps/group-rank-miniapp`：本群首页、榜单与自己的历史、HTTPS 类型化请求与内存群会话；临时技术验证页保留供 P0 检查，正式发布前移除。
- `apps/backend-nest/src/group-rank/`：独立群会话、自动空间与参与身份、官方模板、成绩与排名。`AppModule` 注册该模块，不修改旧产品认证。
- `packages/prisma-client`：五个 `GroupRank*` 模型、增量迁移源码；没有执行数据库迁移。
- `packages/types`：独立 API DTO。管理台尚未扩展。

## Scenarios

- A 群凭证查询/更改 B 群榜单：拒绝，不泄露 B 群数据。
- 微信群来源缺失、篡改、过期或 AppID 不符：在自动创建空间之前拒绝。
- 同分 100、90、90、80：名次为 1、2、2、4；修改或删除后重新聚合。
- 重试相同提交：保留最初数值；已删除成绩的旧请求不能复活数据。
- 前后台切换后旧群请求晚返回：丢弃旧结果，不覆盖当前群。

## Verification

```sh
pnpm -C packages/prisma-client build
pnpm -C apps/backend-nest test -- --runInBand
python3 scripts/test-group-rank-database.py
pnpm run build:backend
pnpm run build:packages
pnpm exec vitest run apps/group-rank-miniapp/src/lib/api.test.ts
pnpm -C apps/group-rank-miniapp typecheck
pnpm -C apps/group-rank-miniapp build:weapp
pnpm agent:lint
```

普通测试使用微信/数据库桩；隔离 PostgreSQL 集成测试已验证真实迁移、并发首次入群/建榜/提交、写入、精确聚合、行锁与约束。用户授权后，专用测试数据库、独立进程及 HTTPS 路由已部署并验证，旧业务库/进程未替换。目标 AppID 配置、域名请求与微信登录交换已验证，真实群能力与真机交互仍待验收；没有提审、小程序发布或真实用户数据导入。

2026-10-30 接入更新：现用 AppID `wxe185bc2feabae6a8`。群接口真实载荷不保证 watermark/chat_type，按当前规格兼容；12:16 真实群 code 交换与本群读取返回 201/200，用户确认进入本群榜单。其他真机验收仍待完成。

## 2026-10-30 当前实施更新

自定义短规则、私有头像昵称、参与前资料必填、创建者按名字代填和群友申请/创建者确认认领已纳入实施，详见 custom-ranking-profile.md。2026-11-03移除个人主体健康主题关键词限制，沿用内容审核；群成员准入仍无审批，认领确认只处理已有记录归属。
