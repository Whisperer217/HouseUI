import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// License storage (in production, use a database)
const LICENSE_FILE = path.join(__dirname, '../data/licenses.json');
const HARDWARE_FILE = path.join(__dirname, '../data/hardware.json');

// License types
const LICENSE_TYPES = {
  TRIAL: 'trial',
  STANDARD: 'standard',
  FAMILY: 'family',
  GUARDIAN: 'guardian',
  FOUNDER: 'founder'
};

// License features
const LICENSE_FEATURES = {
  trial: {
    duration: 14, // days
    maxDevices: 1,
    features: ['basic_ai', 'chat', 'voice'],
    computeToEarn: false,
    aiElder: false,
    creatorEconomy: false
  },
  standard: {
    duration: null, // lifetime
    maxDevices: 1,
    features: ['basic_ai', 'chat', 'voice', 'emergency_medical', 'smart_home'],
    computeToEarn: false,
    aiElder: false,
    creatorEconomy: false
  },
  family: {
    duration: null,
    maxDevices: 3,
    features: ['basic_ai', 'chat', 'voice', 'emergency_medical', 'smart_home', 'family_profiles'],
    computeToEarn: false,
    aiElder: false,
    creatorEconomy: false
  },
  guardian: {
    duration: null,
    maxDevices: 5,
    features: ['basic_ai', 'chat', 'voice', 'emergency_medical', 'smart_home', 'family_profiles', 'advanced_security'],
    computeToEarn: true,
    aiElder: true,
    creatorEconomy: false
  },
  founder: {
    duration: null,
    maxDevices: 10,
    features: ['basic_ai', 'chat', 'voice', 'emergency_medical', 'smart_home', 'family_profiles', 'advanced_security', 'priority_support'],
    computeToEarn: true,
    aiElder: true,
    creatorEconomy: true
  }
};

class LicenseService {
  constructor() {
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      const dataDir = path.join(__dirname, '../data');
      await fs.mkdir(dataDir, { recursive: true });
      
      // Initialize license file if it doesn't exist
      try {
        await fs.access(LICENSE_FILE);
      } catch {
        await fs.writeFile(LICENSE_FILE, JSON.stringify({ licenses: [] }, null, 2));
      }

      // Initialize hardware file if it doesn't exist
      try {
        await fs.access(HARDWARE_FILE);
      } catch {
        await fs.writeFile(HARDWARE_FILE, JSON.stringify({ devices: [] }, null, 2));
      }
    } catch (error) {
      console.error('Error initializing license storage:', error);
    }
  }

  /**
   * Generate a license key
   * Format: CRNIF-XXXXX-XXXXX-XXXXX-XXXXX
   * CRN Interface - Command Domains
   */
  generateLicenseKey() {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      const segment = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
      segments.push(segment);
    }
    return `CRNIF-${segments.join('-')}`;
  }

  /**
   * Generate hardware fingerprint from system info
   */
  generateHardwareFingerprint(systemInfo) {
    const data = JSON.stringify({
      platform: systemInfo.platform,
      arch: systemInfo.arch,
      cpus: systemInfo.cpus,
      totalMemory: systemInfo.totalMemory,
      // Don't include hostname or username for privacy
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create a new license
   */
  async createLicense(type, email, orderId = null) {
    if (!LICENSE_TYPES[type.toUpperCase()]) {
      throw new Error('Invalid license type');
    }

    const licenseKey = this.generateLicenseKey();
    const now = new Date().toISOString();
    const features = LICENSE_FEATURES[type];

    const license = {
      key: licenseKey,
      type: type,
      email: email,
      orderId: orderId,
      createdAt: now,
      activatedAt: null,
      expiresAt: features.duration ? new Date(Date.now() + features.duration * 24 * 60 * 60 * 1000).toISOString() : null,
      status: 'pending', // pending, active, expired, revoked
      devices: [],
      maxDevices: features.maxDevices,
      features: features.features,
      computeToEarn: features.computeToEarn,
      aiElder: features.aiElder,
      creatorEconomy: features.creatorEconomy
    };

    // Save to storage
    const data = JSON.parse(await fs.readFile(LICENSE_FILE, 'utf-8'));
    data.licenses.push(license);
    await fs.writeFile(LICENSE_FILE, JSON.stringify(data, null, 2));

    return license;
  }

  /**
   * Activate a license with hardware fingerprint
   */
  async activateLicense(licenseKey, systemInfo) {
    const data = JSON.parse(await fs.readFile(LICENSE_FILE, 'utf-8'));
    const license = data.licenses.find(l => l.key === licenseKey);

    if (!license) {
      throw new Error('License key not found');
    }

    if (license.status === 'revoked') {
      throw new Error('License has been revoked');
    }

    if (license.status === 'expired') {
      throw new Error('License has expired');
    }

    // Generate hardware fingerprint
    const fingerprint = this.generateHardwareFingerprint(systemInfo);

    // Check if this device is already registered
    const existingDevice = license.devices.find(d => d.fingerprint === fingerprint);
    if (existingDevice) {
      return {
        success: true,
        message: 'Device already activated',
        license: license
      };
    }

    // Check device limit
    if (license.devices.length >= license.maxDevices) {
      throw new Error(`Maximum device limit reached (${license.maxDevices} devices)`);
    }

    // Add device
    license.devices.push({
      fingerprint: fingerprint,
      name: systemInfo.hostname || 'Unknown Device',
      platform: systemInfo.platform,
      activatedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    });

    // Update license status
    if (license.status === 'pending') {
      license.status = 'active';
      license.activatedAt = new Date().toISOString();
    }

    // Save hardware info
    const hardwareData = JSON.parse(await fs.readFile(HARDWARE_FILE, 'utf-8'));
    hardwareData.devices.push({
      fingerprint: fingerprint,
      licenseKey: licenseKey,
      systemInfo: systemInfo,
      registeredAt: new Date().toISOString()
    });

    await fs.writeFile(LICENSE_FILE, JSON.stringify(data, null, 2));
    await fs.writeFile(HARDWARE_FILE, JSON.stringify(hardwareData, null, 2));

    return {
      success: true,
      message: 'License activated successfully',
      license: license
    };
  }

  /**
   * Validate a license (offline validation)
   */
  async validateLicense(licenseKey, systemInfo) {
    const data = JSON.parse(await fs.readFile(LICENSE_FILE, 'utf-8'));
    const license = data.licenses.find(l => l.key === licenseKey);

    if (!license) {
      return { valid: false, reason: 'License key not found' };
    }

    if (license.status === 'revoked') {
      return { valid: false, reason: 'License has been revoked' };
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      license.status = 'expired';
      await fs.writeFile(LICENSE_FILE, JSON.stringify(data, null, 2));
      return { valid: false, reason: 'License has expired' };
    }

    // Check hardware fingerprint
    const fingerprint = this.generateHardwareFingerprint(systemInfo);
    const device = license.devices.find(d => d.fingerprint === fingerprint);

    if (!device) {
      return { valid: false, reason: 'Device not registered with this license' };
    }

    // Update last seen
    device.lastSeen = new Date().toISOString();
    await fs.writeFile(LICENSE_FILE, JSON.stringify(data, null, 2));

    return {
      valid: true,
      license: {
        type: license.type,
        features: license.features,
        computeToEarn: license.computeToEarn,
        aiElder: license.aiElder,
        creatorEconomy: license.creatorEconomy,
        expiresAt: license.expiresAt
      }
    };
  }

  /**
   * Deactivate a device
   */
  async deactivateDevice(licenseKey, fingerprint) {
    const data = JSON.parse(await fs.readFile(LICENSE_FILE, 'utf-8'));
    const license = data.licenses.find(l => l.key === licenseKey);

    if (!license) {
      throw new Error('License key not found');
    }

    license.devices = license.devices.filter(d => d.fingerprint !== fingerprint);
    await fs.writeFile(LICENSE_FILE, JSON.stringify(data, null, 2));

    return { success: true, message: 'Device deactivated successfully' };
  }

  /**
   * Get license info
   */
  async getLicenseInfo(licenseKey) {
    const data = JSON.parse(await fs.readFile(LICENSE_FILE, 'utf-8'));
    const license = data.licenses.find(l => l.key === licenseKey);

    if (!license) {
      throw new Error('License key not found');
    }

    // Don't expose sensitive info
    return {
      key: license.key,
      type: license.type,
      status: license.status,
      createdAt: license.createdAt,
      activatedAt: license.activatedAt,
      expiresAt: license.expiresAt,
      devices: license.devices.map(d => ({
        name: d.name,
        platform: d.platform,
        activatedAt: d.activatedAt,
        lastSeen: d.lastSeen
      })),
      maxDevices: license.maxDevices,
      features: license.features,
      computeToEarn: license.computeToEarn,
      aiElder: license.aiElder,
      creatorEconomy: license.creatorEconomy
    };
  }

  /**
   * Generate trial license
   */
  async generateTrialLicense(email) {
    // Check if email already has a trial
    const data = JSON.parse(await fs.readFile(LICENSE_FILE, 'utf-8'));
    const existingTrial = data.licenses.find(l => l.email === email && l.type === 'trial');

    if (existingTrial) {
      throw new Error('Trial license already exists for this email');
    }

    return await this.createLicense('trial', email);
  }
}

export const licenseService = new LicenseService();
export { LICENSE_TYPES, LICENSE_FEATURES };

