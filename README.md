# GitHub Profile Manager

通过 GitHub Personal Access Token 在 Web 界面管理 GitHub 个人主页信息（查看 + 编辑）。

## 架构概览

```
aws-vpc-demo/
├── apps/
│   ├── backend/       # Node.js 20 + Hono + Drizzle ORM → 端口 3001
│   └── frontend/      # React 18 + Vite + Tailwind CSS → 端口 5173
└── specs/             # 需求/设计/任务文档
```

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | React 18 + Vite + TypeScript + Tailwind | SPA，本地 `/api` 通过 vite proxy 转发，生产读取 `VITE_API_BASE_URL` |
| 后端 | Hono + Node.js 20 (ESM) | 本地 Node server，生产部署为 AWS Lambda |
| ORM | Drizzle ORM + postgres.js | 管理 Token 存储和操作日志 |
| 数据库 | AWS RDS PostgreSQL | 私有子网内的 tokens 表 + operation_logs 表 |

## 快速开始

### 前置条件

- Node.js 20+，pnpm
- PostgreSQL（本地或 AWS RDS）
- GitHub Personal Access Token（需要 `user` scope）

### 1. 配置环境变量

```bash
cp apps/backend/.env.example apps/backend/.env
# 编辑 .env，填写 DATABASE_URL
# 本地: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/github_profile
# RDS: DATABASE_URL=postgresql://user:pwd@xxx.rds.amazonaws.com:5432/dbname
```

### 2. 安装依赖

```bash
# 在各 app 目录分别安装（当前使用 pnpm）
cd apps/backend && pnpm install
cd ../frontend && pnpm install
```

### 3. 初始化数据库

```bash
cd apps/backend
pnpm db:push      # 将 schema 同步到 DB（首次运行）
```

### 4. 启动服务

```bash
# 终端 1 — 后端
cd apps/backend && pnpm dev    # http://localhost:3001

# 终端 2 — 前端
cd apps/frontend && pnpm dev   # http://localhost:5173
```

验证后端：`curl http://localhost:3001/health` → `{"status":"ok"}`

## 功能模块

### Token 管理页（`/`）

- 录入 GitHub PAT（存储时脱敏展示，前 4 位 + `****`）
- 验证 Token 有效性（调用 `GET /user` 自动获取 `githubLogin`）
- 列出/删除已保存 Token，点击选中某个 Token
- 选中状态写入 `localStorage`，供 Profile 编辑页使用

### Profile 编辑页（`/profile`）

- 读取选中 Token 对应的 GitHub profile
- 可编辑字段：姓名、简介、公司、地址、博客 URL、Twitter
- 只读字段：邮箱、头像、登录名
- 保存时调用 `PATCH /user` 直接更新 GitHub

## API 接口（后端）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/tokens` | 列出所有 Token（脱敏） |
| POST | `/api/tokens` | 新增 Token（body: `{ name, token }`）|
| DELETE | `/api/tokens/:id` | 删除 Token |
| GET | `/api/github/profile?tokenId=` | 读取 GitHub profile |
| PATCH | `/api/github/profile?tokenId=` | 更新 GitHub profile |

## 数据模型

```
tokens            operation_logs
─────────────     ──────────────────────
id (uuid PK)      id (uuid PK)
name              token_id → tokens.id
token (PAT)       action (read/update)
github_login      success (bool)
created_at        error_message
updated_at        created_at
```

## 常用命令

```bash
# 后端
pnpm dev           # 开发模式（tsx watch）
pnpm build         # 编译 TypeScript
pnpm db:generate   # 生成 Drizzle migration 文件
pnpm db:push       # 推送 schema 到 DB（开发用）
pnpm db:migrate    # 执行 migration（生产用）

# 前端
pnpm dev           # Vite 开发服务器
pnpm build         # 生产构建 → dist/
```

## 部署架构

生产环境采用 Cloudflare Pages + AWS SAM：

```text
Cloudflare Pages
  -> HTTP API Gateway
    -> Lambda in your private subnet
      -> your private RDS PostgreSQL
      -> GitHub API via your NAT route
```

AWS 网络和数据库由你在控制台或其它 IaC 中创建并维护。`apps/backend/template.yaml` 只负责创建：

- HTTP API Gateway
- Backend Lambda
- Migration Lambda

部署 Lambda 时需要传入你手动创建好的资源：

- `VpcSubnetIds`：Lambda 使用的私有 subnet，必须能访问 RDS；如果业务要访问 GitHub API，这些 subnet 还需要 NAT 出口
- `VpcSecurityGroupIds`：Lambda security group；RDS security group 需要允许它访问 `5432`
- `DatabaseUrl`：PostgreSQL URL，建议包含 `sslmode=require`

### AWS SAM 部署

前置条件：

- AWS CLI 已配置，当前默认 region 为 `ap-northeast-1`
- SAM CLI 已安装
- Node.js 20+ 和 pnpm

部署命令：

```bash
cd apps/backend
pnpm install
sam validate
sam build
sam deploy --guided
```

`sam deploy --guided` 时重点确认：

- Stack Name：`aws-vpc-demo-backend`
- Region：`ap-northeast-1`
- `FrontendOrigin`：Cloudflare Pages 域名，例如 `https://aws-vpc-demo-frontend.pages.dev`
- `VpcSubnetIds`：例如 `subnet-xxx,subnet-yyy`
- `VpcSecurityGroupIds`：例如 `sg-xxx`
- `DatabaseUrl`：例如 `postgresql://appuser:password@your-rds-endpoint:5432/github_profile?sslmode=require`

部署完成后记录输出的 `ApiUrl`。`ApiUrl` 例如：

```text
https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com
```

### Cloudflare Pages 部署

Cloudflare Pages 项目配置：

- Root directory：`apps/frontend`
- Build command：`pnpm build`
- Build output directory：`dist`
- Environment variable：
  - `VITE_API_BASE_URL=<SAM 输出的 ApiUrl>`

本仓库已提供 `apps/frontend/wrangler.toml`，其中 `VITE_API_BASE_URL` 是占位值；实际生产值建议在 Cloudflare Pages 控制台或 CI 环境变量中设置。

本地验证前端构建：

```bash
cd apps/frontend
pnpm install
pnpm build
```

### 数据库迁移

RDS 在私有子网内，GitHub Actions runner 不直接连接数据库。后端部署会先通过 SAM 更新 Lambda，然后调用同 VPC 内的 Migration Lambda 执行 Drizzle migrations。

修改表结构时：

1. 修改 `apps/backend/src/db/schema.ts`
2. 生成 migration：

```bash
cd apps/backend
pnpm db:generate
```

3. 提交 `apps/backend/drizzle/` 下新增的 migration 文件
4. 运行 `Deploy Backend` workflow，部署后会自动执行 migration

### 后续修改

- 修改后端代码或 `apps/backend/template.yaml` 后，在 `apps/backend` 目录重新执行 `sam build && sam deploy`，CloudFormation 会做增量更新。
- 修改前端代码后，由 Cloudflare Pages 重新构建部署。
- VPC、RDS、subnet、route table、NAT、DB subnet group 不再由本项目 SAM 管理；这些资源变更请在你的网络/数据库侧单独处理。

## GitHub Token 权限

访问 <https://github.com/settings/tokens/new>，Classic Token 勾选 `user` scope（包含读写个人 profile）。
