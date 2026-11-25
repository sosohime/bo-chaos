# 博哥的小本儿部署说明

## 运行环境

| 项目            | 位置                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------- |
| 主机            | `bo-chaos-101`                                                                            |
| 公网 API        | `https://yuanbo.online/group-rank`，见[健康检查](https://yuanbo.online/group-rank/health) |
| PM2 进程        | `group-rank-test`，监听 `127.0.0.1:3010`                                                  |
| NestJS 入口     | `apps/backend-nest/dist/group-rank/main.js`                                               |
| 工作目录        | `/usr/soso/group-rank`                                                                    |
| 私有运行配置    | `shared/runtime.env`，权限 600                                                            |
| 独立 PostgreSQL | `group_rank_test`，专用角色 `group_rank_app`                                              |
| 流量入口        | Nginx 代理 `/group-rank/`，微信 request 合法域名为 `https://yuanbo.online`                |

小程序 AppID 为 `wxe185bc2feabae6a8`。AppSecret、签名密钥和数据库凭据均由服务端私有配置提供。健康接口的 `wechat: configured` 仅表示配置齐全，微信登录和群入口需要真机验证。

## 构建和切换

1. 在隔离目录使用冻结锁文件构建 NestJS。运行包使用 Linux 生产依赖和与部署版本匹配的 Prisma Client。
2. 把候选保存到独立的 `releases/<版本>` 目录。记录源码提交和运行文件摘要。确认 `current`、当前 PM2 脚本路径、数据库和回滚基线。
3. 如有数据库迁移，先备份独立库，在临时库恢复并演练迁移。独立库只按顺序执行 [GroupRank 增量 SQL](../../packages/prisma-client/prisma/migrations/)。BoFans 迁移有单独的运行目标。
4. 在独立端口验收候选的健康、模板和权限检查。按迁移要求暂停旧进程写入，再切换 `group-rank-test`。以目标版本目录设置 `GROUP_RANK_RELEASE_ROOT`，使用 [PM2 配置](ecosystem.config.cjs) 重新启动该进程。
5. 核对 `pm_exec_path` 和公网响应。健康及模板应返回 200，未登录读取 `/current-group` 应返回 401。通过后原子更新 `current`，执行 `pm2 save`，核对其他应用进程与站点。

小程序编译和真机预览步骤见[小程序 README](../../apps/group-rank-miniapp/README.md)。

## 回滚

用保留的上一版本目录启动 `group-rank-test`，核对健康和实际入口，再原子恢复 `current` 并执行 `pm2 save`。代码回滚保留新增字段、图片和已有记录。数据库恢复是独立操作，需要另行确认。

## 最近一次部署验证

2026-11-24 部署了 `20261124-directory-aeb3363b98cc`。当前回滚基线为 `20261123-recommendations-85cf9f50a66e`。

先在独立库应用 `20261124000000_group_rank_recommendation_note`，为推荐语增加可空字段。旧进程停止并排空写入后，再执行自带事务的 `20261124010000_group_rank_board_updated_at`，根据已有记录回填榜单活动时间并更新目录索引。缺任一迁移时，候选健康检查返回 503。切换后健康、模板和未登录权限检查通过。

微信开发版 1.0.6 已于 2026-11-24 编译并上传。微信版本管理和真机验证各自以当次状态为准。

[早期部署与排障记录](https://github.com/sosohime/bo-chaos/blob/51e4e9a19f6974d4d65d15acc48adbee44188c6a/deploy/group-rank/README.md)
