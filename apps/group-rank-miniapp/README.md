# 博哥的小本儿

每个微信群有自己的小本儿。直接打开小程序会看到大厅，可以选模板或设计一张榜。把卡片发到想用的群，再从群里点开。首次使用的群会看到开本引导。

## 在群里怎么用

- **翻小本儿。** 目录按最近活动排列，点榜名打开。左右翻榜，上下看排名，点页码回目录。回到目录时会刷新排序和页码。
- **记成绩。** 可以选跑步里程、引体向上或游戏高分模板，也可以自定义榜名、单位、取值方式和排序方向。「每人一笔」允许修改原记录。多笔榜按规则计算最近一次、最高值或累计值。
- **帮群友记。** 创建者可以先用名字登记。待认领成绩会标记「代填」。同群群友点「这是我」并确认后直接认领，保留原成绩和记录时间。
- **推荐好物。** 每人每榜可同时推荐五个型号，可填写最多 120 字的使用感受，也可在开放榜单上补填或修改。撤回一款会腾出名额。推荐人和使用感受仅在对应群的榜单里查看。
- **装扮和分享。** 创建者可调整榜单配色和背景取景。从本群榜单卡片可以直达该榜。本人主动分享的名次或成绩会显示在卡片快照上。个人成绩卡转到其他群时，打开会提示回原群。

## 开发与验证

在仓库根目录执行：

```bash
pnpm install --frozen-lockfile
pnpm -C apps/group-rank-miniapp typecheck
pnpm exec vitest run apps/group-rank-miniapp/src scripts/group-rank-ui-preview/entry.test.ts
pnpm -C apps/backend-nest test -- --runInBand
python3 scripts/test-group-rank-database.py
```

数据库测试需要本地 PostgreSQL 工具，脚本会创建并清理独立临时数据库。安装依赖时会生成 Prisma Client。

**浏览器预览。** 执行以下命令后，打开 [榜单示例](http://127.0.0.1:5198/?screen=board&case=decimal)。预览使用实际页面组件和合成数据。群来源、微信登录和群卡片需要在真机上验证。

```bash
pnpm exec vite --config scripts/group-rank-ui-preview/vite.config.mjs --host 127.0.0.1 --port 5198
```

**微信开发版。** 指定 HTTPS API 根路径构建，将本目录导入微信开发者工具，编译目录为 `dist/`，AppID 为 `wxe185bc2feabae6a8`。真机预览使用开发者工具生成的二维码。

```bash
GROUP_RANK_API_BASE_URL=https://yuanbo.online/group-rank pnpm -C apps/group-rank-miniapp build:weapp
```

## 服务和数据

- API 由 NestJS 独立入口启动，默认监听本机 3010。准备好独立服务端配置后，执行 `pnpm run build:backend` 和 `pnpm -C apps/backend-nest start:group-rank`。
- `GROUP_RANK_API_BASE_URL` 在构建时注入，包含 `/group-rank` 路径。AppSecret、数据库凭据和签名密钥存放在服务端私有配置。
- 群来源由服务端通过微信核验，榜单和成员数据按群隔离。小本儿使用独立 PostgreSQL 库，迁移仅执行 GroupRank 增量 SQL。操作顺序见[独立服务部署说明](../../deploy/group-rank/README.md)。
- 头像昵称由用户主动提供，用于群内榜单展示。录入与个人关联的健康数据时，需要按实际用途告知，并取得本人单独同意。现有录入界面尚未提供单独的健康信息授权流程。

截至 2026-11-24，微信开发版为 **1.0.6**。对应后端已部署群目录排序、好物推荐语和两项数据库迁移。当前开发版已编译并上传，真机交互仍待核对。

[产品规格](../../openspec/specs/group-ranking/spec.md) · [界面与设计记录](DESIGN.md) · [服务健康检查](https://yuanbo.online/group-rank/health)
