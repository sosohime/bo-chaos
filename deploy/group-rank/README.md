# 博哥的小本儿独立后端：yuanbo.online

## 当前运行目标（2026-11-24）

- 主机：SSH 别名 `bo-chaos-101`，`101.34.252.219`，复用现有主机和证书。
- API 根路径：`https://yuanbo.online/group-rank`。
- 就绪检查：`https://yuanbo.online/group-rank/health`。
- 进程：PM2 `group-rank-test`，独立 fork；仅监听 `127.0.0.1:3010`，256MB 重启阈值。
- 数据库/角色：独立 `group_rank_test` / `group_rank_app`，不是 BoFans 数据库或账号。池最多 5 个连接，角色连接上限 10。
- 工作目录：`/usr/soso/group-rank`。当前版本为 `releases/20261124-directory-aeb3363b98cc`，`current` 与 PM2 实际入口一致。回滚基线为 `releases/20261123-recommendations-85cf9f50a66e`。
- 运行配置：`shared/runtime.env`，root 私有目录、文件权限 600。密钥只在服务器生成及保存，不进入 Git、客户端或聊天输出。
- PM2 配置源：本目录 `ecosystem.config.cjs`。更新不可变路径时，先保存旧版本路径，仅替换 `group-rank-test` 进程并验证其实际 `pm_exec_path`；不要假定 startOrReload 会更新 fork 进程的入口路径。以独立 `dist/group-rank/main.js` 启动，不加载 BoFans 模块或其环境文件。

该版本包含群目录排序和好物推荐语，两项迁移已在独立库执行。已从备份恢复到临时库演练，候选在任一迁移缺失时返回 503。切换后公网健康返回 ready，模板返回 200，未认证的推荐语修改返回 401。

回滚时保留两个新增字段及现有数据，切回旧版本的 PM2 入口和 `current`。按下方安装与数据边界中的顺序执行新增迁移。相关小程序构建和真机预览见[小程序 README](../../apps/group-rank-miniapp/README.md)。

## 2026-10-30 账号切换（历史）

用户已将私有配置更新为 AppID `wxe185bc2feabae6a8` 并确认域名配置完成；本地项目与构建已同步。仅重新启动 `group-rank-test` 以加载更新后的配置；内部健康检查返回 ready。该检查只证明配置存在，不能证明新 Secret 有效或微信真实 code 交换成功。旧账号的登录验收不能沿用到新账号。

旧 HTTPS 证书于 UTC 2026-10-29 22:59:59 到期，2026-10-30 已按用户授权更新为 Let’s Encrypt 证书（覆盖 yuanbo.online / www.yuanbo.online），有效至 UTC 2027-01-28 02:26:28（北京时间 10:26:28）。公网 HTTPS 健康/模板接口通过可信证书校验，返回 200；新账号真实登录与 A/B 群仍待验收。证书路径、自动续期及备份见 `docs/agent/DEPLOYMENT.md` 的 TLS Renewal 小节。

## 群卡片校验修复（2026-10-30）

真实群卡片的微信 code 交换和 AES 解密成功，旧实现误把 `watermark`、后续又把 `chat_type` 设为必填，导致群载荷被拒绝。现在兼容仅含 `opengid` 的旧版群数据和新版字段；显式非群 chat_type、单聊标识、错误群标识仍拒绝，水印出现时继续检查 AppID 与时效。缺少水印时不声称已校验载荷生成时间，群来源仍由本账号微信会话密钥解密，不接受客户端自报群 ID。

最终候选 `20261030-group-entry-6b141d7b0621` 的 auth JS SHA256 为 `6b141d7b0621e957febee6c3b7f3e768e75cd7b1f3c3b1bb769e857a357c2a83`。2026-10-30 12:16:04 北京时间，真实 `/session` 返回 201，`/current-group` 返回 200，用户确认“已进入，显示本群榜单”；验收仅覆盖此群卡片进入，群工具、A/B 群转发与计分操作仍待逐项验证。

固定失败阶段日志不含原始数据：`cipher_shape / decrypt / group_id / chat_type / single_room / watermark / app_id_missing / app_id / timestamp / future / expired`。不记录 code、密文、iv、session_key、群或用户标识。

## 首次接入验证（历史）

当前 `/health` 返回 HTTP 200、`status: ready`、`database: ready`、`wechat: configured`。2026-10-27 旧账号 AppID 为 `wx27c85260fc7a7163`；密钥仅核对存在性，没有输出。开发者工具真实登录凭证已通过服务端微信交换；故意无效的群载荷在创建身份/空间前被拒绝（401 群来源校验）。真实群来源与小程序发布尚未验收。

三个官方模板接口公开返回 200；没有群凭证访问 `/current-group` 返回 401。独立微信凭据缺失时 `/session` 返回 503，不能静默复用旧小程序；这是缺配置测试契约，并非当前配置状态。

用户已手动完成 AppID、AppSecret 与 request 合法域名配置。2026-10-27 开发者工具保持 `urlCheck: true`，实际调用测试域名成功。Browser Use 对公众平台的站点策略拒绝仍有效；未绕过该限制，未操作后台。

## 安装与数据边界

首个候选包含 160 个有 SHA256 清单的运行/工作区文件；当前候选清单为198文件，排除编译缓存和 source maps。按冻结锁文件安装 `backend-nest...` 生产依赖，关闭安装脚本，并使用服务器已有同版本 Prisma CLI 生成 Linux 客户端。不要复用其他 checkout 的 node_modules 符号链接，也不要让 Prisma 自动安装改写候选清单。

首次接入执行三项 GroupRank 增量 SQL：`20261026000000_group_rank_direct_entry`、`20261030000000_group_rank_custom_profile`、`20261030010000_group_rank_proxy`。后两项应用前各备份并验证恢复，在事务内应用；不恢复运行库。**不要对该独立库直接执行整个 monorepo 的历史 migrate deploy**：旧迁移属于 BoFans，当前独立库只需要群排行表。应用的 SQL 哈希在候选 `release.json` 及安装记录中，可用它审查后续迁移。

好物榜使用感受版本需要在独立群排行库先应用 `20261124000000_group_rank_recommendation_note`，再切换该版本的后端。此增量要求已应用 `20261123000000_group_rank_recommendations`，给 `GroupRankRecommendation` 新增可空的 `note` 列，旧推荐无需回填。

目录按更新时间排序的后端依赖 `20261124010000_group_rank_board_updated_at`。先停止旧群排行后端接收写入并等待在途写入结束，单独执行自带事务的迁移文件，再切换到新后端并恢复写入。迁移用保留的成绩、代填和推荐记录回填 `GroupRankBoard.updatedAt`，无活动的榜单用创建时间，并替换目录排序索引。全程暂停旧版写入，避免切换间隙的成绩和推荐漏记更新时间。

BoFans 的仓库、运行环境、数据库和原 PM2 进程未被替换；原有进程 PID 保持不变。主页及原 `/rpg` 路由未切换。没有推送、提审或微信后台写入。

## HTTPS 路由与防护

`/etc/nginx/conf.d/yuanbo-online-migrated.conf` 的现有 HTTPS server 增加且仅增加 `/group-rank/` 代理至本机 3010；没有新增 DNS、证书或防火墙公网端口。

`/etc/nginx/conf.d/00-group-rank-rate.conf` 定义新 API 的每 IP 5 次/秒限速、burst 20，超限 429。网关和独立 Nest 服务均限制 JSON 请求 16KB；响应使用 no-store 与 noindex，普通代理等待上限 20 秒。仅 exact `/group-rank/profile` 允许3MB、30秒，用于最多2MB的头像文件与昵称；其余路径限制不变。Nginx 语法验证后平滑 reload。

微信小程序后台最终需要将 `https://yuanbo.online` 配置为这个独立 AppID 的 request 合法域名。用户已完成该步骤，开发者工具实际请求成功；真机还需核对，不以服务器路由替代白名单配置。

## 备份与回滚

`/usr/soso/group-rank/backups/before-first-install/` 保存：

- 原 Nginx 站点配置 `nginx.conf`。
- 原 PM2 状态 `pm2-before.json`（私有，可能包含旧应用配置，禁止输出或下载到仓库）。
- 新库迁移前/后 `database-before-migration.dump`、`database-initial-schema.dump`。
- `install-result.json`、`proxy-result.json` 与 `restore-check.json`。

迁移后的 dump 已恢复到单独的 `group_rank_restorecheck` 临时库，验证 5 张表和 2 个 CHECK 约束后删除本次临时库；运行中的测试数据库未恢复或删除。

回滚仅停新进程/撤下新路由，保留数据库和私有配置：

以下是首次安装的卸载回滚历史；当前头像路由已改变站点哈希，不能直接覆盖。当前候选的保留数据代码回滚见下文。

1. 检查当前 Nginx 配置仍为本次安装后的 SHA256 `11c2f41aa21b1fe0363f6a3d1f5995f60a472ee64a8c735842ac703dd334df85`。若之后有其他改动，不可整份覆盖，需仅移除 `group-rank-test` 标记的 location 与专用 rate 文件。
2. 无其他改动时，可原子恢复备份站点配置（原 SHA256 `2a48f256a41cc8f99acdcf6fdd1c6c7b17598cf0031faf2f79e5588c989b7cb3`），撤下专用 rate 文件，先 `nginx -t` 再平滑 reload。
3. `pm2 stop group-rank-test`，不重启或删除 `main` / `nextjs-app`，不删除数据库或 role。
4. 验证原主页、`/rpg/admin/login`、`/rpg/bofans/global/systemConfig`。

## 后续接入

独立微信凭据已由用户补齐到服务器私有配置并生效。后续更换时，仅更新 `GROUP_RANK_APP_ID`、`GROUP_RANK_APP_SECRET`，重启且只重启 `group-rank-test`。本服务的独立 JWT/数据库密钥已经生成，不要为了填 AppID 而重新生成它们。

前端使用 `GROUP_RANK_API_BASE_URL=https://yuanbo.online/group-rank pnpm -C apps/group-rank-miniapp build:weapp`。项目 AppID 已绑定并导入开发者工具。未导入游客项目，尚未提审或发布；预览上传须记录用户授权及结果。

## 自定义、资料必填及代填候选（2026-10-30）

- 代填功能候选 `20261030-proxy-254cb997cf02`，基线 `20261030-profile-required-72ecec36bd32`，此前 `20261030-custom-09fe49502090`。仅group-rank-test切换，其他PM2 PID保持原值。
- 当前归档SHA256 `8c6c3831d66089becd1c88604d65d3bb8647c2f2e04d308d0262f51e26e6fb31`；Linux生成后198文件清单摘要 `3096a6d1e272a99647c8ff342f9c35dc437e0a90c2ef7903d3708d4b57d2b925`。生成文件哈希以候选Linux结果为准，不复用基线schema生成哈希。
- 代填SQL SHA256 `3a48ec27f6c580fdb1758d840df58a45fbbd9af8f689ceebfeaeeb120f54501f`。备份 `/usr/soso/group-rank/backups/20261030-proxy-254cb997cf02/database-before.dump` 已恢复到临时库验证7张迁移前表，随后删临时库；新库有9张GroupRank表。仅新增两表和Entry.recordedById，未重写已有业务值。
- 自定义迁移备份 `/usr/soso/group-rank/backups/20261030-custom-09fe49502090`，SQL SHA256 `29ae8ed15d9edd01ab62069977743451db9371119c6ce00ac95e0dc247a99b14`。此前备份恢复验证5张表。
- 头像根目录 `GROUP_RANK_AVATAR_ROOT=/usr/soso/group-rank/shared/avatars`，目录700、文件600，绝不配置静态目录。仅exact profile上传路径例外，站点SHA256 `bb3e0cf5d65d129ca1715e87cff9eabef1fc60f278f65d1d8529005823af28f8`。
- 微信上游文本/图片内容检查已在主机使用私有凭据实际验证errcode0/pass；不输出token/openId或头像。就绪只证明DB/schema及配置存在，不能替代每次审核或真机验收。
- 运营只读队列：从当前候选运行 `GROUP_RANK_ENV_FILE=/usr/soso/group-rank/shared/runtime.env node deploy/group-rank/reports.cjs`。默认只读；`--hide`为dry-run，`--apply`清空并隐藏真实榜单，需单独授权。
- 当前公开health ready，所有新代填/认领/头像接口无token返回401。新预览已上传（仅预览），原生自定义创建/头像/昵称已由用户验证；新版资料必填、代填和跨账号认领仍需真机确认。

代码回滚：保留全部新增schema、数据库与私有头像，使用保留基线的`ecosystem.config.cjs`方式仅替换group-rank-test，确认pm_exec_path和health后原子调整current。不得假定fork的restart/startOrReload会改变入口。审批后的记录已经转入本人，旧版本暂不显示未认领记录；不要为回退代码清表或恢复旧dump。数据恢复必须另行明确授权。

最终资料隔离修正：`20261030-proxy-isolation-15f1c762553c`，基线proxy-254cb997cf02；只替换proxy service和只读reports配置检查（loaded声明），没有schema变化。198文件清单摘要 `35a08698bf6a1ba144faa77b4cc954d8a48115a3b3bab36c2c5600e8e841af93`；归档SHA256 `99fbc4bd72e57a2d9431b5326f3fb126c4a42b15c5ab2f5d654dff21705cd51b`。部署后健康ready、实际脚本与current一致、其他PM2 PID不变、只读report queue就绪0条。创建者代填/编辑不再要求本人头像昵称，且不改其资料；自填/认领仍要求完整资料。修正版仅预览包421244字节，原生身份不变重测和双人认领pending。此前初版代填待认领已由用户确认，随后本人资料混淆反馈已据此修正。

## 竞技主题候选（2026-10-30）

当前 `20261030-arena-b4d4e1c755de`，基线 `20261030-proxy-isolation-15f1c762553c`；源归档SHA256 `e6f99fd4b69fcde428223d6d89f53a662bea46607cac3c7079e575af89ddf375`，Linux201文件清单摘要 `3431096b44f4c394a8586aceb9f06890c45669b71b488109c99440ffa0d787a1`。新增第四项GroupRank迁移 `20261030020000_group_rank_theme`，仅增加Board.themeId及预设枚举CHECK，SQL SHA256 `1081508a77cacf9ee796158f9c14be613efea32d755b36d57ea99efecd6abd7d`；此前三项保留，不执行BoFans迁移链。

备份 `/usr/soso/group-rank/backups/20261030-arena-b4d4e1c755de/database-before.dump` 恢复到独立临时库，验证9张GroupRank表后移除临时库；未恢复或删除运行库。候选Linux Prisma客户端重新生成并重新计算生成文件清单，只替换group-rank-test，确认实际脚本、current/pm2 save和其他PID不变。没有Nginx/TLS/域名/运行凭据变化。

公开health ready；新appearance接口无Bearer401；实际数据库只读聚合冒烟：3张榜单均有真实summary，theme受限。没有写测试成绩、伪冠军或弹幕数据。代码回滚保留新列/数据即可，别为回退界面恢复旧dump；旧版可忽略theme。新界面真机需独立预览验收。

竞技UI最终微信预览：492256字节，37文件/509908字节的dist清单摘要a22780d3d76d8f9490edc6841020022011c06e4d9c42bc81a1612a4e4478575d。仅预览，原生新UI验收pending；没有弹幕、任意背景上传或新健康数据能力。

## 自定义数值主题限制移除（2026-11-03）

用户明确授权“部署”。当前候选 `20261103-custom-metrics-c8de8e4599b5`，上一版 `20261030-arena-b4d4e1c755de` 保留供代码回滚。本次从已验证线上版本克隆，运行文件仅替换 `apps/backend-nest/dist/group-rank/definitions.js`，差异仅移除健康名称/单位的两行关键词拦截；正常短文本、规则枚举、微信内容审核沿用。无需迁移、依赖安装或凭据变更。

定义文件SHA256 `c8de8e4599b567a6a89ab785cb1b560353de7e4c597b5dbc698a9114aba4eef6`；201文件清单摘要 `59b891b02586dc7705800a3a99ad7989671b9fdf74dc96d5404ca6eae8a15dca`。备份/结果位于 `/usr/soso/group-rank/backups/20261103-custom-metrics-c8de8e4599b5/`；上一候选原文件哈希保持不变。仅替换group-rank-test，实际PM2入口/current/save已同步，其他进程PID不变。

候选模块只读验证尿酸/血糖/血压/体重及μmol/L、mmol/L、mg/dL等单位可用，非法规则仍拒绝。未写线上测试成绩或草稿；真实微信文本审核与手机创建由用户后续操作验证。旧手机包可使用新版服务端，不必为了移除服务端拦截重新扫码；旧包可能仍显示旧提示，新本地包已移除提示。未提审发布。

公网复核：health/templates200，未授权current-group/draft读取401；主页、admin登录、BoFans公开配置均200。实际运行脚本和定义文件哈希二次核验通过。

## 2026-11-11 艺术字上线与微信首版审核

用户明确授权部署/发布。当前 `20261111-title-art-9f92d10bc36a` 只替换 module 与四个 title-art 运行 JS、增加服务端字体和 OFL 许可（共7文件）；无 schema、真实成绩、凭据、鉴权策略或 Nginx 变更。旧基线文件哈希保持一致。当前清单207文件，摘要 `d4beaa94a1a7060af082829776e1a25d6b6dde13525c4424f4fc86e8f7e2069f`；归档 SHA256 `da0293194cc9486cbf18014d2b34952e2886cea444cea03f2c362c3686ec8d0f`。

Linux 实际 Sharp/Pango 以合成榜名渲染1024×366透明PNG（67010字节），缓存合并/缺字回退/跨群拒绝通过；隔离 loopback 完整 Nest 候选验证后停止。激活后 current、PM2 pm_exec_path 与持久化配置一致，其他 PM2 PID 不变。服务器经可信公网 TLS 检查 health/templates/主页/admin登录/BoFans配置均200，无凭证艺术字401；没有创建真实榜单或提交成绩。

备份/结果：`/usr/soso/group-rank/backups/20261111-title-art-9f92d10bc36a/`。代码回滚保留数据及配置，以旧 `20261103-custom-metrics-c8de8e4599b5` 的 ecosystem 只替换 group-rank-test，验证实际入口/health后原子调整current并pm2 save；不要恢复旧数据库或重启其他进程。部署脚本包含失败自动回滚，本次未触发。

官方小程序名称“博哥的小本儿”，AppID `wxe185bc2feabae6a8`。已成功上传1.0.0，用户手动提交后报告审核中；尚未正式发布。公众平台页面仍受工具站点安全策略阻断，未绕过；不得将备案/认证通过等同代码审核通过。历史各节的未上传/未提审描述仅适用于其记录日期。

## 2026-11-11 当前群名协议与书布艺术字候选

用户明确允许部署并生成预览二维码。现行群榜服务为`20261111-notebook-36050e1f47d3`，基线`20261111-title-art-9f92d10bc36a`保留。仅增加验证后displayOpenGid响应、替换艺术字轮廓渲染与字体，并隔离复制Fontkit运行依赖；没有旧服务协议兼容路径，无数据库/凭据/鉴权claims/Nginx修改。完整清单962文件，摘要33a7b78f33602627202efafe2ca1327e3b9008f5b04a62265363acd9d4fc24ed。

Linux实际渲染1024×374 PNG共226321字节，缺字回退/同群授权/请求合并通过，峰值RSS154268KB；候选loopback启动与未授权401冒烟通过。current、PM2实际入口与持久化一致，其他PM2进程PID未变；公网health/templates/主页/admin登录/BoFans公开配置200，未授权艺术字401。没有真实测试成绩或草稿写入。

备份与自动回滚脚本结果保存在`/usr/soso/group-rank/backups/20261111-notebook-36050e1f47d3/`。回滚只以保留基线ecosystem替换group-rank-test并确认实际入口/current/health，再pm2 save，不恢复数据库。与新session协议配套的手机预览必须使用当前构建；当前手机真实群名仍待用户验收。

## 2026-11-16 接口恢复与新版艺术字真机预览

公网HTTPS、服务器loopback和本机系统代理均验证templates200、health ready。开发者工具重新加载已显示真实三个官方模板；本轮网络已恢复，未修改接口代码、代理、TLS/域名或安全设置，不虚构已定位/修复一个未复现的根因。

为当前手机候选同步renderer-only版本`20261116-electric-edge-222a174b098e`，基线`20261111-notebook-36050e1f47d3`。复制基线不可变目录，仅替换title-art-renderer.js及声明文件；JS SHA256 `222a174b098ee4a06990067042298e4b5a5e8b61fee50bed6fb17f6c8d70aed6`，版本electric-edge-v4。字体哈希与原服务器相同；旧有服务、鉴权、schema、背景服务、网关和凭据均保留。候选loopback3011健康/templates通过、私有接口401，Linux合成尿酸王PNG955×248/141798字节。切换仅group-rank-test，实际PM2脚本/current已核对，其他PM2 PID不变。备份/result/render-smoke保存在`/usr/soso/group-rank/backups/20261116-electric-edge-222a174b098e/`。回滚保留数据，将GROUP_RANK_RELEASE_ROOT指向基线ecosystem，只替换group-rank-test、核对健康及实际脚本、原子恢复current后pm2 save；不恢复数据库。

后端123测试通过/21DB opt-in跳过，build通过；没有backend源代码改动。当前普通前端54文件1,529,627字节摘要1af3c137b31c5968e19ee91a31491d3beaf5a60110275f800ebaabb9a1cfc771，wcc与精确源码/配置/类型/物料门禁通过。官方GUI预览成功1473KB，二维码有效至2026-11-16 14:43北京时间，原样复制经系统预览保存为PNG。证据与QR：`/Users/heyesheng/.codex/visualizations/2026/11/16/preview-network/`。仅预览，无正式上传、提审或发布；新自定义背景schema/upload服务仍未部署，不把renderer-only同步当完整背景服务上线。

## 2026-11-16 完整自定义背景服务部署与原生验收

用户明确要求部署全部背景服务并提供完整真机预览。当前独立服务`20261116-bg-crop-00cf4c5ddaf1`，完整功能基线`20261116-background-19c589027abc`，部署前基线`20261116-electric-edge-222a174b098e`。包括背景增量schema、Linux Prisma客户端、审核/上传/私有读取、草稿和榜单外观持久化，保留electric-edge-v4艺术字。只切换group-rank-test，其他PM2 PID保持；未提审或发布小程序。

备份与恢复验证：`/usr/soso/group-rank/backups/20261116-background-19c589027abc/`保存数据库dump、私有图片tar和网关配置，均root私有；dump先恢复到独立临时DB验证，再在临时DB应用新DDL并运行Linux集成测试，随后移除临时DB。只应用第五项GroupRank SQL，SHA256 a9a2d2617f494dd60e53200867535127a11ef9c1bb5ed82b248a0ca180d423e8；原有记录数量未变。最终精度补丁前再次同时备份DB和图片到`backups/20261116-bg-crop-00cf4c5ddaf1/`。新背景数据与图片保留，代码回滚不得恢复旧dump覆盖运行数据。

网关只增加exact `/group-rank/backgrounds`，5MB multipart envelope、30秒超时和原限速；服务4MB文件/1600px/1MB重编码上限保留。当前站点SHA256 94fc77600ac5d9d77ede3c5ba988763932ebea1b6ac50dc0e0980bf9faa36163。公开健康ready、模板200、未登录背景读取401、缺字段上传400；20KB multipart通过网关到认证层401，超过4MB文件413。无私有图片静态路由、鉴权放宽、凭据输出或其他服务变更。

实际修复两项服务端问题：背景解析复用外观更新事务客户端，避免单连接/连接池饱和时再申请连接导致5秒超时；背景crop/zoom/dim先校验范围再规范到六位小数，避免原生拖动的长小数在持久化后误触发幂等冲突。不同真实裁切依然拒绝复用同一保存请求，不把越界值四舍五入为合法值。新增回归与真实数据库回归均通过。

Linux候选用真实微信图片审核验证重编码/幂等/0600文件/0700目录/草稿建榜与群读/外观修改/跨群跨作者拒绝，合成身份和文字审核stub仅用于恢复的临时DB，生产未改变。原生正常包另已通过真实微信登录、相册选图、缩略图133%缩放、47%压暗、拖动、图片上传审核、含图草稿保存。首次原生保存曾409，精度修复后同一请求重试成功；另一个全新请求首次保存也显示“规则已保存”。只创建两个私人验收草稿和一张审核图片，未向真实群发消息、建榜或改分。物理手机验收交给用户，不能据模拟器宣称手机通过。

前端仅修复系统相册返回的导航保护：用scene/path/query/shareTicket精确区分原生选图返回与新入口；每次App前台仍清空登录凭据/图片缓存，后续写入仍重新核验群来源。普通/变更入口继续大厅重新解析。原生文件选取使用/tmp独立副本，避免在监听项目内选择源图片引起整个DevTools上下文重载；失败中间态保留。266客户端测试/类型通过；后端128测试通过，21DB opt-in测试另在临时PG全部通过，构建通过。最终普通54文件1,530,778字节，摘要6e3c68ffc047ba91536a3547fad98a92ed63591707a740e296574dda409664bf，wcc/源码/配置/类型/素材/包体门禁通过、app.js最后提升，不含QA。证据`/Users/heyesheng/.codex/visualizations/2026/11/16/background-complete/`。

回滚：保留新增schema与图片，指定保留基线的GROUP_RANK_RELEASE_ROOT，只替换group-rank-test并核对PM2实际脚本/health，再原子调整current并pm2 save。只需回滚精度补丁时使用完整背景基线；若回到背景部署前版本，须同步恢复相应旧前端并只移除本次exact上传location、nginx -t后平滑reload。不得整份覆盖后续已变的网关配置，不影响其他进程。

## 2026-11-17 接口链路修复与独立配色后端部署

用户明确授权修复连接并部署配色。当前独立服务为 `20261117-color-79d6f94f9693-r2`，回退基线 `20261116-bg-crop-00cf4c5ddaf1`。从不可变基线复制后仅覆盖12文件（5运行JS、对应声明、schema及第六项SQL），Linux重新生成Prisma，最终975文件清单核对一致。保留electric-edge-v4、背景上传/私有读取、鉴权及现有规则。仅替换group-rank-test，实际PM2脚本/current/保存配置一致，其他PM2 PID不变，网关和runtime.env哈希不变。

备份 `/usr/soso/group-rank/backups/20261117-color-79d6f94f9693-r2/` 包含root私有数据库dump、私有图片tar、部署前指纹及恢复/往返结果。dump先恢复临时数据库核对数量/指纹，再应用 `20261116000000_group_rank_color` 并测试。线上应用同一nullable列及CHECK约束，原成绩/背景/榜单外观指纹不变；生产真实DB中的合成配色测试通过单个事务全部回滚并确认无残留。已覆盖草稿规范色/幂等、激活、外观更新/读回/恢复默认、跨群/非创建者/非法颜色拒绝。134后端用例通过（21项DB opt-in另在临时PG全部通过），后端构建通过。

候选3011及当前3010健康通过，公网health ready、templates200、未登录appearance PATCH401。旧代码在新增列后仍健康。回滚保留新增列与全部运行数据：指定基线GROUP_RANK_RELEASE_ROOT，只替换group-rank-test，核对实际脚本/健康后原子恢复current并pm2 save；不得恢复旧dump覆盖新数据。

本机TLS失败定位到FlClash全局代理链路；通过GUI增加全局附加规则 `DOMAIN / yuanbo.online / DIRECT` 并切换规则模式，代理/TUN开关及节点选择未改。请求视图确认DIRECT，持久化配置mode=rule；规则存在SQLite全局映射。生成的config.yaml可能仍写global，不作为当前模式依据。直连客户端与显式系统代理共6次HTTPS均200，原生正常大厅真实三个模板加载成功；没有关闭TLS/URL校验或开启CLI服务端口。

普通包56文件/1530428字节，清单摘要 `96fb86b0bdd2b0103aa8a606628548250b26cb77eaf5c468a2d51141685ab7cf` 未变，无合成QA。官方GUI新预览1472KB，二维码原样复制经系统预览保存，2026-11-17 14:40北京时间失效。证据与QR：`/Users/heyesheng/.codex/visualizations/2026/11/17/color-deploy/`。仅预览，没有正式版本上传/提审/发布，当前包真机IME/媒体/多群和视觉接受仍待验收。

## 2026-11-19 背景裁切上线与分享封面

当前线上独立服务为 `20261118-crop-renditions-8b26c3f8dab5`，回退基线为 `20261117-color-79d6f94f9693-r2`。部署覆盖 4 个编译模块及声明，只在服务映射中加入裁切版本，不带入本地其它功能。未变更数据库、私有图片、运行凭据或网关。候选 977 文件哈希复核通过。

先用 Linux 生产依赖和临时合成图片验证 960×320 头图、144×144 缩略图的实际取景、旧版本拒绝及跨群隔离，再以 3011 验证独立服务候选。切换后核对 PM2 实际入口、current 和其它进程 PID，公网健康和模板返回 200，未认证的缩略图返回 401。未向真实群写入验收数据。记录在 `/usr/soso/group-rank/backups/20261118-crop-renditions-8b26c3f8dab5/`。回滚用上述基线的 ecosystem 只替换群榜进程，确认健康后原子恢复 current 并执行 pm2 save。

本地小程序将大厅、榜单和创建页的分享封面统一为 500×400 JPEG `/assets/share-cover.jpg`，25,620 字节，素材取自博哥肖像参考生成的伏案写笔记画面。微信编译及包内封面校验通过，未提交或发布微信版本。

## 2026-11-20 单笔规则和代填认领

独立群榜服务已切换到 `20261119-claim-ecc812739c15`，基线为 `20261118-crop-renditions-8b26c3f8dab5`。新增线上单笔规则的创建、个人填写与代填校验。群友发起认领时先检查同一记录周期是否冲突，创建者确认时在同一事务内再次检查。规则仍保存在原有的榜单规则中，无数据库迁移。

候选在 3011 检查月界线、单笔冲突、健康状态和权限；切换后公网健康与模板接口返回 200，未登录接口返回 401。仅切换 `group-rank-test`，其它进程 PID 保持一致。部署记录及旧候选保留在 `/usr/soso/group-rank/backups/20261119-claim-ecc812739c15/`。若已创建单笔榜单，后续回退需要保留服务端单笔限制。

同日，独立服务切换到 `20261120-direct-claim-817c8e513d2c`。群成员确认认领后立即转入个人记录。原审批路由已移除。切换无需迁移，单笔校验仍在写入事务内。1.0.3 微信开发包移除了审批入口及等待文案。
