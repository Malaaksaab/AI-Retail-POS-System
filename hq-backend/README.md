# 🏢 Multi-Store HQ Backend

Production-grade backend for centralized multi-store management.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run dev

# In separate terminals, start workers
npm run worker:sync
npm run worker:queue
```

### Production (Docker)

```bash
# Using docker-compose (recommended)
docker-compose up -d

# Or build and run individually
docker build -t hq-backend .
docker run -d -p 4000:4000 --env-file .env hq-backend
```

## 📋 Features

- ✅ JWT Authentication + RBAC
- ✅ Multi-store connector system (Supabase, eSaletab, Custom)
- ✅ Queue-based sync with BullMQ + Redis
- ✅ WebSocket real-time events
- ✅ Comprehensive API (REST + WS)
- ✅ Background workers for async tasks
- ✅ Audit logging and monitoring
- ✅ Rate limiting and security

## 🔧 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run worker:sync  # Start sync worker
npm run prisma:*     # Prisma commands
npm run lint         # Lint code
npm test             # Run tests
```

## 📚 Documentation

See [HQ_IMPLEMENTATION_GUIDE.md](../HQ_IMPLEMENTATION_GUIDE.md) for complete setup and usage instructions.

## 🏗️ Architecture

```
src/
├── config/         # Configuration management
├── db/             # Database connection (Prisma)
├── middleware/     # Express middleware (auth, etc.)
├── routes/         # API routes
├── services/       # Business logic
├── sync/           # Store connector system
├── queue/          # Queue management (BullMQ)
├── workers/        # Background workers
├── websocket/      # WebSocket server
├── utils/          # Utilities (logger, errors, etc.)
├── app.ts          # Express app
└── server.ts       # Server entry point
```

## 🔐 Environment Variables

See `.env.example` for all available configuration options.

## 📊 Monitoring

- Health Check: `GET /health`
- Queue Stats: `GET /api/v1/sync/queue-stats`
- Prisma Studio: `npm run prisma:studio`

## 🚢 Deployment

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Redis
- HQ Backend API
- Sync Worker

### Using PM2

```bash
npm run build
pm2 start dist/server.js --name hq-backend
pm2 start dist/workers/syncWorker.js --name sync-worker
pm2 save
```

## 📝 License

MIT
