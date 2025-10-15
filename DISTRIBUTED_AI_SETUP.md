# Distributed AI Compute Setup

Transform your family's devices into a unified AI compute network using Docker, Tailscale, and Ollama/Open WebUI.

## Overview

Your system now supports:
- **Multiple AI endpoints** across your network
- **Ollama** for direct model access
- **Open WebUI** for advanced features (like DeepSeek R1)
- **Tailscale** for secure device-to-device networking
- **Docker** for easy deployment and management

## Quick Start (30 Minutes)

### Step 1: Install Tailscale on All Devices

**Why Tailscale?**
- Secure peer-to-peer VPN
- Each device gets a stable 100.x.x.x IP
- Works across NATs and firewalls
- Zero configuration networking

**Install:**
```bash
# Mac
brew install tailscale

# Linux
curl -fsSL https://tailscale.com/install.sh | sh

# Windows
# Download from tailscale.com

# After install, authenticate
tailscale up
```

**Get your IP:**
```bash
tailscale ip
# Returns something like: 100.64.15.23
```

### Step 2: Setup Main Compute Node (Desktop/Server)

This is your most powerful machine.

#### Option A: Ollama + Docker

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]  # If you have NVIDIA GPU

volumes:
  ollama_data:
```

**Start:**
```bash
docker-compose up -d
```

**Pull models:**
```bash
docker exec -it ollama ollama pull llama3
docker exec -it ollama ollama pull codellama
docker exec -it ollama ollama pull deepseek-r1:8b
```

#### Option B: Open WebUI + Ollama (Full Stack)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "8080:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    volumes:
      - open-webui_data:/app/backend/data
    restart: unless-stopped
    depends_on:
      - ollama

volumes:
  ollama_data:
  open-webui_data:
```

**Start:**
```bash
docker-compose up -d
```

**Access:**
- Open WebUI: http://localhost:8080
- Ollama API: http://localhost:11434

### Step 3: Add Compute Node to Your App

1. **Open App Settings** (gear icon in header)
2. **Click "Compute Nodes" tab**
3. **Add Node:**
   - Name: "Main Desktop"
   - Endpoint: `http://100.64.15.23:11434` (your Tailscale IP)
   - Type: Ollama (or Open WebUI if using port 8080)
   - Location: Tailscale
4. **Click "Refresh"** to detect online nodes and models
5. **Click a node** to select it as active

### Step 4: Add Secondary Compute Nodes (Optional)

Repeat Step 2 on laptops, other desktops, etc. Each device adds compute power to your network.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│          Your Family Creative Platform              │
│                  (React App)                        │
└───────────┬─────────────────────────────────────────┘
            │
            │ Tailscale Network (100.x.x.x)
            │
    ┌───────┴────────┬────────────┬───────────────┐
    │                │            │               │
┌───┴────┐     ┌────┴─────┐  ┌───┴───┐    ┌─────┴──────┐
│Desktop │     │ Laptop   │  │ Mac   │    │  Old PC    │
│        │     │          │  │       │    │            │
│Ollama  │     │Open WebUI│  │Ollama │    │ Ollama     │
│+GPU    │     │          │  │       │    │(CPU only)  │
└────────┘     └──────────┘  └───────┘    └────────────┘
   Main            Fast UI      Backup      Extra Power
```

## Network Examples

### Single Local Machine
```
Endpoint: http://localhost:11434
Type: Ollama
Use: Development and testing
```

### Tailscale Network
```
Main Desktop:    http://100.64.15.23:11434  (Ollama - GPU)
Laptop:          http://100.64.15.45:8080   (Open WebUI)
Mac Mini:        http://100.64.15.67:11434  (Ollama - CPU)
Old PC:          http://100.64.15.89:11434  (Ollama - Phi-3 only)
```

### Remote Access
```
Home Server:     http://home.yourdomain.com:11434
Cloud Instance:  https://ai.yourcloud.com
```

## Model Recommendations by Device

### High-End Desktop (GPU)
```bash
ollama pull llama3:70b          # Large, powerful
ollama pull codellama:34b       # Advanced coding
ollama pull deepseek-r1:70b     # Best reasoning
```

### Mid-Range Desktop/Laptop
```bash
ollama pull llama3              # Balanced (8B)
ollama pull codellama           # Good coding (7B)
ollama pull deepseek-r1:8b      # Fast reasoning
ollama pull mistral             # Quick responses
```

### Older/Lower-Power Devices
```bash
ollama pull phi3                # Lightweight (3.8B)
ollama pull tinyllama           # Very fast (1.1B)
```

## Open WebUI Benefits

Why use Open WebUI instead of direct Ollama:

1. **Better UI** - Chat interface like ChatGPT
2. **Model Management** - Easy switching between models
3. **Conversation History** - Saved across sessions
4. **Multimodal** - Image understanding with vision models
5. **Tools & Functions** - Extended capabilities
6. **Authentication** - Multi-user support

## Usage Patterns

### Pattern 1: Load Balancing
- Small queries → Laptop (fast, nearby)
- Code generation → Desktop (GPU, powerful)
- Long responses → Server (reliable, always-on)

### Pattern 2: Specialized Models
- Desktop: Code-focused models (CodeLlama)
- Laptop: General chat (Llama3, Mistral)
- Server: Large context models (70B variants)

### Pattern 3: Failover
- Primary: Desktop (most powerful)
- Backup: Laptop (if desktop offline)
- Emergency: Cloud endpoint (if all local offline)

## Troubleshooting

### Node Shows Offline

**Check Tailscale:**
```bash
tailscale status
# Should show connected devices
```

**Check Docker:**
```bash
docker ps
# Should show ollama/open-webui running
```

**Test endpoint:**
```bash
curl http://100.64.15.23:11434/api/tags
# Should return list of models
```

### Cannot Connect from App

1. **Verify Tailscale is running** on both devices
2. **Check firewall** - Allow ports 11434 (Ollama) or 8080 (WebUI)
3. **Test with curl** from the device running the app
4. **Try local IP first** (192.168.x.x) to rule out Tailscale issues

### Slow Responses

1. **Check model size** - Use smaller models on weaker hardware
2. **Monitor resources** - `docker stats` shows CPU/RAM usage
3. **Reduce max tokens** in app settings
4. **Lower temperature** for faster, more focused responses

### Out of Memory

1. **Use smaller models:**
   - 70B → 13B → 8B → 3B
2. **Limit concurrent requests:**
   - Only run one model at a time
3. **Increase Docker memory:**
   ```bash
   # docker-compose.yml
   mem_limit: 16g
   ```

## Performance Tips

### GPU Acceleration

**NVIDIA (Ubuntu/Linux):**
```bash
# Install NVIDIA Docker runtime
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Test
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

**Mac (M1/M2/M3):**
- GPU automatically used, no special setup needed

**AMD:**
- ROCm support available, check Ollama docs

### Network Optimization

**For Tailscale:**
```bash
# Enable direct connections (bypasses relay servers)
tailscale up --accept-routes

# Check connection type
tailscale status
# Look for "direct" not "relay"
```

**For Docker:**
```yaml
# Use host networking for better performance
network_mode: host
```

## Security Best Practices

1. **Tailscale Only** - Don't expose ports to internet
2. **Docker Isolation** - Models run in containers
3. **No Auth Bypass** - Use Open WebUI auth for multi-user
4. **Regular Updates:**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## Cost Comparison

### Traditional Cloud AI (Monthly)
- OpenAI GPT-4: $50-200
- Claude Pro: $20-60
- Gemini Advanced: $20
**Total: $90-280/month**

### Your Distributed AI (One-Time)
- Tailscale: Free (up to 100 devices)
- Docker: Free
- Ollama: Free
- Open WebUI: Free
- Hardware: Already own
**Total: $0/month, unlimited usage**

## Advanced: Dynamic Load Balancing (Future)

Your app is ready for future features:

```typescript
// Coming soon: Automatic node selection
- Query complexity analysis
- Real-time node health monitoring
- Model capability matching
- Latency-based routing
- Automatic failover
```

## Backup & Migration

**Export models:**
```bash
docker cp ollama:/root/.ollama ./ollama-backup
```

**Restore models:**
```bash
docker cp ./ollama-backup ollama:/root/.ollama
docker restart ollama
```

**Backup Open WebUI data:**
```bash
docker cp open-webui:/app/backend/data ./webui-backup
```

## Monitoring

**Check model performance:**
```bash
docker stats ollama
```

**View logs:**
```bash
docker logs -f ollama
docker logs -f open-webui
```

**Model info:**
```bash
docker exec -it ollama ollama list
docker exec -it ollama ollama show llama3
```

---

## Next Steps

1. **Set up main compute node** with Docker + Ollama/WebUI
2. **Install Tailscale** on all family devices
3. **Add nodes** in app settings
4. **Test with @AI** in chat
5. **Optimize** based on your usage patterns
6. **Add more nodes** as needed

**You now have a private, powerful, distributed AI network!**
