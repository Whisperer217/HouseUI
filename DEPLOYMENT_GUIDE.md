# HouseUI Deployment Guide: Connecting Vercel to Local AI with Tailscale

This guide provides a complete solution to connect your Vercel-hosted HouseUI frontend to a local Ollama instance running on your private network. It uses a backend proxy and Tailscale to enable secure, distributed AI compute.

## The Challenge

Directly connecting a Vercel-hosted application to a local service (like Ollama on `http://localhost:11434`) is not possible due to browser security restrictions (CORS, mixed content, and private network access).

## The Solution

We solve this by introducing a **backend proxy server** that runs on your local network and acts as a secure bridge.

### Architecture Overview

1.  **Vercel Frontend**: Your React application, deployed on Vercel.
2.  **Tailscale**: A secure networking service that connects your devices and gives them stable private IP addresses.
3.  **Backend Proxy**: A Node.js server that runs on your local machine, is accessible via Tailscale, and forwards requests to Ollama.
4.  **Ollama**: Your local AI model server, running models like DeepSeek R1 8B.

This architecture allows your Vercel app to securely communicate with any of your local AI compute nodes from anywhere in the world.

## What's Included in This Solution

-   **Backend Proxy Server**: A new `backend` directory containing a Node.js Express server.
-   **Updated Frontend Service**: A modified `src/services/aiService.ts` that communicates with the backend proxy.
-   **Docker Configuration**: A `docker-compose.yml` for easy deployment of the backend proxy and Ollama.
-   **Comprehensive Documentation**: Detailed setup instructions for the backend, frontend, and Tailscale.

## Step-by-Step Setup

Follow these sections in order to get your system running.

---



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



## Tailscale Setup



# Tailscale Setup Guide for HouseUI

This guide will help you set up Tailscale to enable secure, distributed AI compute across your devices.

## What is Tailscale?

Tailscale creates a secure, private network (VPN) between your devices, giving each device a stable IP address (like `100.64.15.23`) that works across any network. This allows your Vercel-hosted frontend to communicate with your local Ollama instances securely.

## Benefits

- **Secure**: End-to-end encrypted connections
- **Simple**: No port forwarding or firewall configuration needed
- **Reliable**: Stable IPs that don't change
- **Cross-platform**: Works on Windows, Mac, Linux, iOS, Android, Roku
- **Free**: Up to 100 devices on personal plan

## Installation

### Step 1: Install Tailscale on Your Main Compute Node

This is the machine that will run Ollama and the backend proxy (usually your most powerful computer).

#### Windows

1. Download from https://tailscale.com/download/windows
2. Run the installer
3. Click "Sign in" and authenticate with your account

#### Mac

```bash
brew install tailscale
```

Or download from https://tailscale.com/download/mac

#### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

#### After Installation

Authenticate and start Tailscale:

```bash
tailscale up
```

This will open a browser window to authenticate. Sign in with Google, Microsoft, or GitHub.

### Step 2: Get Your Tailscale IP

Once connected, get your Tailscale IP address:

```bash
tailscale ip -4
```

Example output: `100.64.15.23`

**Save this IP - you'll need it for configuration!**

### Step 3: Install Tailscale on Additional Devices (Optional)

For distributed compute, install Tailscale on other machines:

- Desktop computers
- Laptops
- Servers
- Even old PCs (for lightweight models)

Repeat Step 1 and Step 2 on each device.

## Configuration

### Backend Proxy Configuration

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env file:**
   ```bash
   nano .env  # or use your preferred editor
   ```

4. **Configure for single node:**
   ```env
   PORT=3000
   OLLAMA_ENDPOINTS=http://localhost:11434
   ALLOWED_ORIGINS=http://localhost:5173
   ```

5. **Or configure for multiple Tailscale nodes:**
   ```env
   PORT=3000
   OLLAMA_ENDPOINTS=http://100.64.15.23:11434,http://100.64.15.45:11434,http://100.64.15.67:11434
   ALLOWED_ORIGINS=http://localhost:5173
   ```

### Frontend Configuration

1. **Navigate to project root:**
   ```bash
   cd /path/to/HouseUI
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env file:**
   ```bash
   nano .env
   ```

4. **For local development:**
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

5. **For Tailscale access (from other devices):**
   ```env
   VITE_BACKEND_URL=http://100.64.15.23:3000
   ```
   Replace `100.64.15.23` with your actual Tailscale IP.

### Vercel Configuration

For your production Vercel deployment:

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add new variable:**
   - Name: `VITE_BACKEND_URL`
   - Value: `http://100.64.15.23:3000` (your Tailscale IP)
   - Environment: Production (and Preview if desired)

5. **Redeploy:**
   ```bash
   git push
   ```
   Or click "Redeploy" in Vercel dashboard.

## Starting Services

### Option 1: Docker Compose (Recommended)

```bash
cd backend
docker-compose up -d
```

This starts both Ollama and the backend proxy.

### Option 2: Separate Services

**Terminal 1 - Start Ollama:**
```bash
ollama serve
```

**Terminal 2 - Start Backend Proxy:**
```bash
cd backend
npm install
npm start
```

## Verification

### 1. Check Tailscale Connection

```bash
tailscale status
```

You should see all your devices listed with their IPs.

### 2. Test Backend Proxy

From the machine running the backend:
```bash
curl http://localhost:3000/health
```

From another device on Tailscale:
```bash
curl http://100.64.15.23:3000/health
```

### 3. Test Ollama Connection

```bash
curl http://localhost:3000/api/check
```

Should return:
```json
{
  "connected": true,
  "onlineNodes": 1,
  "totalNodes": 1
}
```

### 4. Test from Frontend

1. Start your frontend:
   ```bash
   npm run dev
   ```

2. Open browser to http://localhost:5173

3. Open browser console (F12)

4. Try the AI chat feature

5. Check for successful API calls to your backend

## Distributed Compute Setup

To use multiple machines for AI compute:

### 1. Install Ollama on Each Machine

**Machine 1 (Main Desktop - GPU):**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull large models
ollama pull deepseek-r1:8b
ollama pull llama3
```

**Machine 2 (Laptop - CPU):**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull medium models
ollama pull deepseek-r1:8b
ollama pull mistral
```

**Machine 3 (Old PC - CPU):**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull lightweight models
ollama pull phi3
ollama pull tinyllama
```

### 2. Get Tailscale IPs for All Machines

On each machine:
```bash
tailscale ip -4
```

Example output:
- Machine 1: `100.64.15.23`
- Machine 2: `100.64.15.45`
- Machine 3: `100.64.15.67`

### 3. Configure Backend with All Endpoints

Edit `backend/.env`:
```env
PORT=3000
OLLAMA_ENDPOINTS=http://100.64.15.23:11434,http://100.64.15.45:11434,http://100.64.15.67:11434
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Start Backend Proxy

```bash
cd backend
npm start
```

### 5. Verify All Nodes

```bash
curl http://localhost:3000/api/nodes | jq
```

Should show all three nodes with their status and available models.

## Network Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Tailscale Network                  │
│                  (100.64.0.0/10)                    │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼─────┐  ┌──────▼─────┐
│   Desktop    │  │   Laptop   │  │   Old PC   │
│ 100.64.15.23 │  │100.64.15.45│  │100.64.15.67│
│              │  │            │  │            │
│ Ollama       │  │ Ollama     │  │ Ollama     │
│ + Backend    │  │            │  │            │
│   Proxy      │  │            │  │            │
└──────────────┘  └────────────┘  └────────────┘
        ▲
        │
        │ HTTPS
        │
┌───────┴──────────────────────────────────────┐
│         Vercel Frontend                      │
│    https://your-app.vercel.app               │
│                                              │
│    VITE_BACKEND_URL=                         │
│    http://100.64.15.23:3000                  │
└──────────────────────────────────────────────┘
```

## Security Considerations

### Firewall Configuration

Tailscale handles most security, but you may want to configure your firewall:

**Allow Tailscale interface:**
```bash
# Ubuntu/Debian
sudo ufw allow in on tailscale0
```

**Or allow specific ports only on Tailscale:**
```bash
sudo ufw allow from 100.64.0.0/10 to any port 3000
sudo ufw allow from 100.64.0.0/10 to any port 11434
```

### HTTPS (Optional)

For production, consider using Tailscale HTTPS:

```bash
tailscale cert your-machine-name.your-tailnet.ts.net
```

Then configure your backend to use HTTPS.

## Troubleshooting

### Cannot Connect to Tailscale IP

**Check Tailscale is running:**
```bash
tailscale status
```

**Ping the device:**
```bash
ping 100.64.15.23
```

**Check if device is online:**
```bash
tailscale status | grep 100.64.15.23
```

### Backend Not Accessible

**Check backend is running:**
```bash
curl http://localhost:3000/health
```

**Check it's listening on all interfaces:**
```bash
netstat -tuln | grep 3000
```

Should show `0.0.0.0:3000`, not `127.0.0.1:3000`.

**Check firewall:**
```bash
sudo ufw status
```

### Ollama Not Accessible

**Check Ollama is running:**
```bash
curl http://localhost:11434/api/tags
```

**Check from Tailscale network:**
```bash
curl http://100.64.15.23:11434/api/tags
```

**Restart Ollama:**
```bash
# If using Docker
docker restart houseui-ollama

# If using system service
sudo systemctl restart ollama
```

### CORS Errors

**Update ALLOWED_ORIGINS in backend/.env:**
```env
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

**Restart backend:**
```bash
cd backend
npm start
```

### Slow Performance

**Check network latency:**
```bash
tailscale ping 100.64.15.23
```

**Use direct connection (not relay):**
```bash
tailscale status
# Look for "direct" connections, not "relay"
```

**Enable direct connections:**
```bash
tailscale up --accept-routes
```

## Advanced Configuration

### Custom Tailscale ACLs

For more control, configure ACLs in Tailscale admin console:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*:3000", "*:11434"]
    }
  ]
}
```

### MagicDNS

Enable MagicDNS in Tailscale for easier addressing:

Instead of: `http://100.64.15.23:3000`
Use: `http://desktop.your-tailnet.ts.net:3000`

### Exit Nodes

Use a Tailscale exit node to access your network from anywhere:

```bash
tailscale up --exit-node=100.64.15.23
```

## Mobile Access

To access your HouseUI from mobile devices:

1. **Install Tailscale on your phone**
   - iOS: App Store
   - Android: Google Play

2. **Connect to your Tailscale network**

3. **Open browser to:**
   ```
   http://100.64.15.23:5173  (if running dev server)
   ```
   Or your Vercel URL (which will connect to backend via Tailscale)

## Roku TV Setup (Future)

For Roku TV access:

1. Tailscale doesn't have native Roku support
2. Options:
   - Run Tailscale on your router (subnet routing)
   - Use a Tailscale exit node
   - Expose backend via Cloudflare Tunnel (less secure)

## Next Steps

1. ✅ Tailscale installed and configured
2. ✅ Backend proxy running and accessible
3. ⏭️ Pull DeepSeek R1 8B model
4. ⏭️ Update frontend code to use new aiService
5. ⏭️ Deploy to Vercel with environment variables
6. ⏭️ Test end-to-end connection

## Resources

- Tailscale Documentation: https://tailscale.com/kb
- Tailscale Admin Console: https://login.tailscale.com/admin
- Ollama Documentation: https://ollama.com/docs
- DeepSeek R1 Model: https://ollama.com/library/deepseek-r1



## Frontend Setup



This guide explains how to configure the HouseUI frontend to connect to the new backend proxy.

### Prerequisites

- Node.js 18+ and npm installed
- Git installed

### Step 1: Clone the Repository

```bash
git clone https://github.com/Whisperer217/HouseUI.git
cd HouseUI
```

### Step 2: Update AI Service

The `src/services/aiService.ts` file has been updated to communicate with the backend proxy instead of directly with Ollama. The new file is `src/services/aiService.updated.ts`.

**Action:**

1.  **Backup the original file:**
    ```bash
    mv src/services/aiService.ts src/services/aiService.original.ts
    ```

2.  **Rename the updated file:**
    ```bash
    mv src/services/aiService.updated.ts src/services/aiService.ts
    ```

### Step 3: Configure Environment Variables

1.  **Create a `.env` file** in the root of the project:
    ```bash
    cp .env.example .env
    ```

2.  **Edit the `.env` file** to point to your backend proxy. Open the file in a text editor:
    ```bash
    nano .env
    ```

3.  **Update the `VITE_BACKEND_URL`:**

    -   **For local development (backend running on the same machine):**
        ```env
        VITE_BACKEND_URL=http://localhost:3000
        ```

    -   **For connecting via Tailscale (from a different device on your Tailscale network):**
        ```env
        VITE_BACKEND_URL=http://<YOUR_TAILSCALE_IP>:3000
        ```
        Replace `<YOUR_TAILSCALE_IP>` with the Tailscale IP of the machine running the backend proxy.

4.  **Update your Supabase credentials** (if you are using the project creation features):
    ```env
    VITE_SUPABASE_URL=your-supabase-url
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

### Step 4: Install Dependencies and Run

1.  **Install npm packages:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Open your browser** to the URL shown in the terminal (usually `http://localhost:5173`).

### Step 5: Vercel Deployment

When you are ready to deploy to Vercel, you need to set the `VITE_BACKEND_URL` environment variable in your Vercel project settings.

1.  **Go to your Vercel Dashboard** and select your HouseUI project.
2.  Navigate to **Settings > Environment Variables**.
3.  Add a new environment variable:
    -   **Name:** `VITE_BACKEND_URL`
    -   **Value:** `http://<YOUR_TAILSCALE_IP>:3000` (Use the Tailscale IP of your backend server).
    -   **Environments:** Select Production, Preview, and Development.
4.  **Trigger a new deployment** by pushing a commit to your Git repository or using the Vercel CLI.

Your Vercel-hosted application will now be able to securely connect to your local AI compute cluster through the backend proxy and Tailscale.

