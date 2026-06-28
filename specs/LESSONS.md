# LESSONS.md — 架构决策与踩坑记录

## 2026-06-27 — github-profile-crud / 环境与工具链

**pnpm vs npm workspaces 混用问题**：根 `package.json` 声明了 `"workspaces": ["apps/*"]`（npm 语法），但 DB engineer 用 pnpm 安装依赖，导致各 app 目录出现 `pnpm-lock.yaml` 和 `pnpm-workspace.yaml`。实际运行正常（pnpm 兼容 npm workspace 配置），但后续若用 `npm install` 在根目录运行会产生冲突。**建议**：统一选择一个包管理器（推荐 pnpm），根目录补充 `pnpm-workspace.yaml`。

## 2026-06-27 — github-profile-crud / 前端 export 风格不一致

T-009 生成的 `TokenManager.tsx` 使用 `export default`，T-010 生成的 `ProfileEditor.tsx` 使用命名导出 `export function`。导致 T-011 写 `App.tsx` 时 import 方式不同，出现 TS2613 类型错误。**规则**：同一项目内页面组件统一使用 `export default`，组件库组件使用命名导出。

## 2026-06-27 — github-profile-crud / GitHub PAT scope 要求

调用 `GET /user` 需要 PAT 包含 `user` scope（或至少 `read:user`）；`PATCH /user` 需要 `user` scope（写权限）。Classic PAT 和 Fine-grained PAT 的 scope 命名不同，README 中已注明需要 `user` scope。
