const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// ── In-memory session store ────────────────────────────────────────────────
// socketId -> { userId, role, name, socket }
const clients = new Map();

// ── Health check endpoint ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  const connected = [];
  clients.forEach(({ userId, role, name }) => connected.push({ userId, role, name }));
  res.json({
    status: 'online',
    connectedClients: connected.length,
    clients: connected,
  });
});

// ── WebSocket logic ───────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  // ── 1. REGISTER ──────────────────────────────────────────────────────
  // Every device must register after connecting.
  // Payload: { userId, role: 'admin' | 'cashier', name }
  socket.on('register', ({ userId, role, name }) => {
    if (!userId || !role || !name) return;

    clients.set(socket.id, { userId, role, name, socket });
    console.log(`  Registered → ${name} [${role}] (userId: ${userId})`);

    // Tell this client their registration was accepted
    socket.emit('registered', { ok: true, userId, role, name });

    // Notify all admins that a cashier came online
    if (role === 'cashier') {
      broadcastToAdmins('cashier_online', {
        cashierId: userId,
        cashierName: name,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ── 2. ADMIN → ASSIGN CASHIER TO INVENTORY MODE ──────────────────────
  // Payload: { cashierId, cashierName }
  socket.on('assign_inventory', ({ cashierId, cashierName }) => {
    const sender = clients.get(socket.id);
    if (!sender || sender.role !== 'admin') {
      socket.emit('error', { message: 'Only admins can assign modes.' });
      return;
    }

    console.log(`  [ASSIGN] ${sender.name} → ${cashierName} set to INVENTORY`);

    broadcastToCashier(cashierId, 'mode_changed', {
      mode: 'inventory',
      assignedBy: sender.name,
      message: `${sender.name} assigned you to Inventory Mode.`,
      timestamp: new Date().toISOString(),
    });

    // Echo confirmation to admin
    socket.emit('assign_confirmed', {
      cashierId,
      cashierName,
      mode: 'inventory',
    });
  });

  // ── 3. ADMIN → ASSIGN CASHIER BACK TO CASHIER MODE ───────────────────
  // Payload: { cashierId, cashierName }
  socket.on('assign_cashier', ({ cashierId, cashierName }) => {
    const sender = clients.get(socket.id);
    if (!sender || sender.role !== 'admin') return;

    console.log(`  [ASSIGN] ${sender.name} → ${cashierName} set to CASHIER`);

    broadcastToCashier(cashierId, 'mode_changed', {
      mode: 'cashier',
      assignedBy: sender.name,
      message: `${sender.name} switched you back to Cashier Mode.`,
      timestamp: new Date().toISOString(),
    });

    socket.emit('assign_confirmed', {
      cashierId,
      cashierName,
      mode: 'cashier',
    });
  });

  // ── 4. CASHIER → INVENTORY ACTION (add / edit / delete item) ─────────
  // Payload: { action, item, cashierName }
  // action: 'add_item' | 'edit_item' | 'delete_item' | 'add_supply' | 'edit_supply' | 'delete_supply'
  socket.on('inventory_action', ({ action, item, cashierName }) => {
    const sender = clients.get(socket.id);
    if (!sender || sender.role !== 'cashier') return;

    const payload = {
      action,
      item,
      cashierId: sender.userId,
      cashierName: sender.name,
      timestamp: new Date().toISOString(),
    };

    console.log(`  [INVENTORY] ${sender.name} → ${action}:`, item?.name ?? item?.id ?? '');

    broadcastToAdmins('inventory_update', payload);
  });

  // ── 5. DISCONNECT ─────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const client = clients.get(socket.id);
    if (client) {
      console.log(`[-] Disconnected: ${client.name} [${client.role}]`);
      if (client.role === 'cashier') {
        broadcastToAdmins('cashier_offline', {
          cashierId: client.userId,
          cashierName: client.name,
          timestamp: new Date().toISOString(),
        });
      }
      clients.delete(socket.id);
    }
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────

function broadcastToAdmins(event, data) {
  clients.forEach(({ role, socket: s }) => {
    if (role === 'admin') s.emit(event, data);
  });
}

function broadcastToCashier(cashierId, event, data) {
  clients.forEach(({ userId, socket: s }) => {
    if (userId === cashierId) s.emit(event, data);
  });
}

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🍵 Maifah POS Sync Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/\n`);
});
