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

