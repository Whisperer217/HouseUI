# CRN Interface

**Your Family's Resilience Network**

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-MVP-green.svg)](https://github.com/Whisperer217/HouseUI)
[![Kickstarter](https://img.shields.io/badge/kickstarter-coming%20soon-orange.svg)](https://kickstarter.com)

> **Built by [Command Domains](https://commanddomains.com) - Turning trauma into innovations for civilian resilience.**

---

## 🎖️ About

**CRN Interface** (Civilian Resilience Network Interface) is a revolutionary local AI platform that combines powerful artificial intelligence with life-saving emergency medical guidance. Built by a combat medic who's seen what happens when help doesn't arrive in time.

### The Mission

Command Domains was founded on a simple principle: **trauma to innovations**. We take lessons learned from the battlefield and turn them into technologies that build resilience for civilian families.

CRN Interface is our flagship product - the first step in creating a comprehensive Civilian Resilience Network that empowers families with:

- 🏥 **Emergency Medical Guidance** - Life-saving protocols when seconds count
- 🔒 **Privacy-First AI** - Your data never leaves your home
- 💰 **One-Time Purchase** - Own it forever, no subscriptions
- 🛡️ **Future-Ready** - Part of a patent-pending ecosystem

---

## ✨ Features

### Available Now (MVP)

#### 🏥 Emergency Medical Guidance
Combat medic-validated protocols for life-threatening emergencies:
- **CPR** - Step-by-step cardiac arrest response
- **Severe Bleeding** - Stop the Bleed protocols
- **Choking** - Heimlich maneuver guidance
- **Shock** - Trauma response procedures

Each protocol includes:
- Visual step-by-step instructions
- Progress tracking
- 911 integration
- Critical safety warnings

#### 🤖 Local AI Assistant
- Powered by DeepSeek R1 (8B model)
- Runs entirely on your hardware
- No cloud dependency
- Streaming responses
- Voice input support
- Multi-model support (Llama, Mistral, etc.)

#### 🔐 License System
- One-time purchase model
- 5 license tiers (Trial to Founder)
- Hardware fingerprinting
- Offline validation
- Multi-device support

#### 📦 Simple Installation
- One-click installers for Windows, macOS, Linux
- Auto-installs all dependencies
- Desktop shortcuts
- No technical knowledge required

### Coming Soon (Roadmap)

#### 🛡️ AI Elder Security
Military-grade protection for your digital home:
- Network traffic monitoring
- Anomaly detection AI
- Frequency-hopping protocol (SINCGARS-inspired)
- Automated threat response

#### 💰 Compute-to-Earn
Turn spare computing power into passive income:
- Resource monitoring
- Marketplace integration
- Job scheduling
- Payment processing

#### 🎨 Creator Economy
Control and monetize your digital assets:
- Asset verification (YouTube, social media)
- IP lending platform
- Collateral management
- Royalty distribution

---

## 🚀 Quick Start

### Prerequisites

**Minimum Requirements:**
- OS: Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)
- RAM: 8GB (16GB recommended)
- Storage: 10GB free space
- CPU: 4-core processor (8-core recommended)

**Recommended:**
- RAM: 16GB+
- Storage: 20GB+ SSD
- CPU: 8-core processor
- GPU: NVIDIA GPU with 8GB+ VRAM (optional)

### Installation

#### Windows
```powershell
# Download and run the installer
curl -O https://github.com/Whisperer217/HouseUI/raw/main/installer/install-windows.ps1
.\install-windows.ps1
```

#### macOS / Linux
```bash
# One-line install
curl -fsSL https://raw.githubusercontent.com/Whisperer217/HouseUI/main/installer/install-unix.sh | bash

# Or download and run manually
curl -O https://raw.githubusercontent.com/Whisperer217/HouseUI/main/installer/install-unix.sh
chmod +x install-unix.sh
./install-unix.sh
```

The installer will:
1. ✅ Install Node.js (if needed)
2. ✅ Install Ollama (if needed)
3. ✅ Download DeepSeek R1 8B model
4. ✅ Install CRN Interface
5. ✅ Create desktop shortcut
6. ✅ Set up command alias (Unix)

### First Launch

1. **Activate Your License**
   - Start a 14-day free trial, OR
   - Enter your license key (format: `CRNIF-XXXXX-XXXXX-XXXXX-XXXXX`)

2. **Wait for Model Load**
   - First launch takes 4-5 seconds to load the AI model
   - Subsequent launches are faster

3. **Start Using**
   - Chat with your AI assistant
   - Access emergency medical guidance
   - Explore features based on your license tier

---

## 📊 License Tiers

| Feature | Trial | Standard | Family | Resilience | Founder |
|---------|-------|----------|--------|------------|---------|
| **Price** | FREE | $49.99 | $99.99 | $149.99 | $249.99 |
| **Duration** | 14 days | Lifetime | Lifetime | Lifetime | Lifetime |
| **Devices** | 1 | 1 | 3 | 5 | 10 |
| Basic AI | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat & Voice | ✅ | ✅ | ✅ | ✅ | ✅ |
| Emergency Medical | ❌ | ✅ | ✅ | ✅ | ✅ |
| Smart Home | ❌ | ✅ | ✅ | ✅ | ✅ |
| Family Profiles | ❌ | ❌ | ✅ | ✅ | ✅ |
| AI Elder Security | ❌ | ❌ | ❌ | ✅ | ✅ |
| Compute-to-Earn | ❌ | ❌ | ❌ | ✅ | ✅ |
| Creator Economy | ❌ | ❌ | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ❌ | ❌ | ✅ |

### Get a License

- **Free Trial:** Start using CRN Interface immediately with a 14-day trial
- **Purchase:** Visit our [Kickstarter campaign](https://kickstarter.com/projects/crn-interface) (coming soon)
- **Enterprise:** Contact sales@commanddomains.com

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CRN Interface                        │
│                  (React + TypeScript)                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTP/WebSocket
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Backend Proxy                          │
│                 (Node.js + Express)                     │
│  ┌──────────────┬──────────────┬──────────────────┐    │
│  │   License    │   AI Proxy   │   Emergency      │    │
│  │   Service    │   Service    │   Medical        │    │
│  └──────────────┴──────────────┴──────────────────┘    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ HTTP
                      │
┌─────────────────────▼───────────────────────────────────┐
│                    Ollama                               │
│              (Local AI Runtime)                         │
│  ┌──────────────┬──────────────┬──────────────────┐    │
│  │  DeepSeek R1 │   Llama 3    │    Mistral       │    │
│  │     8B       │     8B       │      7B          │    │
│  └──────────────┴──────────────┴──────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Key Components

**Frontend (React + TypeScript + Vite)**
- Modern, responsive UI
- Real-time AI streaming
- Emergency medical interface
- License activation modal
- Voice input support

**Backend (Node.js + Express)**
- License management service
- AI proxy with load balancing
- Multi-node Ollama support
- WebSocket streaming
- Health monitoring

**AI Runtime (Ollama)**
- Local model execution
- Multiple model support
- GPU acceleration (optional)
- Efficient memory management

---

## 🛠️ Development

### Prerequisites

- Node.js 20.11.0+
- npm or pnpm
- Ollama installed locally
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/Whisperer217/HouseUI.git
cd HouseUI

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Start Ollama (if not running)
ollama serve

# Pull the DeepSeek R1 model
ollama pull deepseek-r1:8b
```

### Running Locally

**Terminal 1: Backend**
```bash
cd backend
npm start
# Backend runs on http://localhost:3000
```

**Terminal 2: Frontend**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### Building for Production

```bash
# Build frontend
npm run build

# Build backend (if using Docker)
cd backend
docker build -t crn-interface-backend .
```

### Project Structure

```
HouseUI/
├── src/                      # Frontend source
│   ├── components/           # React components
│   │   ├── LicenseModal.tsx
│   │   └── EmergencyMedical.tsx
│   ├── services/             # Frontend services
│   │   ├── aiService.ts
│   │   └── licenseService.ts
│   └── App.tsx               # Main app component
├── backend/                  # Backend source
│   ├── src/
│   │   ├── server.js         # Main server
│   │   ├── licenseService.js # License management
│   │   └── licenseRoutes.js  # License API
│   └── data/                 # Data storage (JSON)
├── installer/                # Installation scripts
│   ├── install-windows.ps1
│   ├── install-unix.sh
│   └── README.md
├── docs/                     # Documentation
└── README.md                 # This file
```

---

## 🔒 Privacy & Security

### Your Data is Yours

CRN Interface is built on a **privacy-first** philosophy:

✅ **All AI processing happens locally** - Your conversations never leave your device  
✅ **No telemetry** - We don't track your usage  
✅ **No analytics** - We don't collect analytics data  
✅ **No cloud sync** - Everything stays on your device  
✅ **No ads** - We don't show ads or sell your data  

### What Data Goes Online

Only for license activation and validation:
- License key (encrypted)
- Hardware fingerprint (hashed, no PII)
- Activation timestamp

**Optional features** (disabled by default):
- Compute-to-Earn marketplace (if you enable it)
- Creator economy (if you enable it)

### Security Features

- Hardware fingerprinting for device activation
- Offline license validation
- Encrypted license storage
- SHA-256 hashing for hardware IDs
- No personal information collected

---

## 🤝 Contributing

We welcome contributions! However, please note:

- **Code:** Open for contributions (see [CONTRIBUTING.md](CONTRIBUTING.md))
- **IP:** All intellectual property is owned by Command Domains
- **License:** Proprietary software with one-time purchase model

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Keep commits atomic and well-described

---

## 📖 Documentation

- **Installation Guide:** [installer/README.md](installer/README.md)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **API Documentation:** Coming soon
- **User Manual:** Coming soon

---

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to AI"**
```bash
# Check if Ollama is running
ollama list

# Start Ollama if not running
ollama serve

# Restart CRN Interface
```

**"License activation failed"**
- Check internet connection
- Verify license key format (CRNIF-XXXXX-XXXXX-XXXXX-XXXXX)
- Contact support@commanddomains.com

**"Performance is slow"**
- Close other applications
- Ensure 8GB+ RAM available
- Consider upgrading to 16GB+ RAM
- Use GPU acceleration if available

### Getting Help

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/Whisperer217/HouseUI/issues)
- **Email:** support@commanddomains.com
- **Discord:** Coming soon
- **Reddit:** r/CRNInterface (coming soon)

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ License system
- ✅ Emergency medical guidance
- ✅ Local AI assistant
- ✅ Simple installer
- ✅ Cross-platform support

### Phase 2: AI Elder Security (Q2 2025)
- Network traffic monitoring
- Anomaly detection AI
- Frequency-hopping protocol
- Automated threat response

### Phase 3: Compute-to-Earn (Q3 2025)
- Resource monitoring
- Marketplace backend
- Job scheduler
- Payment system

### Phase 4: Creator Economy (Q4 2025)
- Asset verification
- Lending platform
- Collateral management
- Royalty distribution

### Phase 5: Cross-Platform Expansion (2026)
- Roku TV app
- iOS app (React Native)
- Android app (React Native)
- Smart home integrations

---

## 📜 License

**Proprietary Software**

© 2025 Command Domains. All rights reserved.

CRN Interface is proprietary software licensed under a one-time purchase model:

- **Personal Use:** Included with license purchase
- **Commercial Use:** Contact sales@commanddomains.com
- **Source Code Access:** Available to Founder tier license holders
- **Redistribution:** Not permitted without written permission

For licensing inquiries: legal@commanddomains.com

---

## 🎖️ About Command Domains

**Command Domains** was founded by a combat medic who saw firsthand what happens when help doesn't arrive in time. Our mission is simple: **turn trauma into innovations** that build resilience for civilian families.

### Our Philosophy

We believe that:
- **Privacy is a right**, not a luxury
- **Ownership matters** - you should own your tools, not rent them
- **Technology should empower**, not exploit
- **Life-saving knowledge** should be accessible to everyone

### Our Products

- **CRN Interface** - Your family's resilience network (flagship product)
- **AI Elder** - Military-grade home security (coming soon)
- **Compute-to-Earn** - Passive income marketplace (coming soon)
- **Creator Economy** - Digital asset platform (coming soon)

### Contact

- **Website:** https://commanddomains.com
- **Email:** hello@commanddomains.com
- **Support:** support@commanddomains.com
- **Sales:** sales@commanddomains.com
- **Legal:** legal@commanddomains.com

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Node.js](https://nodejs.org/) - Backend runtime
- [Express](https://expressjs.com/) - Web framework
- [Ollama](https://ollama.ai/) - Local AI runtime
- [DeepSeek](https://www.deepseek.com/) - AI models

Special thanks to:
- The veteran community for their support
- Privacy advocates who inspired this project
- Open source contributors who made this possible
- Early backers who believed in the vision

---

## 🚀 Get Started

Ready to build resilience for your family?

1. **Try it free:** [Start 14-day trial](#installation)
2. **Back us:** [Kickstarter campaign](https://kickstarter.com/projects/crn-interface) (coming soon)
3. **Join us:** [Discord community](https://discord.gg/crn-interface) (coming soon)

---

**CRN Interface - Your Family's Resilience Network**

**Built by Command Domains. Trauma to Innovations.**

**© 2025 Command Domains. All rights reserved.** 🎖️

