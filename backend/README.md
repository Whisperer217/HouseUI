# HouseUI Backend Proxy

This backend proxy server bridges your Vercel-hosted frontend with local Ollama instances, enabling secure communication across your Tailscale network.

## Features

- **CORS-enabled proxy** for Vercel frontend
- **Multi-node support** for distributed compute
- **Automatic health checking** of Ollama instances
- **WebSocket streaming** for real-time responses
- **Tailscale integration** for secure networking
- **Docker support** for easy deployment

## Quick Start

### Option 1: Node.js (Direct)

**Prerequisites:**
- Node.js 18+ installed
- Ollama running locally or on Tailscale network

**Steps:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Verify it's running:**
   ```bash
   curl http://localhost:3000/health
   ```

### Option 2: Docker Compose (Recommended)

This option runs both Ollama and the backend proxy in containers.

**Prerequisites:**
- Docker and Docker Compose installed
- (Optional) NVIDIA GPU with nvidia-docker for GPU acceleration

**Steps:**

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Pull DeepSeek R1 8B model:**
   ```bash
   docker exec -it houseui-ollama ollama pull deepseek-r1:8b
   ```

3. **Check status:**
   ```bash
   docker-compose ps
   curl http://localhost:3000/health
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f backend-proxy
   ```

### Option 3: Standalone (Existing Ollama)

If you already have Ollama running, just run the backend proxy:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cat > .env << EOF
   PORT=3000
   OLLAMA_ENDPOINTS=http://localhost:11434
   ALLOWED_ORIGINS=http://localhost:5173
   EOF
   ```

3. **Start proxy:**
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

**PORT** (default: 3000)
- Port for the backend proxy server

**OLLAMA_ENDPOINTS** (default: http://localhost:11434)
- Comma-separated list of Ollama endpoints
- Examples:
  - Single local: `http://localhost:11434`
  - Multiple Tailscale nodes: `http://100.64.15.23:11434,http://100.64.15.45:11434`
  - Mixed: `http://localhost:11434,http://100.64.15.23:11434`

**ALLOWED_ORIGINS** (default: http://localhost:5173,http://localhost:3000)
- Comma-separated list of allowed CORS origins
- Note: `*.vercel.app` is automatically allowed

### Example Configurations

**Local development:**
```env
PORT=3000
OLLAMA_ENDPOINTS=http://localhost:11434
ALLOWED_ORIGINS=http://localhost:5173
```

**Tailscale network:**
```env
PORT=3000
OLLAMA_ENDPOINTS=http://100.64.15.23:11434,http://100.64.15.45:11434
ALLOWED_ORIGINS=http://localhost:5173
```

**Production (Tailscale + Vercel):**
```env
PORT=3000
OLLAMA_ENDPOINTS=http://100.64.15.23:11434
ALLOWED_ORIGINS=https://your-app.vercel.app
```

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T14:00:00.000Z",
  "nodes": [...]
}
```

### GET /api/nodes
List all compute nodes and their status.

**Response:**
```json
{
  "nodes": [
    {
      "id": "node-0",
      "endpoint": "http://localhost:11434",
      "isOnline": true,
      "models": ["deepseek-r1:8b", "llama3"],
      "lastCheck": "2025-10-15T14:00:00.000Z"
    }
  ]
}
```

### GET /api/models
List all available models across all nodes.

**Query Parameters:**
- `endpoint` (optional): Filter by specific endpoint

**Response:**
```json
{
  "models": ["deepseek-r1:8b", "llama3", "codellama"]
}
```

### GET /api/check
Check connection to Ollama nodes.

**Query Parameters:**
- `endpoint` (optional): Check specific endpoint

**Response:**
```json
{
  "connected": true,
  "onlineNodes": 2,
  "totalNodes": 2,
  "nodes": [...]
}
```

### POST /api/chat
Proxy chat completions to Ollama.

**Request:**
```json
{
  "model": "deepseek-r1:8b",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "stream": true,
  "options": {
    "temperature": 0.7,
    "num_predict": 2000
  },
  "endpoint": "http://localhost:11434"  // optional
}
```

**Response:** Streaming JSON (same format as Ollama)

### POST /api/generate
Proxy text generation to Ollama.

**Request:**
```json
{
  "model": "deepseek-r1:8b",
  "prompt": "Write a story about...",
  "stream": true,
  "options": {
    "temperature": 0.7
  }
}
```

**Response:** Streaming JSON (same format as Ollama)

## Tailscale Setup

To use this backend proxy across your network:

1. **Install Tailscale on the machine running the proxy:**
   ```bash
   # Mac
   brew install tailscale
   
   # Linux
   curl -fsSL https://tailscale.com/install.sh | sh
   
   # Windows
   # Download from tailscale.com
   ```

2. **Authenticate:**
   ```bash
   tailscale up
   ```

3. **Get your Tailscale IP:**
   ```bash
   tailscale ip
   # Example output: 100.64.15.23
   ```

4. **Update your Vercel frontend environment variable:**
   ```
   VITE_BACKEND_URL=http://100.64.15.23:3000
   ```

5. **Ensure the proxy is listening on all interfaces:**
   The server already listens on `0.0.0.0`, so it's accessible via Tailscale.

## Distributed Compute Setup

To add multiple Ollama nodes across your network:

1. **Install Ollama on each machine**

2. **Install Tailscale on each machine**

3. **Get Tailscale IPs for each machine:**
   ```bash
   tailscale ip
   ```

4. **Update backend .env:**
   ```env
   OLLAMA_ENDPOINTS=http://100.64.15.23:11434,http://100.64.15.45:11434,http://100.64.15.67:11434
   ```

5. **Restart backend proxy:**
   ```bash
   npm start
   # or
   docker-compose restart backend-proxy
   ```

6. **Verify all nodes are online:**
   ```bash
   curl http://localhost:3000/api/nodes
   ```

## Troubleshooting

### "Cannot connect to Ollama"

**Check Ollama is running:**
```bash
curl http://localhost:11434/api/tags
```

**Check Tailscale connectivity:**
```bash
tailscale status
ping 100.64.15.23
```

**Check firewall:**
```bash
# Allow port 3000 (backend proxy)
sudo ufw allow 3000

# Allow port 11434 (Ollama)
sudo ufw allow 11434
```

### "CORS error in browser"

**Verify ALLOWED_ORIGINS includes your Vercel domain:**
```env
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Check backend logs:**
```bash
# Node.js
npm start

# Docker
docker-compose logs -f backend-proxy
```

### "Node shows offline"

**Test endpoint directly:**
```bash
curl http://100.64.15.23:11434/api/tags
```

**Check Tailscale connection:**
```bash
tailscale ping 100.64.15.23
```

**Restart Ollama:**
```bash
# Docker
docker restart houseui-ollama

# System service
sudo systemctl restart ollama
```

## Performance Tips

### GPU Acceleration

**NVIDIA GPU (Linux):**
1. Install nvidia-docker
2. Uncomment GPU section in docker-compose.yml
3. Restart: `docker-compose up -d`

**Apple Silicon (M1/M2/M3):**
- GPU automatically used, no configuration needed

### Load Balancing

The backend automatically selects the first online node. For custom load balancing:

1. Specify `endpoint` in API requests
2. Frontend can implement round-robin or latency-based selection
3. Future: Automatic load balancing based on node metrics

### Model Management

**Pull models on all nodes:**
```bash
# Node 1
docker exec -it ollama-node1 ollama pull deepseek-r1:8b

# Node 2
docker exec -it ollama-node2 ollama pull llama3

# Node 3
docker exec -it ollama-node3 ollama pull codellama
```

**Optimize by use case:**
- Desktop (GPU): Large models (70B)
- Laptop: Medium models (8B-13B)
- Old PC: Small models (3B-7B)

## Security

### Best Practices

1. **Use Tailscale** - Don't expose ports to internet
2. **Firewall rules** - Only allow necessary ports
3. **HTTPS** - Use Tailscale HTTPS or reverse proxy
4. **Authentication** - Add API keys if needed (future enhancement)

### Tailscale Security

Tailscale provides:
- End-to-end encryption
- Zero-trust networking
- No open ports to internet
- Device authentication

## Monitoring

### Check node status:
```bash
curl http://localhost:3000/api/nodes | jq
```

### Monitor logs:
```bash
# Node.js
npm start

# Docker
docker-compose logs -f
```

### Health check:
```bash
watch -n 5 'curl -s http://localhost:3000/health | jq'
```

## Next Steps

1. ✅ Backend proxy running
2. ⏭️ Update frontend to use backend URL
3. ⏭️ Configure Tailscale networking
4. ⏭️ Pull DeepSeek R1 8B model
5. ⏭️ Test end-to-end connection

## Support

For issues or questions:
- Check logs: `docker-compose logs -f` or `npm start`
- Verify Ollama: `curl http://localhost:11434/api/tags`
- Test Tailscale: `tailscale status`
- Check firewall: `sudo ufw status`

