# Vending UI - Smart Vending Machine Kiosk & Admin Dashboard

React & Vite frontend UI for the IoT Smart Vending Machine Platform.

## Features

- **Interactive Kiosk Interface**: Touchscreen UI for product selection, live inventory display, and payment flows.
- **Real-Time Telemetry & Socket.IO**: Live updates for machine status, temperature telemetry, and vend operations.
- **Admin Dashboard Shell**: Inventory management, sales analytics, hardware controls, and audio playlist management.
- **Backend Integration**: Configured to connect directly to the deployed NestJS API at `https://vending-backend-b19g.onrender.com`.

## Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=https://vending-backend-b19g.onrender.com/api
VITE_SOCKET_URL=https://vending-backend-b19g.onrender.com
VITE_DEV_BACKEND_URL=https://vending-backend-b19g.onrender.com
```

## Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```
