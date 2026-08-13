import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { registerRoomHandlers } from './handlers/roomHandlers.js';
import { registerGameHandlers } from './handlers/gameHandlers.js';
import { validateAwsConfig } from './config/aws.js';
import { sqsService } from './services/SqsService.js';
import { roomService } from './services/RoomService.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// =====================================
// ROTAS HTTP
// =====================================

/**
 * Root endpoint
 */
app.get('/', (_req, res) => {
  res.json({
    message: 'Dominó Online - Backend API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      info: '/info',
      sqs_debug: '/debug/sqs-queues',
    },
    websocket: 'Socket.IO events available after connection',
  });
});

/**
 * Health check
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    awsConfigured: validateAwsConfig(),
  });
});

/**
 * Info do servidor
 */
app.get('/info', (_req, res) => {
  res.json({
    name: 'Dominó Online - Backend',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    awsRegion: process.env.AWS_REGION || 'none',
    sqsConfigured: validateAwsConfig(),
  });
});

/**
 * Listar filas SQS disponíveis (debug)
 */
app.get('/debug/sqs-queues', async (_req, res) => {
  const queues = await sqsService.listQueues();
  res.json({ queues });
});

// =====================================
// SOCKET.IO HANDLERS
// =====================================

io.on('connection', (socket) => {
  console.log(`\n✅ Cliente conectado: ${socket.id}`);

  // Registrar handlers de sala
  registerRoomHandlers(io, socket);

  // Registrar handlers de jogo
  registerGameHandlers(io, socket);

  socket.on('disconnect', () => {
    const result = roomService.leaveBySocketId(socket.id);

    if (result.success && result.roomCode) {
      if (result.hostLeft) {
        io.to(result.roomCode).emit('room_closed', {
          success: false,
          error: 'O host saiu da sala. A sala foi encerrada.',
          roomCode: result.roomCode,
        });
        io.in(result.roomCode).socketsLeave(result.roomCode);
      } else if (!result.roomDeleted) {
        io.to(result.roomCode).emit('player_left_notify', {
          playerName: result.playerName,
          players: result.players,
          message: `${result.playerName} saiu da sala`,
        });
      }
    }

    console.log(`\n❌ Cliente desconectado: ${socket.id}\n`);
  });
});

// =====================================
// INICIALIZAÇÃO
// =====================================

httpServer.listen(PORT, () => {
  const awsStatus = validateAwsConfig() ? '✅' : '⚠️';
  console.log(`
╔════════════════════════════════════════╗
║  🎮 DOMINÓ ONLINE - SERVIDOR INICIADO  ║
╠════════════════════════════════════════╣
║  Porta: ${PORT.toString().padEnd(33)} ║
║  Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(27)} ║
║  AWS SQS: ${awsStatus.padEnd(31)} ║
╚════════════════════════════════════════╝

📡 URLs:
  - Backend: http://localhost:${PORT}
  - Health: http://localhost:${PORT}/health
  - Frontend: ${process.env.CLIENT_URL || 'http://localhost:5173'}

🔐 CORS Origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}
  `);
});
