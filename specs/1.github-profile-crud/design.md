# GitHub Profile CRUD — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-27 | v1   | 初始设计 |

## 项目架构

- 架构类型: Monorepo
- 目录结构:
  ```
  aws-vpc-demo/
  ├── apps/
  │   ├── frontend/          # React + Vite
  │   └── backend/           # Node.js + Hono + Drizzle
  ├── packages/
  │   └── shared/            # 共享类型定义（可选）
  └── specs/
  ```
- 涉及层: 前端（React）、后端（Hono REST API）、数据库（RDS PostgreSQL via Drizzle）、外部 API（GitHub REST API）

---

## 功能模块设计

### 模块 1: 后端项目初始化（apps/backend）

技术栈：Node.js 20 + Hono + Drizzle ORM + `postgres` (pg) driver

**目录结构:**
```
apps/backend/
├── src/
│   ├── index.ts             # Hono app 入口
│   ├── db/
│   │   ├── schema.ts        # Drizzle schema 定义
│   │   └── index.ts         # DB 连接
│   ├── routes/
│   │   ├── tokens.ts        # Token CRUD 路由
│   │   └── github.ts        # GitHub profile 路由
│   ├── services/
│   │   ├── token.service.ts # Token 业务逻辑
│   │   └── github.service.ts# GitHub API 调用封装
│   └── middleware/
│       └── error.ts         # 统一错误处理
├── drizzle.config.ts
├── package.json
└── .env.example
```

### 模块 2: 数据模型（Drizzle + RDS PostgreSQL）

**tokens 表** — 存储 GitHub PAT：
```typescript
// schema.ts
export const tokens = pgTable('tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),     // 用户自定义备注
  token: varchar('token', { length: 512 }).notNull(),   // GitHub PAT 明文
  githubLogin: varchar('github_login', { length: 100 }), // 关联的 GitHub username
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

**operation_logs 表** — 操作审计（可选，T-008）：
```typescript
export const operationLogs = pgTable('operation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tokenId: uuid('token_id').references(() => tokens.id),
  action: varchar('action', { length: 50 }),  // 'read_profile' | 'update_profile'
  success: boolean('success').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})
```

### 模块 3: GitHub Service

封装对 GitHub API 的调用，统一处理错误和超时：

```typescript
// github.service.ts
export class GitHubService {
  async getProfile(token: string): Promise<GitHubUser>
  async updateProfile(token: string, data: UpdateProfileInput): Promise<GitHubUser>
}
```

**Profile 字段映射（GitHub API `PATCH /user` 支持的字段）：**
| 字段 | GitHub API 字段 | 类型 |
|------|----------------|------|
| 姓名 | `name` | string |
| 简介 | `bio` | string |
| 公司 | `company` | string |
| 地址 | `location` | string |
| 博客 | `blog` | string |
| Twitter | `twitter_username` | string |
| 邮箱（只读） | `email` | string |
| 头像（只读） | `avatar_url` | string |

### 模块 4: Hono 路由层

**Token 路由 `/api/tokens`:**
- `GET /api/tokens` — 列出所有 token（脱敏）
- `POST /api/tokens` — 新增 token
- `DELETE /api/tokens/:id` — 删除 token

**GitHub Profile 路由 `/api/github`:**
- `GET /api/github/profile?tokenId=xxx` — 调用 GitHub API 读取 profile
- `PATCH /api/github/profile?tokenId=xxx` — 调用 GitHub API 更新 profile

### 模块 5: 前端（apps/frontend）

技术栈：React 18 + Vite + TypeScript

**目录结构:**
```
apps/frontend/
├── src/
│   ├── App.tsx
│   ├── pages/
│   │   ├── TokenManager.tsx   # Token 管理页
│   │   └── ProfileEditor.tsx  # Profile 查看/编辑页
│   ├── components/
│   │   ├── TokenForm.tsx      # 新增 Token 表单
│   │   ├── TokenList.tsx      # Token 列表
│   │   └── ProfileForm.tsx    # Profile 编辑表单
│   ├── api/
│   │   └── client.ts          # fetch 封装
│   └── types/
│       └── index.ts           # 共享类型
├── package.json
└── vite.config.ts
```

**ProfileForm 字段设计：**
```
[ 头像（只读展示） ]
姓名 *     [____________]
简介       [____________] （多行）
公司       [____________]
地址       [____________]
博客 URL   [____________]
Twitter    [____________]
邮箱       [____________] （只读）
               [ 保存 ]
```

---

## 接口契约

### Token 接口

```
GET  /api/tokens
Response: [{ id, name, maskedToken, githubLogin, createdAt }]

POST /api/tokens
Body: { name: string, token: string }
Response: { id, name, maskedToken, githubLogin, createdAt }

DELETE /api/tokens/:id
Response: { success: true }
```

### GitHub Profile 接口

```
GET /api/github/profile?tokenId=xxx
Response: {
  login, name, bio, company, location, blog,
  twitter_username, email, avatar_url
}

PATCH /api/github/profile?tokenId=xxx
Body: { name?, bio?, company?, location?, blog?, twitter_username? }
Response: { 同上 }
```

---

## 安全考虑

- Token 在列表接口中脱敏：只返回前 4 位 + `****`，完整 token 不出接口
- 前端通过后端代理调用 GitHub API，不在浏览器中暴露 PAT
- 后端使用环境变量注入 DB 连接串，不硬编码
- 当前版本无用户认证（单用户场景），后续可加 JWT

## 技术决策

| 决策 | 选项 | 理由 |
| ---- | ---- | ---- |
| HTTP Client | `fetch`（原生）| Node 20 内置，无需依赖 |
| 前端状态管理 | React useState/useEffect | 需求简单，无需 Redux/Zustand |
| 样式方案 | Tailwind CSS | 快速布局，无需额外设计 |
| DB 连接 | `drizzle-orm/node-postgres` | Drizzle 官方推荐 PG driver |
| Monorepo 工具 | npm workspaces | 轻量，无需引入 turborepo |
