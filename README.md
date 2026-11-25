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

Codex 桌面宠物 ExpertBo 和影流Bo 的资源及安装步骤见 [Codex Pets](packages/codex-pets/README.md)。

## 本地开发

使用 Node.js 22 和 pnpm 9。克隆仓库后，在根目录执行：

```bash
pnpm install --frozen-lockfile
pnpm run verify
```

小本儿的构建、预览和数据库验证见 [小程序 README](apps/group-rank-miniapp/README.md)。独立服务的迁移和回滚见 [部署说明](deploy/group-rank/README.md)。其他应用命令见 [开发命令](docs/agent/COMMANDS.md)。
