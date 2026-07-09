import { Settings } from '../models/index.js';
import bcrypt from 'bcryptjs';

export const DEFAULT_SETTINGS: Record<string, any> = {
  siteName: 'NEXAPI HUB',
  siteDescription: 'The infrastructure for modern APIs.',
  maintenanceMode: false,
  registrationEnabled: true,
  apiVersion: '1.0.2',
  defaultRateLimit: 100,
  defaultQuota: 10000,
  developerMode: false,
  adminPath: '/?areyouadmin_pd9BGEpHYtaKSdB_ispassword@you',
  adminPasswordHash: '', // Will be hashed on init
  theme: 'dark',
  allowNSFW: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

let cachedSettings: Record<string, any> = {};
let lastFetch = 0;
const CACHE_TTL = 1000 * 60; // 1 minute

export const initSettings = async () => {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await Settings.findOne({ key });
    if (!existing) {
      let finalValue = value;
      if (key === 'adminPasswordHash') {
        const salt = await bcrypt.genSalt(10);
        finalValue = await bcrypt.hash('pd9BGEpHYtaKSdB', salt);
      }
      await Settings.create({ key, value: finalValue });
    }
  }
};

export const getSettings = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && now - lastFetch < CACHE_TTL && Object.keys(cachedSettings).length > 0) {
    return cachedSettings;
  }

  const settingsList = await Settings.find({});
  const newCache: Record<string, any> = {};
  for (const s of settingsList) {
    newCache[s.key] = s.value;
  }
  
  cachedSettings = newCache;
  lastFetch = now;
  return cachedSettings;
};

export const getSetting = async (key: string) => {
  const settings = await getSettings();
  return settings[key];
};

export const updateSetting = async (key: string, value: any) => {
  await Settings.findOneAndUpdate({ key }, { value, updatedAt: new Date() }, { upsert: true });
  cachedSettings[key] = value;
};
