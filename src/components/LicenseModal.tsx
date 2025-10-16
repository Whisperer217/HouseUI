import { useState, useEffect } from 'react';
import { licenseService } from '../services/licenseService';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated: () => void;
}

export default function LicenseModal({ isOpen, onClose, onActivated }: LicenseModalProps) {
  const [mode, setMode] = useState<'check' | 'trial' | 'activate'>('check');
  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkExistingLicense();
    }
  }, [isOpen]);

  const checkExistingLicense = async () => {
    const existingKey = licenseService.getLicenseKey();
    if (existingKey) {
      const validation = await licenseService.validateLicense();
      if (validation.valid) {
        onActivated();
        onClose();
      } else {
        setMode('activate');
        setError('Your license needs to be activated on this device');
      }
    } else {
      setMode('trial');
    }
  };

  const handleRequestTrial = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await licenseService.requestTrial(email);

    setLoading(false);

    if (result.success) {
      setSuccess(`Trial license generated! Key: ${result.licenseKey}`);
      setTimeout(() => {
        onActivated();
        onClose();
      }, 2000);
    } else {
      setError(result.error || 'Failed to generate trial license');
    }
  };

  const handleActivate = async () => {
    if (!licenseKey) {
      setError('Please enter your license key');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await licenseService.activateLicense(licenseKey);

    setLoading(false);

    if (result.success) {
      setSuccess('License activated successfully!');
      setTimeout(() => {
        onActivated();
        onClose();
      }, 1500);
    } else {
      setError(result.error || 'Failed to activate license');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-lg max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-cyan-400">CRN Interface License</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {mode === 'trial' && (
          <div className="space-y-4">
            <p className="text-gray-300">
              Start your <span className="text-cyan-400 font-semibold">14-day free trial</span> to experience CRN Interface.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {success}
              </div>
            )}

            <button
              onClick={handleRequestTrial}
              disabled={loading}
              className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Start Free Trial'}
            </button>

            <div className="text-center">
              <button
                onClick={() => setMode('activate')}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Already have a license key? Activate it
              </button>
            </div>
          </div>
        )}

        {mode === 'activate' && (
          <div className="space-y-4">
            <p className="text-gray-300">
              Enter your license key to activate CRN Interface on this device.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                License Key
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="CRNIF-XXXXX-XXXXX-XXXXX-XXXXX"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {success}
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={loading}
              className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Activating...' : 'Activate License'}
            </button>

            <div className="text-center">
              <button
                onClick={() => setMode('trial')}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Don't have a license? Start free trial
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            One-time purchase • No subscriptions • Your data stays private
          </p>
        </div>
      </div>
    </div>
  );
}

