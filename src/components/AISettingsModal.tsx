import { useState, useEffect } from 'react';
import { X, Server, CheckCircle, AlertCircle, RefreshCw, Plus, Trash2, Network } from 'lucide-react';
import { aiService, AIConfig, ComputeNode } from '../services/aiService';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'nodes'>('basic');
  const [config, setConfig] = useState<AIConfig>(aiService.getConfig());
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [computeNodes, setComputeNodes] = useState<ComputeNode[]>([]);
  const [showAddNode, setShowAddNode] = useState(false);
  const [newNode, setNewNode] = useState({
    name: '',
    endpoint: '',
    type: 'ollama' as 'ollama' | 'openwebui' | 'custom',
    location: 'tailscale' as 'local' | 'tailscale' | 'remote',
  });

  useEffect(() => {
    if (isOpen) {
      checkConnection();
      loadModels();
      loadComputeNodes();
    }
  }, [isOpen]);

  const checkConnection = async () => {
    setIsChecking(true);
    const connected = await aiService.checkConnection();
    setIsConnected(connected);
    setIsChecking(false);
  };

  const loadModels = async () => {
    const models = await aiService.listModels();
    setAvailableModels(models);
  };

  const loadComputeNodes = async () => {
    const nodes = aiService.getComputeNodes();
    setComputeNodes(nodes);
  };

  const handleRefreshNodes = async () => {
    setIsChecking(true);
    await aiService.refreshComputeNodes();
    await loadComputeNodes();
    setIsChecking(false);
  };

  const handleAddNode = async () => {
    if (!newNode.name || !newNode.endpoint) return;

    await aiService.addComputeNode(newNode);
    await loadComputeNodes();
    setShowAddNode(false);
    setNewNode({
      name: '',
      endpoint: '',
      type: 'ollama',
      location: 'tailscale',
    });
  };

  const handleRemoveNode = async (nodeId: string) => {
    await aiService.removeComputeNode(nodeId);
    await loadComputeNodes();
  };

  const handleSelectNode = (node: ComputeNode) => {
    setConfig({
      ...config,
      endpoint: node.endpoint,
      endpointType: node.type,
      model: node.models[0] || config.model,
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    aiService.updateConfig(config);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Compute Settings</h2>
              <p className="text-sm text-gray-400">Manage your distributed AI network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'basic'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Basic Settings
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'nodes'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Compute Nodes
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Connection Status</h3>
                  <button
                    onClick={checkConnection}
                    disabled={isChecking}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                    Test
                  </button>
                </div>

                {isConnected === true && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-500 font-medium">Connected to AI</span>
                  </div>
                )}

                {isConnected === false && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <p className="text-red-500 font-medium">Cannot connect</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Check endpoint or switch to Compute Nodes tab
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Endpoint Type
                </label>
                <select
                  value={config.endpointType || 'ollama'}
                  onChange={(e) => setConfig({ ...config, endpointType: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ollama">Ollama</option>
                  <option value="openwebui">Open WebUI</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Endpoint
                </label>
                <input
                  type="text"
                  value={config.endpoint}
                  onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Local, Tailscale IP (e.g., 100.x.x.x), or remote URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Model
                </label>
                {availableModels.length > 0 ? (
                  <select
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    placeholder="llama3 / deepseek-r1:8b"
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temperature
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) =>
                      setConfig({ ...config, temperature: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="8000"
                    step="100"
                    value={config.maxTokens}
                    onChange={(e) =>
                      setConfig({ ...config, maxTokens: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Available Compute Nodes</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleRefreshNodes}
                    disabled={isChecking}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowAddNode(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Node
                  </button>
                </div>
              </div>

              {showAddNode && (
                <div className="bg-gray-700 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-white">Add Compute Node</h4>
                  <input
                    type="text"
                    placeholder="Node Name (e.g., Main Desktop)"
                    value={newNode.name}
                    onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Endpoint (e.g., http://100.64.1.5:11434)"
                    value={newNode.endpoint}
                    onChange={(e) => setNewNode({ ...newNode, endpoint: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newNode.type}
                      onChange={(e) => setNewNode({ ...newNode, type: e.target.value as any })}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                    >
                      <option value="ollama">Ollama</option>
                      <option value="openwebui">Open WebUI</option>
                      <option value="custom">Custom</option>
                    </select>
                    <select
                      value={newNode.location}
                      onChange={(e) => setNewNode({ ...newNode, location: e.target.value as any })}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                    >
                      <option value="local">Local</option>
                      <option value="tailscale">Tailscale</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddNode}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddNode(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {computeNodes.map((node) => (
                  <div
                    key={node.id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => handleSelectNode(node)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Network className="w-5 h-5 text-blue-400" />
                          <h4 className="font-semibold text-white">{node.name}</h4>
                          {node.isOnline ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                              Online
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                              Offline
                            </span>
                          )}
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                            {node.location}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{node.endpoint}</p>
                        {node.models.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {node.models.slice(0, 3).map((model) => (
                              <span
                                key={model}
                                className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                              >
                                {model}
                              </span>
                            ))}
                            {node.models.length > 3 && (
                              <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                                +{node.models.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNode(node.id);
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Tailscale Tips</h4>
                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                  <li>Install Tailscale on all devices: tailscale.com</li>
                  <li>Use Tailscale IP: 100.x.x.x (check with `tailscale ip`)</li>
                  <li>Run Ollama/WebUI in Docker for easy management</li>
                  <li>All devices securely share compute power</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
