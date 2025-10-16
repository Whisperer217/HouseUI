import os from 'os';

interface SystemInfo {
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: number;
  hostname: string;
}

interface LicenseInfo {
  key: string;
  type: string;
  status: string;
  createdAt: string;
  activatedAt: string | null;
  expiresAt: string | null;
  devices: Array<{
    name: string;
    platform: string;
    activatedAt: string;
    lastSeen: string;
  }>;
  maxDevices: number;
  features: string[];
  computeToEarn: boolean;
  aiElder: boolean;
  creatorEconomy: boolean;
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
  license?: {
    type: string;
    features: string[];
    computeToEarn: boolean;
    aiElder: boolean;
    creatorEconomy: boolean;
    expiresAt: string | null;
  };
}

class LicenseService {
  private backendUrl: string;
  private licenseKey: string | null = null;
  private cachedValidation: ValidationResult | null = null;

  constructor() {
    // Get backend URL from environment or default
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    
    // Load license key from localStorage
    this.licenseKey = localStorage.getItem('guardian_license_key');
  }

  /**
   * Get system information for hardware fingerprinting
   */
  getSystemInfo(): SystemInfo {
    // In browser, we can't access full system info
    // This would be used in Electron/desktop app
    return {
      platform: navigator.platform || 'web',
      arch: 'unknown',
      cpus: navigator.hardwareConcurrency || 1,
      totalMemory: (navigator as any).deviceMemory ? (navigator as any).deviceMemory * 1024 * 1024 * 1024 : 0,
      hostname: window.location.hostname
    };
  }

  /**
   * Request a trial license
   */
  async requestTrial(email: string): Promise<{ success: boolean; licenseKey?: string; error?: string }> {
    try {
      const response = await fetch(`${this.backendUrl}/api/license/trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      // Save license key
      this.licenseKey = data.license.key;
      localStorage.setItem('guardian_license_key', data.license.key);

      return { success: true, licenseKey: data.license.key };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Activate a license
   */
  async activateLicense(licenseKey: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const systemInfo = this.getSystemInfo();

      const response = await fetch(`${this.backendUrl}/api/license/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey,
          systemInfo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      // Save license key
      this.licenseKey = licenseKey;
      localStorage.setItem('guardian_license_key', licenseKey);

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Validate current license
   */
  async validateLicense(): Promise<ValidationResult> {
    if (!this.licenseKey) {
      return { valid: false, reason: 'No license key found' };
    }

    try {
      const systemInfo = this.getSystemInfo();

      const response = await fetch(`${this.backendUrl}/api/license/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey: this.licenseKey,
          systemInfo
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.cachedValidation = { valid: false, reason: data.error };
        return this.cachedValidation;
      }

      this.cachedValidation = data;
      return data;
    } catch (error) {
      const result = { valid: false, reason: (error as Error).message };
      this.cachedValidation = result;
      return result;
    }
  }

  /**
   * Get license info
   */
  async getLicenseInfo(): Promise<LicenseInfo | null> {
    if (!this.licenseKey) {
      return null;
    }

    try {
      const response = await fetch(`${this.backendUrl}/api/license/info/${this.licenseKey}`);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching license info:', error);
      return null;
    }
  }

  /**
   * Check if a feature is enabled
   */
  async hasFeature(feature: string): Promise<boolean> {
    const validation = this.cachedValidation || await this.validateLicense();
    
    if (!validation.valid || !validation.license) {
      return false;
    }

    return validation.license.features.includes(feature);
  }

  /**
   * Check if compute-to-earn is enabled
   */
  async hasComputeToEarn(): Promise<boolean> {
    const validation = this.cachedValidation || await this.validateLicense();
    
    if (!validation.valid || !validation.license) {
      return false;
    }

    return validation.license.computeToEarn;
  }

  /**
   * Check if AI Elder is enabled
   */
  async hasAIElder(): Promise<boolean> {
    const validation = this.cachedValidation || await this.validateLicense();
    
    if (!validation.valid || !validation.license) {
      return false;
    }

    return validation.license.aiElder;
  }

  /**
   * Check if creator economy is enabled
   */
  async hasCreatorEconomy(): Promise<boolean> {
    const validation = this.cachedValidation || await this.validateLicense();
    
    if (!validation.valid || !validation.license) {
      return false;
    }

    return validation.license.creatorEconomy;
  }

  /**
   * Get current license key
   */
  getLicenseKey(): string | null {
    return this.licenseKey;
  }

  /**
   * Set license key manually
   */
  setLicenseKey(key: string): void {
    this.licenseKey = key;
    localStorage.setItem('guardian_license_key', key);
    this.cachedValidation = null; // Clear cache
  }

  /**
   * Remove license (logout)
   */
  removeLicense(): void {
    this.licenseKey = null;
    this.cachedValidation = null;
    localStorage.removeItem('guardian_license_key');
  }

  /**
   * Check if license is active
   */
  async isLicenseActive(): Promise<boolean> {
    const validation = await this.validateLicense();
    return validation.valid;
  }

  /**
   * Get license type
   */
  async getLicenseType(): Promise<string | null> {
    const validation = this.cachedValidation || await this.validateLicense();
    
    if (!validation.valid || !validation.license) {
      return null;
    }

    return validation.license.type;
  }
}

export const licenseService = new LicenseService();
export type { SystemInfo, LicenseInfo, ValidationResult };

