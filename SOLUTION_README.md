# HouseUI - Vercel to Local Ollama Connection Solution

## Overview

This solution enables your Vercel-hosted HouseUI frontend to securely connect to local Ollama instances running DeepSeek R1 8B (or any other model) across your private Tailscale network.

## Problem Solved

Your original implementation attempted to make direct browser requests from Vercel to `http://localhost:11434`, which fails due to browser security restrictions. This solution introduces a backend proxy server that bridges the gap between your cloud-hosted frontend and local AI compute.

## Architecture

```
Vercel Frontend (HTTPS)
        ↓
    Tailscale Network
        ↓
Backend Proxy (Node.js)
        ↓
Local Ollama Instance(s)
        ↓
DeepSeek R1 8B Model
```

## What's Included

### 1. Backend Proxy Server (`/backend`)

A Node.js Express server that:
- Proxies requests from your Vercel frontend to local Ollama instances
- Handles CORS for cross-origin requests
- Supports multiple compute nodes for distributed AI
- Provides health checking and automatic node discovery
- Supports WebSocket streaming for real-time responses

**Key Files:**
- `backend/src/server.js` - Main server implementation
- `backend/package.json` - Dependencies
- `backend/docker-compose.yml` - Docker deployment configuration
- `backend/Dockerfile` - Container build instructions
- `backend/.env.example` - Environment variable template

### 2. Updated Frontend Service

A modified AI service that communicates with the backend proxy instead of directly with Ollama.

**Key Files:**
- `src/services/aiService.updated.ts` - New AI service implementation
- `.env.example` - Frontend environment variable template

### 3. Documentation

Comprehensive guides for setup and deployment.

**Key Files:**
- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `backend/README.md` - Backend-specific documentation
- `docs/TAILSCALE_SETUP.md` - Tailscale configuration guide

## Quick Start

### 1. Set Up Backend Proxy

```bash
cd backend
cp .env.example .env
# Edit .env with your settings
npm install
npm start
```

Or use Docker:

```bash
cd backend
docker-compose up -d
docker exec -it houseui-ollama ollama pull deepseek-r1:8b
```

### 2. Set Up Tailscale

```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Authenticate
tailscale up

# Get your IP
tailscale ip -4
```

### 3. Update Frontend

```bash
# Backup original
mv src/services/aiService.ts src/services/aiService.original.ts

# Use new version
mv src/services/aiService.updated.ts src/services/aiService.ts

# Configure environment
cp .env.example .env
# Edit .env with your Tailscale IP
```

### 4. Deploy to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_BACKEND_URL` = `http://YOUR_TAILSCALE_IP:3000`
3. Redeploy

## Features

### Multi-Node Support

Add multiple Ollama instances across your network:

```env
OLLAMA_ENDPOINTS=http://100.64.15.23:11434,http://100.64.15.45:11434,http://100.64.15.67:11434
```

The backend automatically:
- Monitors node health
- Discovers available models
- Routes requests to online nodes

### Distributed Compute

Run different models on different machines:
- **Desktop (GPU)**: Large models (70B)
- **Laptop**: Medium models (8B-13B)
- **Old PC**: Small models (3B-7B)

### Security

- **Tailscale**: End-to-end encrypted VPN
- **No port forwarding**: No exposure to public internet
- **CORS protection**: Only allowed origins can access the backend
- **Zero-trust networking**: Device authentication required

## API Endpoints

The backend proxy provides these endpoints:

- `GET /health` - Health check
- `GET /api/nodes` - List compute nodes
- `GET /api/models` - List available models
- `GET /api/check` - Check Ollama connection
- `POST /api/chat` - Proxy chat completions
- `POST /api/generate` - Proxy text generation

## Troubleshooting

### Backend won't start

```bash
# Check Node.js version
node --version  # Should be 18+

# Check port availability
lsof -i :3000

# Check logs
npm start
```

### Can't connect from Vercel

```bash
# Verify Tailscale is running
tailscale status

# Test backend from another device
curl http://YOUR_TAILSCALE_IP:3000/health

# Check firewall
sudo ufw allow 3000
```

### Ollama not accessible

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
docker restart houseui-ollama
# or
sudo systemctl restart ollama
```

## Next Steps

1. ✅ Backend proxy running
2. ✅ Tailscale configured
3. ✅ Frontend updated
4. ⏭️ Pull DeepSeek R1 8B model: `ollama pull deepseek-r1:8b`
5. ⏭️ Test locally: `npm run dev`
6. ⏭️ Deploy to Vercel with environment variables
7. ⏭️ Test end-to-end from Vercel

## Resources

- **Tailscale**: https://tailscale.com
- **Ollama**: https://ollama.com
- **DeepSeek R1**: https://ollama.com/library/deepseek-r1
- **Vercel**: https://vercel.com/docs

## Support

For issues:
1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review `backend/README.md` for backend-specific help
3. See `docs/TAILSCALE_SETUP.md` for networking configuration

## License

Same as the original HouseUI project.

