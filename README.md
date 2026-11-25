# bo-chaos

博哥相关应用、微信小程序和开发工具共用的 pnpm 工作区。

## 应用

| 应用                | 目录                                                          | 用途                                               |
| ------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| 博哥的小本儿        | [apps/group-rank-miniapp](apps/group-rank-miniapp/)           | 每个微信群一个小本儿，记录成绩、办排行榜、推荐好物 |
| 博Fans 小程序       | [apps/miniapp-taro](apps/miniapp-taro/)                       | 博史、博游、博逗、磕头和素材投稿                   |
| 博Fans 管理端       | [apps/front-next-admin](apps/front-next-admin/)               | 素材审核和类目管理                                 |
| NestJS 后端         | [apps/backend-nest](apps/backend-nest/)                       | 博Fans API 和独立启动的小本儿 API                  |
| Astro 网站          | [apps/frontend-astro](apps/frontend-astro/)                   | 博新闻、博退休及公开页面                           |
| 博退休 VS Code 插件 | [apps/bo-retire-vsc-extension](apps/bo-retire-vsc-extension/) | 在编辑器状态栏显示退休倒计时                       |

共享类型、工具、组件和 Prisma 模型位于 [packages](packages/)。

## 本地开发

使用 Node.js 22 和 pnpm 9。克隆仓库后，在根目录执行：

```bash
pnpm install --frozen-lockfile
pnpm run verify
```

小本儿的构建、预览和数据库验证见 [小程序 README](apps/group-rank-miniapp/README.md)。独立服务的迁移和回滚见 [部署说明](deploy/group-rank/README.md)。其他应用命令见 [开发命令](docs/agent/COMMANDS.md)。

## Codex 博哥小宠物

资源包在 `packages/codex-pets`，当前包含 ExpertBo 和 影流Bo。GitHub 地址：<https://github.com/sosohime/bo-chaos/tree/main/packages/codex-pets>。

macOS / Linux / Git Bash 复制下面这条命令到 Codex 或终端执行，即可安装 ExpertBo：

```bash
bash -lc "$(curl -fsSL https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/codex-pets/install-expertbo.sh)"
```

Windows PowerShell 安装命令：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/codex-pets/install-expertbo.ps1 | iex"
```

macOS / Linux / Git Bash 安装影流Bo：

```bash
bash -lc "$(curl -fsSL https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/codex-pets/install-shadowbo.sh)"
```

Windows PowerShell 安装影流Bo：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/codex-pets/install-shadowbo.ps1 | iex"
```

安装后在 Codex `Settings -> Appearance -> Pets` 点击 `Refresh`，选择 `ExpertBo` 或 `影流Bo`。

## 现有待办

** 单元测试 **

- 所有工具函数覆盖单测

astro退休倒计时

- [ ] SEO优化 - 各种搜索引擎搜索“袁博退休”可以搜得到
  - [x] Google
  - [x] Bing
  - [ ] ~~Baidu~~
- [x] VSCode插件: [bo-retire](https://marketplace.visualstudio.com/items?itemName=zhangyiming.bo-retire)
  - [x] 状态栏显示倒计时、跳转、一次性提示
  - [ ] 自定义计时
- [ ] Chrome插件
  - [ ] 倒计时注入页面右下角，透明度，可拖拽

后端

- [x] 图片上传增加尺寸识别
  - [x] 识别尺寸加入文件名中，用于瀑布流布局
  - [x] 提供脚本批量处理存量图片（改图片名 + 更新DB）
- [x] 管理后台登录（WIP）
- [x] 增加拒审功能
  - [x] 素材状态更新为reviewing、passed、rejected

管理端

- [x] 登录页
- [x] 审核页面
  - [x] 支持增加新二级类目
  - [x] 支持给审核中的图片修改二级类目

小程序

- [ ] 磕头页
  - [x] 磕头批量提交
  - [ ] 图片可配置、支持轮播
  - [x] 点磕头按钮的动画更新
- [ ] 博史、博游
  - [ ] 图片布局调整，两栏布局，增加间距
- [ ] 博逗
  - [ ] 图片懒加载，一次只加载n张，超过可视范围不继续加载
  - [ ] 瀑布流布局方法调整（配合后端新增的图片尺寸识别）
- [ ] 我
  - [x] 图片上传增加单张进度展示（图片上面圆形进度条）
  - [ ] 审核状态分为审核中、已通过、已驳回，分三个tab，tab上标识数量，分页
  - [ ] 磕头历史折线图，磕头趋势

Work FLow

- [ ] astro、后端、管理端分三个Action各自更新
- [ ] GitHub Action增加push更新识别，判断那个apps更新，触发对应流水线
