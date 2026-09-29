# 弹珠潮玩后台管理系统 · 项目总览

## 一、项目定位

**弹珠潮玩后台** 是一个面向移动端的运营管理后台（Admin Portal），基于 Vue 3 + Vant 4 构建，专门为"弹珠潮玩"小程序的运营人员提供商品管理、广告配置、用户管理、会员体系、房间配置等后台能力。

---

## 二、技术栈

| 层级 | 技术选型 |
|------|----------|
| 框架 | Vue 3.4 (Composition API, `<script setup>`) |
| 构建工具 | Vite 5 |
| UI 组件 | Vant 4.9（带自动按需引入） |
| 路由 | Vue Router 4.3（Web History 模式） |
| HTTP 客户端 | Axios（带请求/响应拦截器） |
| 图表 | ECharts 5 + vue-echarts |
| 加密 | CryptoJS（AES-128-CBC） |
| 样式 | Scoped CSS + Vant 主题变量覆盖 |

---

## 三、目录结构

```
pinball-system-miniapp-ui/
├── index.html                    # 入口 HTML（视口 393px 移动端适配）
├── vite.config.js                # Vite 配置（@ 别名）
├── package.json                  # 依赖与脚本
├── .env                          # 默认环境变量 (API 地址)
├── .env.development              # 开发环境
├── .env.test                     # 测试环境
├── .env.production               # 生产环境
├── CLAUDE.md                     # API 接口文档（所有接口规范）
├── PROJECT_OVERVIEW.md           # 本文件
├── dist/                         # 构建产物
└── src/
    ├── main.js                   # 应用入口，挂载 Vue/Vant/Router，全局注入 api
    ├── App.vue                   # 根组件（仅 <RouterView>）
    ├── style.css                 # 全局样式 + Vant 主题覆盖
    ├── api/
    │   └── index.js              # Axios 实例：baseURL、Token 注入、401 跳转登录
    ├── router/
    │   └── index.js              # 路由配置（登录 + 主布局 + 10 个子页面 + 404 重定向）
    ├── utils/
    │   ├── aes.js                # AES-128-CBC 加解密（密钥: AYOFRAMEWORK2026）
    │   └── upload.js             # 文件上传工具（uploadFile / onUploadRead）
    ├── views/
    │   ├── Login.vue             # 登录页（用户名/密码/AES加密/图形验证码）
    │   ├── Main.vue              # 主布局（底部 Tabbar 导航，8 个 tab）
    │   ├── HomeView.vue          # 首页（数据中心：统计卡片 + ECharts 图表）
    │   ├── CategoryView.vue      # 分类管理（商品分类 CRUD + 图标上传）
    │   ├── ProductView.vue       # 商品管理（搜索/筛选/分页/增删/SKU 规格管理）
    │   ├── RoomTypeView.vue      # 房间类型（CRUD + 模式选择）
    │   ├── RoomView.vue          # 房间管理（网格卡片展示 + 房间类型关联）
    │   ├── SignInView.vue        # 签到奖励配置（1-7 天 + 默认奖励）
    │   ├── BannerView.vue        # Banner 广告（轮播广告/拉新活动 CRUD + 排序）
    │   └── InvitationView.vue    # 邀请好友（活动管理 + 邀请记录查询）
    └── assets/
        └── images/
            └── device-cover.png  # 房间设备封面图
```

---

## 四、路由结构

```
/login                       → Login.vue          （登录页）
/                            → Main.vue            （主布局，包含底部 Tabbar）
  ├─ /                       → HomeView.vue        （首页/数据中心）
  ├─ /category               → CategoryView.vue    （商品分类）
  ├─ /product                → ProductView.vue     （商品管理）
  ├─ /room-type              → RoomTypeView.vue    （房间类型）
  ├─ /room                   → RoomView.vue        （房间管理）
  ├─ /sign-in                → SignInView.vue      （签到奖励）
  ├─ /banner                 → BannerView.vue      （Banner 广告）
  └─ /invitation             → InvitationView.vue  （邀请好友）
/*                           → redirect to /       （404 兜底）
```

---

## 五、核心业务模块

### 1. 登录认证 (Login.vue)
- 用户名/密码登录，密码使用 **AES-128-CBC** 加密后传输
- 图形验证码（Base64 图片 + UUID 关联），点击刷新
- 登录成功后 Token 存入 localStorage，路由跳转至首页

### 2. 数据中心 (HomeView.vue)
- 4 个统计卡片：总销售额、活跃用户、订单总量、转化率
- ECharts 混合图表：柱状图（浏览量）+ 折线图（访客数）+ 面积图（新增）
- 目前为静态 mock 数据

### 3. 分类管理 (CategoryView.vue)
- **对接后端 API**：`/admin/pinball/shop/category/list`、`/save`、`/delete`
- 卡片列表：分类图标（上传/颜色兜底）、名称、排序号、启禁用开关
- 底部弹出表单：分类名称、图标上传、排序号、状态
- 代码模式：`code === 200` 判定成功

### 4. 商品管理 (ProductView.vue)
- **对接后端 API**：`/admin/pinball/shop/product/page`、`/save`、`/delete`，SKU `/sku/list`、`/sku/save`、`/sku/delete`
- 搜索栏 + 分类/状态筛选（van-popup + van-picker）
- van-pull-refresh 下拉刷新 + van-list 无限滚动分页
- 商品卡片：主图、名称、分类标签、会员专属标记、最低价 SKU 信息、启禁用开关
- 左滑删除（van-swipe-cell）
- 底部弹出表单：名称、分类选择器、简介、主图上传、多图上传、会员专属、排序号、状态、详情 HTML
- **SKU 规格管理**：独立弹窗，列表展示已有 SKU（配图/名称/支付方式/价格/库存/状态），支持新增/编辑/删除
- 图片上传统一使用 `utils/upload.js`

### 5. 房间类型 (RoomTypeView.vue)
- **对接后端 API**：`/admin/pinball/room/pageRoomType` 等
- 字段：名称、出珠比例、投珠上/下限、几珠一卡、积分卡上限、模式（出卡不出珠/既出卡又出珠）
- 完整 CRUD（分页加载、新增、编辑、删除确认）

### 6. 房间管理 (RoomView.vue)
- **对接后端 API**：`/admin/pinball/room/pageRoom` 等
- 双列网格卡片展示：房间封面图、名称、使用状态（空闲/使用中/故障/下线）、在线状态、房间类型
- 编辑/删除操作，新增/编辑关联房间类型选择器

### 7. 签到奖励 (SignInView.vue)
- **对接后端 API**：`/admin/pinball/signIn/getConfig`、`/saveConfig`
- 8 张卡片：连续第 1-7 天 + 默认（超 7 天），每张卡片用 van-stepper 调整弹珠数量
- 一次性提交全部 8 条配置

### 8. Banner 广告 (BannerView.vue)
- **对接后端 API**：`/admin/pinball/banner/listBanner`、`/addBanner`、`/updateBanner`、`/deleteBanner`、`/updateBannerSort`
- 类型 Tab 切换：全部 / 轮播广告 / 拉新活动
- 卡片列表：Banner 图片、类型标签、启禁用开关、标题、排序号、过期时间、跳转链接
- 上移/下移排序、编辑/删除
- 底部弹出表单：标题、类型、跳转链接、排序号、过期时间、图片上传（上传前经 vue-cropper 裁切，比例 357:120）

### 9. 邀请好友 (InvitationView.vue)
- **对接后端 API**：`/admin/pinball/invitation/activity/page`、`/save`、`/delete`，记录 `/record/page`
- 搜索 + 启用状态筛选，van-pull-refresh + van-list 分页
- 活动卡片：名称、说明、时间范围、奖励信息（弹珠/会员积分/积分卡/提现）、邀请上限、实名/充值要求、启禁用开关
- 底部弹出表单：活动名称、说明、时间选择器（van-datetime-picker）、各项奖励、邀请上限、启用/实名/充值要求
- **邀请记录子功能**：独立弹窗，筛选条件（邀请人 ID、被邀请人手机号、状态），分页列表展示记录详情

---

## 六、API 层设计

- 统一入口：`src/api/index.js` 导出的 Axios 实例，挂载到 `window.api`
- **请求拦截器**：自动从 localStorage 读取 token 注入请求头 `token` 字段
- **响应拦截器**：统一解包 `response.data`；遇到 code 401 时清空 token 并跳转 `/login`
- 环境切换：通过 `.env.*` 文件配置 `VITE_API_BASE_URL`
- 统一规范：**`code === 200` 表示请求成功**，否则 toast 出 `message` 字段内容

| 环境 | API 地址 |
|------|----------|
| 默认 (development) | `http://139.224.246.134:6180` |
| test | `http://139.224.246.134:6180` |
| production | `https://www.bingobangai.com/prod-api` |

### 文件上传

- 接口：`POST /admin/pinball/file/upload`（FormData，字段名 `file`）
- 返回值取 `data.filePathUrl`
- 封装在 `src/utils/upload.js`：`uploadFile(file)` 上传并返回 URL，`onUploadRead(detail)` 用于 van-uploader 的 after-read 回调

---

## 七、UI/UX 特点

- **移动端优先**：`#app` 固定宽度 393px，居中显示，带阴影模拟手机屏幕效果
- **页面滚动区**：`page-scroll` 类统一高度
- 主色 `#2563EB`（蓝色），通过 Vant CSS 变量全局覆盖
- 卡片风格：白色圆角 + 浅阴影
- 底部弹出 Popup（van-popup + van-form）用于新增/编辑表单
- 筛选采用 van-popup + van-picker 组合
- 列表页标配 van-pull-refresh 下拉刷新 + van-list 无限滚动分页
- 时间选择使用 van-datetime-picker
- 登录页独立于 Tabbar 布局，使用渐变背景

---

## 八、构建与运行

```bash
# 开发（默认 development 模式）
npm run dev          # → localhost:7200

# 开发（指定环境）
npm run dev:test     # test 模式
npm run dev:prod     # production 模式

# 构建
npm run build        # 默认构建
npm run build:test   # test 模式构建
npm run build:prod   # production 模式构建
```

---

## 九、当前状态与待办

### 已完成
- 整体框架搭建（路由、API 层、样式体系、文件上传工具）
- 9 个业务页面 UI 全部完成（1 首页 + 8 管理页），底部 8 个导航 tab
- 分类管理、商品管理（含 SKU）、签到奖励、Banner 广告、邀请好友（含记录）、房间类型、房间管理已对接后端 API
- 登录页完整流程（验证码 + AES 加密 + Token 存储）
- ECharts 图表集成
- 列表页统一使用下拉刷新 + 无限滚动分页模式

### 待完成
- 首页（HomeView）使用静态 mock 数据，需对接后端 API
- 商品管理 SKU 列表接口已对接，但本地数据与远程同步逻辑待完善
- 无状态管理库（未使用 Pinia/Vuex），跨页面共享数据通过 localStorage 或全局变量
- 无 TypeScript
- 无自动化测试
- 未初始化 Git 仓库
- AES 密钥硬编码在源码中
