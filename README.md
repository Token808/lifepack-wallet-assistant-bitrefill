# LifePack Wallet Assistant

LifePack Wallet Assistant is a Token UI based web wallet demo that turns a crypto wallet into an AI-powered commerce assistant for Bitrefill.

Users describe what they need in daily life, and the wallet recommends the right Bitrefill product, chooses a suitable crypto payment method, simulates TokenCore signing, tracks the order state, and delivers a digital item such as a gift card, payment card, or eSIM inside the wallet UI.

## Project Type

Web wallet demo

## Core Idea

Most wallets only show balances and transactions. LifePack Wallet Assistant makes the wallet actionable:

- "I am going to Japan for 5 days."
- "I need a virtual card for online shopping."
- "I want to send my gamer friend a gift."

The assistant turns these intents into Bitrefill purchase flows:

- Travel Pack: eSIM + payment card
- Shopping Pack: prepaid card + e-commerce gift card
- Gift Pack: Steam gift card + shareable gift claim flow

## Features

- Token UI based wallet interface
- Asset-aware payment recommendation
- AI shopping assistant conversation
- Bitrefill product pack recommendation
- Expandable payment method selector
- TokenCore-compatible signing simulation
- Order status timeline
- Digital delivery area for redemption codes or eSIM information

Supported payment methods shown in the demo:

- Bitcoin
- Lightning
- Ethereum
- USDC
- USDT
- Binance Pay
- Litecoin
- Dogecoin
- Solana
- Dash

## Token UI Usage

This project is built on the official `consenlabs/token-ui` starter kit.

The demo uses shared `@repo/ui` components, including:

- `Card`
- `Button`
- `Badge`
- `AssetRow`
- `ChatBubble`
- `Input`
- `StepCard`
- `toast`

These components are used to build the wallet asset panel, AI assistant, payment selector, order card, signing status, and delivery state.

## TokenCore-compatible Flow

The current demo uses a TokenCore-compatible adapter to represent the wallet layer:

- wallet connection
- asset reading
- invoice payment preparation
- local signing simulation
- payment confirmation state

The adapter is intentionally mock-based for demo safety. It does not expose private keys, does not perform real signing, and does not trigger real payments.

In a production implementation, the adapter can be replaced with real TokenCore / `tcx-wasm` logic.

## Bitrefill Integration Concept

Bitrefill provides the commerce layer:

- product catalog search
- product details
- invoice creation
- payment tracking
- digital code or eSIM delivery

The demo currently uses high-fidelity mock data for the Bitrefill flow. The UI and adapter structure are designed so the mock catalog and invoice tracking can be replaced with real Bitrefill Agents / API integration.

## Safety Design

The demo follows these safety principles:

- private keys are never displayed
- payments require explicit user confirmation
- the payment asset is shown before signing
- product region and order information are visible
- digital delivery is shown only after the payment flow completes

## Tech Stack

- Vite
- React
- TypeScript
- pnpm
- Token UI `@repo/ui`

## Run Locally

Requirements:

- Node.js `>=22.12.0`
- pnpm `10.33.0`

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

## Vercel Deployment

This repository includes `vercel.json`.

The production build outputs the Vite app to `apps/web/dist`.

Recommended Vercel settings:

- Framework Preset: Vite
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm --filter @repo/web build`
- Output Directory: `apps/web/dist`

## Submission Description

LifePack Wallet Assistant combines Token UI wallet components with Bitrefill commerce scenarios. Users describe a real-world need, and the wallet recommends products, selects a crypto payment method, simulates TokenCore-compatible signing, tracks the order state, and delivers the digital item inside the wallet interface.

The project uses Token UI for the wallet interface and a TokenCore-compatible adapter for wallet connection, asset reading, and signing flow simulation.
