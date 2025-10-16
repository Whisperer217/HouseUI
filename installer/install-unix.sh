#!/bin/bash

# CRN Interface - macOS/Linux Installer
# One-click installation script for Unix-based systems

set -e

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Installation path
INSTALL_PATH="${HOME}/.crn-interface"

echo -e "${CYAN}========================================"
echo -e "   CRN Interface - Unix Installer"
echo -e "   Your Family's AI Assistant"
echo -e "========================================${NC}"
echo ""

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    echo -e "${GREEN}✓ Detected: macOS${NC}"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    echo -e "${GREEN}✓ Detected: Linux${NC}"
else
    echo -e "${RED}✗ Unsupported operating system: $OSTYPE${NC}"
    exit 1
fi

echo ""

# Step 1: Check Node.js
echo -e "${CYAN}[1/6] Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${YELLOW}Installing Node.js...${NC}"
    
    if [[ "$OS" == "macos" ]]; then
        # Install Homebrew if not present
        if ! command -v brew &> /dev/null; then
            echo "  Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        
        echo "  Installing Node.js via Homebrew..."
        brew install node
    elif [[ "$OS" == "linux" ]]; then
        # Install Node.js via NodeSource
        echo "  Installing Node.js via NodeSource..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    echo -e "${GREEN}✓ Node.js installed successfully${NC}"
fi

echo ""

# Step 2: Check Ollama
echo -e "${CYAN}[2/6] Checking Ollama...${NC}"
if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version)
    echo -e "${GREEN}✓ Ollama found: $OLLAMA_VERSION${NC}"
else
    echo -e "${YELLOW}Installing Ollama...${NC}"
    
    echo "  Downloading Ollama installer..."
    curl -fsSL https://ollama.ai/install.sh | sh
    
    echo -e "${GREEN}✓ Ollama installed successfully${NC}"
fi

echo ""

# Step 3: Start Ollama service
echo -e "${CYAN}[3/6] Starting Ollama service...${NC}"

# Check if Ollama is already running
if pgrep -x "ollama" > /dev/null; then
    echo -e "${GREEN}✓ Ollama service already running${NC}"
else
    echo "  Starting Ollama service..."
    if [[ "$OS" == "macos" ]]; then
        # On macOS, Ollama runs as a background service
        ollama serve > /dev/null 2>&1 &
    elif [[ "$OS" == "linux" ]]; then
        # On Linux, start as systemd service or background process
        if systemctl is-active --quiet ollama; then
            sudo systemctl start ollama
        else
            ollama serve > /dev/null 2>&1 &
        fi
    fi
    sleep 3
    echo -e "${GREEN}✓ Ollama service started${NC}"
fi

echo ""

# Step 4: Download DeepSeek R1 Model
echo -e "${CYAN}[4/6] Checking DeepSeek R1 model...${NC}"

if ollama list | grep -q "deepseek-r1:8b"; then
    echo -e "${GREEN}✓ DeepSeek R1 8B model already installed${NC}"
else
    echo -e "${YELLOW}Downloading DeepSeek R1 8B model (this may take a while)...${NC}"
    ollama pull deepseek-r1:8b
    echo -e "${GREEN}✓ DeepSeek R1 8B model downloaded${NC}"
fi

echo ""

# Step 5: Create Installation Directory
echo -e "${CYAN}[5/6] Creating installation directory...${NC}"

if [ ! -d "$INSTALL_PATH" ]; then
    mkdir -p "$INSTALL_PATH"
    echo -e "${GREEN}✓ Created: $INSTALL_PATH${NC}"
else
    echo -e "${GREEN}✓ Directory exists: $INSTALL_PATH${NC}"
fi

echo ""

# Step 6: Install CRN Interface
echo -e "${CYAN}[6/6] Installing CRN Interface...${NC}"

# Download CRN Interface package
GUARDIAN_URL="https://github.com/Whisperer217/HouseUI/archive/refs/heads/main.zip"
GUARDIAN_ZIP="/tmp/crn-interface.zip"

echo "  Downloading CRN Interface..."
curl -L -o "$GUARDIAN_ZIP" "$GUARDIAN_URL"

echo "  Extracting files..."
unzip -q -o "$GUARDIAN_ZIP" -d "$INSTALL_PATH"

# Move files from subdirectory to install path
SUBDIR=$(find "$INSTALL_PATH" -maxdepth 1 -type d | tail -n 1)
if [ "$SUBDIR" != "$INSTALL_PATH" ]; then
    mv "$SUBDIR"/* "$INSTALL_PATH/"
    rm -rf "$SUBDIR"
fi

echo "  Installing dependencies..."
cd "$INSTALL_PATH"
npm install --silent

echo "  Installing backend dependencies..."
cd "$INSTALL_PATH/backend"
npm install --silent

echo -e "${GREEN}✓ CRN Interface installed successfully${NC}"
echo ""

# Create start script
echo -e "${CYAN}Creating start script...${NC}"

cat > "$INSTALL_PATH/start-crn-interface.sh" << 'EOF'
#!/bin/bash

# CRN Interface Startup Script

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${CYAN}Starting CRN Interface...${NC}"
echo ""

# Start Ollama if not running
if ! pgrep -x "ollama" > /dev/null; then
    echo "Starting Ollama service..."
    ollama serve > /dev/null 2>&1 &
    sleep 3
fi

# Get installation directory
INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start backend
echo "Starting backend..."
cd "$INSTALL_DIR/backend"
npm start > /tmp/guardian-backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Start frontend
echo "Starting frontend..."
cd "$INSTALL_DIR"
npm run dev > /tmp/guardian-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

echo ""
echo -e "${GREEN}CRN Interface is running!${NC}"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Opening in browser..."
sleep 2

# Open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5173
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:5173 2>/dev/null || sensible-browser http://localhost:5173 2>/dev/null
fi

echo ""
echo "Press Ctrl+C to stop CRN Interface"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping CRN Interface...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
EOF

chmod +x "$INSTALL_PATH/start-crn-interface.sh"

# Create desktop shortcut (if desktop environment is available)
if [ -d "$HOME/Desktop" ]; then
    cat > "$HOME/Desktop/CRN Interface.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=CRN Interface
Comment=Your Family's AI Assistant
Exec=$INSTALL_PATH/start-crn-interface.sh
Icon=$INSTALL_PATH/public/favicon.ico
Terminal=true
Categories=Utility;Application;
EOF
    chmod +x "$HOME/Desktop/CRN Interface.desktop"
    echo -e "${GREEN}✓ Desktop shortcut created${NC}"
fi

# Create command line alias
SHELL_RC=""
if [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
elif [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
fi

if [ -n "$SHELL_RC" ]; then
    if ! grep -q "crn-interface" "$SHELL_RC"; then
        echo "" >> "$SHELL_RC"
        echo "# CRN Interface" >> "$SHELL_RC"
        echo "alias crn-interface='$INSTALL_PATH/start-crn-interface.sh'" >> "$SHELL_RC"
        echo -e "${GREEN}✓ Command alias added to $SHELL_RC${NC}"
    fi
fi

echo ""

# Installation Complete
echo -e "${GREEN}========================================"
echo -e "   Installation Complete!"
echo -e "========================================${NC}"
echo ""
echo -e "${CYAN}CRN Interface has been installed to:${NC}"
echo -e "  $INSTALL_PATH"
echo ""
echo -e "${CYAN}To start CRN Interface:${NC}"
echo -e "  1. Run: crn-interface"
echo -e "  2. Or double-click 'CRN Interface' on your desktop"
echo -e "  3. Or run: $INSTALL_PATH/start-crn-interface.sh"
echo ""
echo -e "${CYAN}First-time setup:${NC}"
echo -e "  1. Enter your license key (or start a free trial)"
echo -e "  2. Wait for the AI model to load (first time only)"
echo -e "  3. Start chatting with your AI assistant!"
echo ""
echo -e "${CYAN}Need help? Visit: https://crn-interface.com/support${NC}"
echo ""

# Ask to start now
read -p "Would you like to start CRN Interface now? (Y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}Starting CRN Interface...${NC}"
    "$INSTALL_PATH/start-crn-interface.sh"
else
    echo ""
    echo -e "${CYAN}You can start CRN Interface anytime by running: crn-interface${NC}"
fi

echo ""
echo -e "${GREEN}Thank you for choosing CRN Interface!${NC}"
echo ""

