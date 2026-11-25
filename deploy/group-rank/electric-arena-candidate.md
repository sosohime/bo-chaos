# Electric arena + private backgrounds · deployed (2026-11-16)

Current: 20261116-bg-crop-00cf4c5ddaf1, full background base20261116-background-19c589027abc. Additive isolated schema, private reviewed storage/read routes and exact bounded gateway are deployed. Native real-author upload and two background-draft saves verified; physical-phone acceptance is user-run, no formal miniapp publication. See final record below. Historical release recipe and rollback follow.

## Concrete release contents

- Independent GroupRank Nest module + regenerated Linux Prisma client; existing dependencies include Sharp/Fontkit. Bundle `assets/group-rank/SmileySans-Oblique.ttf` and its OFL with the title renderer (`electric-edge-v4`). Font outlines are rendered server-side; no full Chinese font in the miniapp.
- Fifth isolated additive migration: `packages/prisma-client/prisma/migrations/20261114000000_group_rank_background/migration.sql`. Adds `GroupRankBackground` and nullable `GroupRankBoard.background`. Preserve all four earlier GroupRank migrations. Never run the BoFans migration chain on this database.
- Private files under existing `GROUP_RANK_AVATAR_ROOT/backgrounds`; directory0700, JPEG0600, immutable random names. Never mount as public/static. Back up DB and this directory together. Unbound reviewed uploads are retained; each author has a serialized20/day upload cap. This candidate does not introduce destructive garbage collection.
- Nginx **exact** `/group-rank/backgrounds` route in `background-location.conf`:5MB multipart envelope, existing rate zone,30s upstream timeout. Decoder input is at most4MB; canonical review/stored JPEG at most1MB/1600px. All other JSON limits stay16KB; existing avatar route stays3MB envelope/2MB file. No new host/domain/CORS/auth audience is needed.
- Miniapp creation sends author proof using a fresh one-use WeChat login code. Choosing a photo first checks platform privacy authorization and uses its native consent button when needed. Update the target account's privacy guide for selected photos used as **group board backgrounds and content review**, consistent with this actual feature; consent and album selection are user actions. No phone/location/contacts/chat-history capability is added.

## Release order, after explicit deployment authorization

1. Pin source/build hashes from the evidence packet. Back up the isolated DB and private image root; restore the dump to a disposable DB and verify before touching live schema.
2. Apply only the new additive SQL in a transaction to the verified isolated DB; retain a migration hash/installation record. Do not delete/rewrite earlier tables.
3. Stage the final Nest release and generated client/fonts. Start a loopback candidate; health checks must detect the new table/column. Run decoder/moderation/access tests against the candidate with synthetic images. Keep WeChat content moderation enabled; errors never approve an image.
4. Install only the exact new upload location after reviewing the surrounding active config; `nginx -t` then graceful reload. Do not replace an entire changed site config. No static private-image route.
5. Atomically switch only the independent GroupRank service, verify actual PM2 entry/current pointer, health/templates,401 private reads, upload rejection without valid author proof, and other existing service PIDs/public routes unchanged.
6. Upload the separately validated **production** miniapp candidate, never the synthetic QA stage. Verify target AppID `wxe185bc2feabae6a8`; do not call backend deployment a formal miniapp publication.
7. Real-device acceptance still required: new account privacy prompt, album, landscape/portrait images, cover/card drag/zoom/dim, moderation/network failure retry, close/reopen, second group isolation and score/proxy keyboard/scroll. The user currently reserved the phone for other work; simulator/browser evidence does not waive this.

## Rollback

Restore the previous independent service pointer/PM2 entry and gateway exact-location change only, then verify health and public routes. Keep the additive schema and private image files; never restore a dump over live writes as a code rollback. The old service ignores the additive fields. New image reads fail closed or clients display their selected preset if a background is unavailable. Restore the prior miniapp candidate if the new API is rolled back; do not publish a client whose upload contract is unavailable.


## 2026-11-16 完整自定义背景服务部署与原生验收

用户明确要求部署全部背景服务并提供完整真机预览。当前独立服务`20261116-bg-crop-00cf4c5ddaf1`，完整功能基线`20261116-background-19c589027abc`，部署前基线`20261116-electric-edge-222a174b098e`。包括背景增量schema、Linux Prisma客户端、审核/上传/私有读取、草稿和榜单外观持久化，保留electric-edge-v4艺术字。只切换group-rank-test，其他PM2 PID保持；未提审或发布小程序。

备份与恢复验证：`/usr/soso/group-rank/backups/20261116-background-19c589027abc/`保存数据库dump、私有图片tar和网关配置，均root私有；dump先恢复到独立临时DB验证，再在临时DB应用新DDL并运行Linux集成测试，随后移除临时DB。只应用第五项GroupRank SQL，SHA256 a9a2d2617f494dd60e53200867535127a11ef9c1bb5ed82b248a0ca180d423e8；原有记录数量未变。最终精度补丁前再次同时备份DB和图片到`backups/20261116-bg-crop-00cf4c5ddaf1/`。新背景数据与图片保留，代码回滚不得恢复旧dump覆盖运行数据。

网关只增加exact `/group-rank/backgrounds`，5MB multipart envelope、30秒超时和原限速；服务4MB文件/1600px/1MB重编码上限保留。当前站点SHA256 94fc77600ac5d9d77ede3c5ba988763932ebea1b6ac50dc0e0980bf9faa36163。公开健康ready、模板200、未登录背景读取401、缺字段上传400；20KB multipart通过网关到认证层401，超过4MB文件413。无私有图片静态路由、鉴权放宽、凭据输出或其他服务变更。

实际修复两项服务端问题：背景解析复用外观更新事务客户端，避免单连接/连接池饱和时再申请连接导致5秒超时；背景crop/zoom/dim先校验范围再规范到六位小数，避免原生拖动的长小数在持久化后误触发幂等冲突。不同真实裁切依然拒绝复用同一保存请求，不把越界值四舍五入为合法值。新增回归与真实数据库回归均通过。

Linux候选用真实微信图片审核验证重编码/幂等/0600文件/0700目录/草稿建榜与群读/外观修改/跨群跨作者拒绝，合成身份和文字审核stub仅用于恢复的临时DB，生产未改变。原生正常包另已通过真实微信登录、相册选图、缩略图133%缩放、47%压暗、拖动、图片上传审核、含图草稿保存。首次原生保存曾409，精度修复后同一请求重试成功；另一个全新请求首次保存也显示“规则已保存”。只创建两个私人验收草稿和一张审核图片，未向真实群发消息、建榜或改分。物理手机验收交给用户，不能据模拟器宣称手机通过。

前端仅修复系统相册返回的导航保护：用scene/path/query/shareTicket精确区分原生选图返回与新入口；每次App前台仍清空登录凭据/图片缓存，后续写入仍重新核验群来源。普通/变更入口继续大厅重新解析。原生文件选取使用/tmp独立副本，避免在监听项目内选择源图片引起整个DevTools上下文重载；失败中间态保留。266客户端测试/类型通过；后端128测试通过，21DB opt-in测试另在临时PG全部通过，构建通过。最终普通54文件1,530,778字节，摘要6e3c68ffc047ba91536a3547fad98a92ed63591707a740e296574dda409664bf，wcc/源码/配置/类型/素材/包体门禁通过、app.js最后提升，不含QA。证据`/Users/heyesheng/.codex/visualizations/2026/11/16/background-complete/`。

回滚：保留新增schema与图片，指定保留基线的GROUP_RANK_RELEASE_ROOT，只替换group-rank-test并核对PM2实际脚本/health，再原子调整current并pm2 save。只需回滚精度补丁时使用完整背景基线；若回到背景部署前版本，须同步恢复相应旧前端并只移除本次exact上传location、nginx -t后平滑reload。不得整份覆盖后续已变的网关配置，不影响其他进程。
