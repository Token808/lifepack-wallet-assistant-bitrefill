# Wallet UI Starter Kit

[English](./README.md) | [简体中文](./README.zh-CN.md)

## 概览

Wallet UI Starter Kit 是一个极简 React 模板，可快速基于 imToken Design System UI Kit 构建 Web 钱包。

它为 imToken 10 周年共创计划准备：参与者可以克隆模板、运行演示，并让 AI Agent 在保持一致基础质量的前提下扩展 UI。

这个 starter 专注于 UI 组合，不包含生产级钱包连接、签名、托管、后端等逻辑。

## 架构

```text
.
├── apps/
│   └── web/              # Vite + React 演示应用
├── packages/
│   └── ui/               # 共享 UI 组件、tokens 和全局样式
├── tooling/
│   └── tsconfig/         # 共享 TypeScript 配置
├── DESIGN.md             # 设计规则和组件指南
└── AGENTS.md             # AI Agent
```

## 快速开始

克隆到本地：

```bash
git clone https://github.com/consenlabs/token-ui.git your-project-name
cd your-project-name
```

安装依赖并启动演示应用：

```bash
pnpm install
pnpm dev
```

打开 Vite 在终端输出的本地地址，演示应用会从 `@repo/ui` 导入 UI Kit，并且只使用模拟钱包数据。

常用命令：

```bash
pnpm build
pnpm typecheck
pnpm check
pnpm verify
```

## 环境要求

- Node.js `>=22.12.0`
- pnpm `10.33.0`

## 使用 UI Kit

在应用入口中全局引入一次样式：

```tsx
import '@repo/ui/globals.css'
```

直接从 `@repo/ui/components/*` 导入组件：

```tsx
import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
```

Toast 需要同时使用 `Toaster` 宿主组件和 `toast` 辅助方法：

```tsx
import { Toaster } from '@repo/ui/components/sonner'
import { toast } from '@repo/ui/components/toast'

toast.success('Ready')
```

在修改视觉细节前，请先阅读 `DESIGN.md`，并优先使用已有 token、间距、圆角和组件变体。

## AI 辅助开发

本仓库包含 `AGENTS.md`，用于为 AI 编码 Agent 提供项目规则。如果你的工具不会自动读取
Agent 指令文件，请在任务提示词中要求 Agent 在修改前先阅读 `AGENTS.md`。

## 许可证

MIT
