# 变更日志 — 2026-06-27

## Feature 1: github-profile-crud

### 新增

- Monorepo 结构（apps/backend + apps/frontend，npm/pnpm workspaces）
- 后端：Node.js 20 + Hono REST API，端口 3001
  - `GET/POST/DELETE /api/tokens` — Token CRUD，列表脱敏（前 4 位 + `****`）
  - `GET/PATCH /api/github/profile?tokenId=` — GitHub profile 读写
  - 统一错误中间件，GitHubApiError 映射到对应 HTTP 状态码
  - 操作审计日志（operation_logs 表）
- 数据库：Drizzle ORM + postgres.js，schema 含 `tokens` 和 `operation_logs` 两张表
- 前端：React 18 + Vite + Tailwind CSS
  - Token 管理页（TokenList + TokenForm），选中状态持久化到 localStorage
  - Profile 编辑页（ProfileForm），可编辑 name/bio/company/location/blog/twitter_username
  - React Router 导航（Token 管理 `/` + Profile 编辑 `/profile`）

### 关键文件

| 路径 | 说明 |
|------|------|
| `apps/backend/src/index.ts` | Hono 入口，注册路由和中间件 |
| `apps/backend/src/db/schema.ts` | Drizzle schema：tokens + operation_logs |
| `apps/backend/src/services/token.service.ts` | Token CRUD + GitHub login 验证 |
| `apps/backend/src/services/github.service.ts` | GitHub API 封装（8s 超时 + 错误处理）|
| `apps/backend/src/routes/tokens.ts` | Token 路由 |
| `apps/backend/src/routes/github.ts` | GitHub profile 路由 + 操作日志记录 |
| `apps/frontend/src/pages/TokenManager.tsx` | Token 管理页 |
| `apps/frontend/src/pages/ProfileEditor.tsx` | Profile 编辑页 |
| `apps/frontend/src/api/client.ts` | 统一 fetch 封装 |
| `apps/frontend/src/App.tsx` | 路由布局 |

### 架构决策

- **包管理器混用**：开发过程中混用了 npm workspaces（根 package.json）和 pnpm（实际安装）。后续建议在根目录补充 `pnpm-workspace.yaml`，统一使用 pnpm。
- **Token 安全**：PAT 明文存储于 RDS，接口层脱敏。后续如需加密可引入 AWS KMS 或 SSM Parameter Store。
- **前端组件 export 规范**：页面组件统一用 `export default`，防止并行开发时 import 不一致导致 TS 类型错误。
- **GitHub PAT scope**：需要 `user` scope（Classic）或 `read:user`+`user:email` scope（Fine-grained）才能调用 `GET /user` 和 `PATCH /user`。
