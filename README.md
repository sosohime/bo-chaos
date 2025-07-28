# bo-chaos

## 目录结构

```text
.
├── apps                     // 应用
│   ├── backend-nest              // nest后端
│   ├── frontend-astro            // astro前端
│   ├── frontend-next-admin       // 管理后台
│   ├── bo-retire-vsc-extension   // 博退休之vscode插件
│   └── miniapp-taro              // 博Fans小程序
├── packages                 // 公共依赖
│   ├── config-tailwind            // taiwindcss配置
│   ├── const                      // 常量
│   ├── prisma-client              // 数据库客户端，可以共享model定义
│   ├── types                      // 通用类型定义
│   ├── ui                         // 前端组件
│   └── utils                      // 工具函数
├── package.json             // 全局依赖
└── pnpm-workspace.yaml      // pnpm工作区配置
```

# TODO

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
