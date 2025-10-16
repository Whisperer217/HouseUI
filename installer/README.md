# Guardian AI - Installation Guide

**One-click installation for Windows, macOS, and Linux**

## Quick Start

### Windows

1. **Download the installer:**
   ```
   https://guardian-ai.com/download/install-windows.ps1
   ```

2. **Right-click** the downloaded file and select **"Run with PowerShell"**

3. **Follow the prompts** - the installer will:
   - Install Node.js (if needed)
   - Install Ollama (if needed)
   - Download DeepSeek R1 8B model
   - Install Guardian AI
   - Create desktop shortcut

4. **Launch Guardian AI** from your desktop shortcut

### macOS / Linux

1. **Download and run the installer:**
   ```bash
   curl -fsSL https://guardian-ai.com/install.sh | bash
   ```

   Or download manually:
   ```bash
   curl -O https://guardian-ai.com/download/install-unix.sh
   chmod +x install-unix.sh
   ./install-unix.sh
   ```

2. **Follow the prompts** - the installer will:
   - Install Node.js (if needed)
   - Install Ollama (if needed)
   - Download DeepSeek R1 8B model
   - Install Guardian AI
   - Create desktop shortcut and command alias

3. **Launch Guardian AI:**
   ```bash
   guardian-ai
   ```

## What Gets Installed

### System Requirements

**Minimum:**
- **OS:** Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)
- **RAM:** 8GB (16GB recommended)
- **Storage:** 10GB free space
- **CPU:** 4-core processor (8-core recommended)

**Recommended for best performance:**
- **RAM:** 16GB+
- **Storage:** 20GB+ SSD
- **CPU:** 8-core processor
- **GPU:** NVIDIA GPU with 8GB+ VRAM (optional, for faster inference)

### Components Installed

1. **Node.js** (v20.11.0)
   - Required for running the Guardian AI application
   - Includes npm package manager

2. **Ollama** (latest version)
   - Local AI model runtime
   - Runs DeepSeek R1 and other models

3. **DeepSeek R1 8B Model** (~4.7GB)
   - Primary AI model for Guardian AI
   - Runs entirely on your local machine

4. **Guardian AI Application**
   - Frontend interface (React + TypeScript)
   - Backend proxy server (Node.js + Express)
   - License management system
   - Emergency medical guidance
   - All core features

### Installation Locations

**Windows:**
- Guardian AI: `C:\Users\<YourName>\AppData\Local\GuardianAI`
- Ollama: `C:\Program Files\Ollama`
- Models: `C:\Users\<YourName>\.ollama\models`

**macOS:**
- Guardian AI: `~/.guardian-ai`
- Ollama: `/usr/local/bin/ollama`
- Models: `~/.ollama/models`

**Linux:**
- Guardian AI: `~/.guardian-ai`
- Ollama: `/usr/local/bin/ollama`
- Models: `~/.ollama/models`

## First-Time Setup

### 1. License Activation

When you first launch Guardian AI, you'll be prompted to:

**Option A: Start Free Trial**
- Enter your email address
- Get a 14-day trial license
- Full access to all basic features

**Option B: Activate License**
- Enter your license key (format: GRDAI-XXXXX-XXXXX-XXXXX-XXXXX)
- System will activate automatically
- Unlock features based on your license tier

### 2. Initial Model Load

The first time you use the AI:
- DeepSeek R1 model will load into memory (~4-5 seconds)
- Subsequent uses will be faster
- Model stays loaded while Guardian AI is running

### 3. Start Using

Once activated, you can:
- Chat with your AI assistant
- Use emergency medical guidance
- Control smart home devices (if configured)
- Create content and get help with projects

## License Tiers

### Trial (14 days)
- ✅ Basic AI chat
- ✅ Voice input
- ✅ 1 device
- ❌ Emergency medical
- ❌ Compute-to-Earn
- ❌ AI Elder security

### Standard ($49.99)
- ✅ All trial features
- ✅ Emergency medical guidance
- ✅ Smart home integration
- ✅ 1 device
- ✅ Lifetime updates
- ❌ Compute-to-Earn
- ❌ AI Elder security

### Family ($99.99)
- ✅ All standard features
- ✅ Family profiles
- ✅ 3 devices
- ✅ Lifetime updates
- ❌ Compute-to-Earn
- ❌ AI Elder security

### Guardian ($149.99)
- ✅ All family features
- ✅ Advanced security
- ✅ Compute-to-Earn marketplace
- ✅ AI Elder protection
- ✅ 5 devices
- ✅ Lifetime updates
- ❌ Creator economy

### Founder ($249.99)
- ✅ All guardian features
- ✅ Creator economy access
- ✅ Priority support
- ✅ 10 devices
- ✅ Lifetime updates
- ✅ Early access to new features

## Troubleshooting

### Installation Issues

**"Node.js installation failed"**
- Manually download from: https://nodejs.org
- Install Node.js v20.11.0 or later
- Re-run Guardian AI installer

**"Ollama installation failed"**
- Manually download from: https://ollama.ai
- Install Ollama
- Re-run Guardian AI installer

**"Model download failed"**
- Check internet connection
- Ensure 10GB+ free disk space
- Manually run: `ollama pull deepseek-r1:8b`

### Runtime Issues

**"Cannot connect to AI"**
- Ensure Ollama service is running
- Check if model is loaded: `ollama list`
- Restart Guardian AI

**"License activation failed"**
- Check internet connection
- Verify license key format
- Contact support: support@guardian-ai.com

**"Performance is slow"**
- Close other applications
- Ensure 8GB+ RAM available
- Consider upgrading to 16GB+ RAM
- Use GPU acceleration if available

### Getting Help

**Documentation:**
- https://guardian-ai.com/docs

**Support:**
- Email: support@guardian-ai.com
- Discord: https://discord.gg/guardian-ai
- GitHub: https://github.com/Whisperer217/HouseUI/issues

**Community:**
- Reddit: r/GuardianAI
- Twitter: @GuardianAI_

## Uninstallation

### Windows

1. Run PowerShell as Administrator:
   ```powershell
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\GuardianAI"
   ```

2. Uninstall Ollama (optional):
   - Control Panel → Programs → Uninstall Ollama

3. Uninstall Node.js (optional):
   - Control Panel → Programs → Uninstall Node.js

### macOS / Linux

1. Run the uninstall command:
   ```bash
   rm -rf ~/.guardian-ai
   ```

2. Remove command alias:
   - Edit `~/.bashrc` or `~/.zshrc`
   - Remove the `guardian-ai` alias line

3. Uninstall Ollama (optional):
   ```bash
   sudo rm /usr/local/bin/ollama
   rm -rf ~/.ollama
   ```

4. Uninstall Node.js (optional):
   - macOS: `brew uninstall node`
   - Linux: `sudo apt remove nodejs`

## Privacy & Security

### What Data Stays Local

- ✅ All AI conversations
- ✅ All user data
- ✅ All models and weights
- ✅ All configurations

### What Data Goes Online

- ❌ License activation (one-time, encrypted)
- ❌ License validation (periodic, minimal)
- ❌ Optional: Compute-to-Earn marketplace (if enabled)
- ❌ Optional: Creator economy (if enabled)

### Your Data is Yours

- **No telemetry** - We don't track your usage
- **No analytics** - We don't collect analytics data
- **No cloud sync** - Everything stays on your device
- **No ads** - We don't show ads or sell your data

## Updates

### Automatic Updates

Guardian AI checks for updates weekly:
- Security patches: Auto-installed
- Feature updates: Notification shown
- Major versions: Manual approval required

### Manual Updates

**Windows:**
```powershell
cd $env:LOCALAPPDATA\GuardianAI
git pull
npm install
cd backend
npm install
```

**macOS / Linux:**
```bash
cd ~/.guardian-ai
git pull
npm install
cd backend
npm install
```

## Advanced Configuration

### Custom Ollama Endpoint

Edit `backend/.env`:
```
OLLAMA_ENDPOINTS=http://localhost:11434,http://192.168.1.100:11434
```

### Custom Models

Add models via Ollama:
```bash
ollama pull llama3:8b
ollama pull mistral:7b
```

Then select in Guardian AI settings.

### Network Access

To access from other devices:
1. Configure backend to listen on `0.0.0.0`
2. Open firewall port 3000
3. Access via: `http://<your-ip>:5173`

### GPU Acceleration

Guardian AI automatically uses GPU if available:
- NVIDIA: CUDA support via Ollama
- AMD: ROCm support via Ollama
- Apple Silicon: Metal support via Ollama

## Building from Source

For developers who want to build from source:

```bash
# Clone repository
git clone https://github.com/Whisperer217/HouseUI.git
cd HouseUI

# Install dependencies
npm install
cd backend
npm install
cd ..

# Run development mode
npm run dev

# In another terminal
cd backend
npm start
```

## Contributing

We welcome contributions! See:
- https://github.com/Whisperer217/HouseUI/blob/main/CONTRIBUTING.md

## License

Guardian AI is proprietary software with a one-time purchase license.

- **Personal Use:** Included with license purchase
- **Commercial Use:** Contact sales@guardian-ai.com
- **Source Code:** Available to Founder tier license holders

---

**Built by a combat medic who's seen what trauma does and wants to help families stay safe.**

**© 2025 Guardian AI. All rights reserved.**

