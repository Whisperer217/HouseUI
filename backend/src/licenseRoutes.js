import express from 'express';
import { licenseService } from './licenseService.js';

const router = express.Router();

/**
 * Create a new license (admin/payment webhook)
 */
router.post('/create', async (req, res) => {
  try {
    const { type, email, orderId } = req.body;

    if (!type || !email) {
      return res.status(400).json({ error: 'Type and email are required' });
    }

    const license = await licenseService.createLicense(type, email, orderId);
    
    res.json({
      success: true,
      license: {
        key: license.key,
        type: license.type,
        email: license.email,
        createdAt: license.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Generate trial license
 */
router.post('/trial', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const license = await licenseService.generateTrialLicense(email);
    
    res.json({
      success: true,
      license: {
        key: license.key,
        type: license.type,
        expiresAt: license.expiresAt
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Activate a license
 */
router.post('/activate', async (req, res) => {
  try {
    const { licenseKey, systemInfo } = req.body;

    if (!licenseKey || !systemInfo) {
      return res.status(400).json({ error: 'License key and system info are required' });
    }

    const result = await licenseService.activateLicense(licenseKey, systemInfo);
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Validate a license
 */
router.post('/validate', async (req, res) => {
  try {
    const { licenseKey, systemInfo } = req.body;

    if (!licenseKey || !systemInfo) {
      return res.status(400).json({ error: 'License key and system info are required' });
    }

    const result = await licenseService.validateLicense(licenseKey, systemInfo);
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get license info
 */
router.get('/info/:licenseKey', async (req, res) => {
  try {
    const { licenseKey } = req.params;

    const info = await licenseService.getLicenseInfo(licenseKey);
    
    res.json(info);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * Deactivate a device
 */
router.post('/deactivate', async (req, res) => {
  try {
    const { licenseKey, fingerprint } = req.body;

    if (!licenseKey || !fingerprint) {
      return res.status(400).json({ error: 'License key and fingerprint are required' });
    }

    const result = await licenseService.deactivateDevice(licenseKey, fingerprint);
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

