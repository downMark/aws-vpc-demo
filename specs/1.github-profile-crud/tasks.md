# GitHub Profile CRUD — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-27 | v1   | 初始任务 |

## 项目信息

- 项目名: aws-vpc-demo
- 架构类型: Monorepo（npm workspaces）
- specs 路径: specs/1.github-profile-crud/

---

## 任务列表

### 功能 1: 项目脚手架搭建

- [x] T-001: 初始化 Monorepo 结构（根 package.json + npm workspaces，apps/frontend + apps/backend 目录）~15min
- [x] T-002: 初始化 apps/backend（package.json、tsconfig、Hono 入口、`src/index.ts` 健康检查路由 `GET /health`）~15min
- [x] T-003: 初始化 apps/frontend（Vite + React + TypeScript，配置 vite proxy 转发 `/api` 到后端）~15min

### 功能 2: 数据库层（Drizzle + PostgreSQL）

- [x] T-004: 配置 Drizzle（`drizzle.config.ts`、DB 连接 `src/db/index.ts`、`.env.example` 含 DATABASE_URL）~15min
- [x] T-005: 定义 Drizzle schema（`tokens` 表、`operation_logs` 表）并生成 migration ~20min

### 功能 3: 后端服务层

- [x] T-006: 实现 TokenService（create/list/delete），列表返回脱敏 token ~20min
- [x] T-007: 实现 GitHubService（`getProfile`、`updateProfile`，封装 fetch + 错误处理）~20min
- [x] T-008: 实现 Hono 路由（`/api/tokens` CRUD、`/api/github/profile` GET+PATCH）+ 统一错误中间件 ~30min

### 功能 4: 前端表单与页面

- [x] T-009: 实现 TokenManager 页面（TokenList + TokenForm，展示脱敏列表、新增、删除）~30min
- [x] T-010: 实现 ProfileEditor 页面（ProfileForm：加载 profile、展示只读字段、可编辑字段、保存）~30min
- [x] T-011: 前端路由与布局（React Router，主页 Token 管理、Profile 编辑页，顶部导航）~15min

### 集成与验证

- [x] T-012: 联调准备（代码验证通过，启动说明见 README；AWS 部署由用户自行完成）~30min

---

## 依赖关系

- T-004 依赖 T-002（后端初始化完成后配置 Drizzle）
- T-005 依赖 T-004
- T-006、T-007 依赖 T-005
- T-008 依赖 T-006、T-007
- T-009、T-010 依赖 T-003、T-008（前端依赖后端接口）
- T-011 依赖 T-009、T-010
- T-012 依赖 T-011

## 风险点

- **GitHub API Rate Limit**：未认证请求 60 次/小时，PAT 认证后 5000 次/小时；测试时注意不要频繁调用
- **RDS 本地连接**：本地开发时需要配置 RDS 安全组允许本机 IP，或使用本地 PostgreSQL 替代
- **Drizzle migration**：首次 `db:push` 需要 DB 已创建并且 DATABASE_URL 正确配置
- **PATCH /user 字段限制**：GitHub 只允许修改特定字段，邮箱和头像不可通过此接口修改
