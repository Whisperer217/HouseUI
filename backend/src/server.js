import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import licenseRoutes from './licenseRoutes.js';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Configuration
const PORT = process.env.PORT || 3000;
const OLLAMA_ENDPOINTS = (process.env.OLLAMA_ENDPOINTS || 'http://localhost:11434').split(',');
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel preview/production deployments
    if (origin.includes('.vercel.app')) return callback(null, true);
    
    // Allow configured origins
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// License routes
app.use('/api/license', licenseRoutes);

// Compute node management
class ComputeNodeManager {
  constructor() {
    this.nodes = OLLAMA_ENDPOINTS.map((endpoint, index) => ({
      id: `node-${index}`,
      endpoint: endpoint.trim(),
      isOnline: false,
      models: [],
      lastCheck: null
    }));
  }

  async checkNode(node) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${node.endpoint}/api/tags`, {
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        node.isOnline = true;
        node.models = data.models?.map(m => m.name) || [];
        node.lastCheck = new Date().toISOString();
        return true;
      }
      
      node.isOnline = false;
      node.models = [];
      node.lastCheck = new Date().toISOString();
      return false;
    } catch (error) {
      node.isOnline = false;
      node.models = [];
      node.lastCheck = new Date().toISOString();
      return false;
    }
  }

  async refreshAll() {
    await Promise.all(this.nodes.map(node => this.checkNode(node)));
  }

  getOnlineNodes() {
    return this.nodes.filter(n => n.isOnline);
  }

  getNodeByEndpoint(endpoint) {
    return this.nodes.find(n => n.endpoint === endpoint);
  }

  getFirstOnlineNode() {
    return this.nodes.find(n => n.isOnline);
  }
}

const nodeManager = new ComputeNodeManager();

// Initialize nodes on startup
nodeManager.refreshAll().then(() => {
  console.log('✅ Compute nodes initialized');
  console.log('Online nodes:', nodeManager.getOnlineNodes().length);
});

// Refresh nodes every 30 seconds
setInterval(() => {
  nodeManager.refreshAll();
}, 30000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    nodes: nodeManager.nodes
  });
});

// List compute nodes
app.get('/api/nodes', async (req, res) => {
  try {
    await nodeManager.refreshAll();
    res.json({
      nodes: nodeManager.nodes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List models from a specific node or all nodes
app.get('/api/models', async (req, res) => {
  try {
    const { endpoint } = req.query;
    
    if (endpoint) {
      const node = nodeManager.getNodeByEndpoint(endpoint);
      if (!node) {
        return res.status(404).json({ error: 'Node not found' });
      }
      
      await nodeManager.checkNode(node);
      
      if (!node.isOnline) {
        return res.status(503).json({ error: 'Node is offline' });
      }
      
      return res.json({ models: node.models });
    }
    
    // Return all models from all online nodes
    await nodeManager.refreshAll();
    const allModels = new Set();
    nodeManager.getOnlineNodes().forEach(node => {
      node.models.forEach(model => allModels.add(model));
    });
    
    res.json({ models: Array.from(allModels) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check connection to Ollama
app.get('/api/check', async (req, res) => {
  try {
    const { endpoint } = req.query;
    
    if (endpoint) {
      const node = nodeManager.getNodeByEndpoint(endpoint);
      if (!node) {
        return res.status(404).json({ error: 'Node not found' });
      }
      
      const isOnline = await nodeManager.checkNode(node);
      return res.json({ 
        connected: isOnline,
        endpoint: node.endpoint,
        models: node.models
      });
    }
    
    await nodeManager.refreshAll();
    const onlineNodes = nodeManager.getOnlineNodes();
    
    res.json({
      connected: onlineNodes.length > 0,
      onlineNodes: onlineNodes.length,
      totalNodes: nodeManager.nodes.length,
      nodes: nodeManager.nodes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy chat completions (streaming)
app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, stream = true, options = {}, endpoint } = req.body;
    
    // Select node
    let targetNode;
    if (endpoint) {
      targetNode = nodeManager.getNodeByEndpoint(endpoint);
      if (!targetNode || !targetNode.isOnline) {
        return res.status(503).json({ error: 'Specified node is offline' });
      }
    } else {
      targetNode = nodeManager.getFirstOnlineNode();
      if (!targetNode) {
        return res.status(503).json({ error: 'No online compute nodes available' });
      }
    }
    
    console.log(`📡 Proxying chat request to ${targetNode.endpoint} with model ${model}`);
    
    const response = await fetch(`${targetNode.endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
        options
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ollama error:', errorText);
      return res.status(response.status).json({ 
        error: `Ollama request failed: ${response.statusText}`,
        details: errorText
      });
    }
    
    // Stream the response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      res.write(chunk);
    }
    
    res.end();
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy generate endpoint (for completions)
app.post('/api/generate', async (req, res) => {
  try {
    const { model, prompt, stream = true, options = {}, endpoint } = req.body;
    
    // Select node
    let targetNode;
    if (endpoint) {
      targetNode = nodeManager.getNodeByEndpoint(endpoint);
      if (!targetNode || !targetNode.isOnline) {
        return res.status(503).json({ error: 'Specified node is offline' });
      }
    } else {
      targetNode = nodeManager.getFirstOnlineNode();
      if (!targetNode) {
        return res.status(503).json({ error: 'No online compute nodes available' });
      }
    }
    
    console.log(`📡 Proxying generate request to ${targetNode.endpoint} with model ${model}`);
    
    const response = await fetch(`${targetNode.endpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream,
        options
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ollama error:', errorText);
      return res.status(response.status).json({ 
        error: `Ollama request failed: ${response.statusText}`,
        details: errorText
      });
    }
    
    // Stream the response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      res.write(chunk);
    }
    
    res.end();
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket support for real-time streaming
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      const { type, payload } = data;
      
      if (type === 'chat') {
        const { model, messages, options = {}, endpoint } = payload;
        
        // Select node
        let targetNode;
        if (endpoint) {
          targetNode = nodeManager.getNodeByEndpoint(endpoint);
          if (!targetNode || !targetNode.isOnline) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              error: 'Specified node is offline' 
            }));
            return;
          }
        } else {
          targetNode = nodeManager.getFirstOnlineNode();
          if (!targetNode) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              error: 'No online compute nodes available' 
            }));
            return;
          }
        }
        
        console.log(`📡 WebSocket: Proxying to ${targetNode.endpoint} with model ${model}`);
        
        const response = await fetch(`${targetNode.endpoint}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
            options
          })
        });
        
        if (!response.ok) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            error: `Ollama request failed: ${response.statusText}` 
          }));
          return;
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            ws.send(JSON.stringify({ type: 'done' }));
            break;
          }
          
          const chunk = decoder.decode(value);
          ws.send(JSON.stringify({ type: 'chunk', data: chunk }));
        }
      }
    } catch (error) {
      console.error('❌ WebSocket error:', error);
      ws.send(JSON.stringify({ type: 'error', error: error.message }));
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 HouseUI Backend Proxy Server');
  console.log(`📡 Listening on http://0.0.0.0:${PORT}`);
  console.log(`🔗 Ollama endpoints: ${OLLAMA_ENDPOINTS.join(', ')}`);
  console.log(`🌐 CORS enabled for: ${ALLOWED_ORIGINS.join(', ')} and *.vercel.app`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  /health         - Health check`);
  console.log(`  GET  /api/nodes      - List compute nodes`);
  console.log(`  GET  /api/models     - List available models`);
  console.log(`  GET  /api/check      - Check Ollama connection`);
  console.log(`  POST /api/chat       - Proxy chat completions`);
  console.log(`  POST /api/generate   - Proxy text generation`);
  console.log(`  WS   /               - WebSocket streaming`);
  console.log(`  POST /api/license/*  - License management`);
});

