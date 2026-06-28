# GitHub Profile CRUD — 需求规格

## 概述

通过 GitHub Personal Access Token，在 Web 界面上对 GitHub 个人主页信息进行查看与编辑，后端使用 Hono + Drizzle 管理 Token 及操作记录，数据库使用 AWS RDS PostgreSQL。

## 项目信息

- 项目名: aws-vpc-demo
- 架构类型: Monorepo（apps/frontend + apps/backend）

## 需求版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-27 | v1   | 初始需求 |

## 用户故事

- 作为用户，我想要输入 GitHub PAT 并保存，以便后续免登录直接操作
- 作为用户，我想要查看当前 GitHub 账号的个人信息，以便了解当前 profile 状态
- 作为用户，我想要通过表单修改 GitHub 个人信息（名称/简介/公司/地址等），以便更新 GitHub profile
- 作为用户，我想要管理多个 GitHub Token（增删查），以便切换不同账号操作

## 功能需求

1. [F-001] Token 管理：用户可录入、查询、删除 GitHub Personal Access Token，Token 存入 RDS
2. [F-002] 读取 GitHub Profile：后端使用选定 Token 调用 `GET /user`，返回用户 profile 数据
3. [F-003] 展示 Profile 表单：前端将 profile 字段（name/bio/company/location/email/blog/twitter_username）渲染为可编辑表单
4. [F-004] 更新 GitHub Profile：用户修改表单后提交，后端调用 `PATCH /user` 写回 GitHub
5. [F-005] 操作记录：后端记录每次读取/更新操作的时间戳和结果到 DB（可选，便于审计）

## 非功能需求

- 性能: GitHub API 调用在 3s 内响应，超时返回友好提示
- 安全: Token 存储时做基础脱敏（只展示前 4 位 + `****`）；HTTPS 传输
- 兼容性: 现代浏览器（Chrome/Safari/Firefox 最新版）
- 部署: AWS 部署由用户自行完成，本次只交付可运行代码

## 验收标准

- [ ] [AC-001] 可添加、列出、删除 GitHub PAT，列表中 Token 做脱敏展示
- [ ] [AC-002] 选择 Token 后，页面正确展示对应 GitHub 账号的 profile 字段
- [ ] [AC-003] 修改表单字段并保存，GitHub 实际 profile 同步更新
- [ ] [AC-004] 后端接口均有统一错误处理，GitHub API 失败时返回可读错误信息
- [ ] [AC-005] 前端表单有基础字段校验（必填项、长度限制）

## 依赖

- GitHub REST API v3（`api.github.com`）
- AWS RDS PostgreSQL（连接串由环境变量注入）
- Node.js 20+，Hono，Drizzle ORM，`pg` driver
- React 18+，Vite

## 开放问题

- Token 是否需要加密存储（如 AWS KMS）？当前版本明文存 DB，后续可加密
- 是否需要多用户隔离？当前版本不含用户认证，Token 全局共享
