# Maifah POS Sync Server

Real-time WebSocket relay between Admin and Cashier devices.

## Setup

```bash
cd server
npm install
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Deploy Options

### Option A — Local Network (easiest for testing)
Run on a PC/laptop connected to the same WiFi as both Android devices.
```
http://YOUR_PC_IP:3001
```
Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

### Option B — Cloud (Railway, Render, Fly.io — free tiers)
1. Push the `server/` folder to GitHub
2. Connect to Railway/Render
3. Set PORT env variable if needed (Railway auto-sets it)
4. Use the public URL they give you

## Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| PORT     | 3001    | Port to listen on |

## Health Check
Visit `http://YOUR_SERVER:3001/` to see connected clients.

## Events Reference

### Client → Server
| Event | Sender | Payload | Description |
|-------|--------|---------|-------------|
| `register` | All | `{ userId, role, name }` | Must be sent after connecting |
| `assign_inventory` | Admin | `{ cashierId, cashierName }` | Put cashier in inventory mode |
| `assign_cashier` | Admin | `{ cashierId, cashierName }` | Switch cashier back to cashier mode |
| `inventory_action` | Cashier | `{ action, item, cashierName }` | Notify admin of inventory change |

### Server → Client
| Event | Receiver | Payload | Description |
|-------|----------|---------|-------------|
| `registered` | All | `{ ok, userId, role, name }` | Registration confirmed |
| `mode_changed` | Cashier | `{ mode, assignedBy, message }` | Admin changed your mode |
| `inventory_update` | Admin | `{ action, item, cashierId, cashierName, timestamp }` | Cashier did something |
| `cashier_online` | Admin | `{ cashierId, cashierName }` | Cashier connected |
| `cashier_offline` | Admin | `{ cashierId, cashierName }` | Cashier disconnected |
| `assign_confirmed` | Admin | `{ cashierId, cashierName, mode }` | Assignment confirmed |
