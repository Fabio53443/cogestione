// src/lib/config.js
// Centralized configuration management

import { db } from '$lib/db/db';
import { siteConfig } from '$lib/db/models';
import { eq } from 'drizzle-orm';

// Default configuration values
export const defaultConfig = {
  schoolName: 'La mia Scuola',
  eventName: 'Autogestione',
  days: [
    { id: 0, name: 'Lunedì', enabled: true },
    { id: 1, name: 'Martedì', enabled: true },
    { id: 2, name: 'Mercoledì', enabled: true },
    { id: 3, name: 'Giovedì', enabled: true },
    { id: 4, name: 'Venerdì', enabled: true },
    { id: 5, name: 'Sabato', enabled: false },
    { id: 6, name: 'Domenica', enabled: false }
  ],
  hours: [
    { id: 0, label: '1° ora', startTime: '08:00', endTime: '09:00', enabled: false },
    { id: 1, label: '2° ora', startTime: '09:00', endTime: '10:00', enabled: true },
    { id: 2, label: '3° ora', startTime: '10:00', endTime: '11:00', enabled: true },
    { id: 3, label: '4° ora', startTime: '11:00', endTime: '12:00', enabled: true },
    { id: 4, label: '5° ora', startTime: '12:00', endTime: '13:00', enabled: true },
    { id: 5, label: '6° ora', startTime: '13:00', endTime: '14:00', enabled: true }
  ],
  maxCourseLength: 3,
  registrationDeadline: null,
  registrationOpen: true,
  sdoCanTakeAttendance: true,
  welcomeMessage: 'Benvenuto alla piattaforma per la gestione dei corsi!',
  socialLink: '',
  socialHandle: '',
  primaryColor: '#FB773C',
  secondaryColor: '#EB3678'
};

// Cache for config to avoid repeated DB calls
let configCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache

// Get all configuration
export async function getConfig() {
  const now = Date.now();
  
  // Return cached config if still valid
  if (configCache && (now - cacheTimestamp) < CACHE_TTL) {
    return configCache;
  }

  try {
    const configs = await db.select().from(siteConfig);
    
    // Start with defaults and override with DB values
    const config = { ...defaultConfig };
    
    for (const row of configs) {
      if (row.key in config) {
        config[row.key] = row.value;
      }
    }
    
    // Update cache
    configCache = config;
    cacheTimestamp = now;
    
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    return defaultConfig;
  }
}

// Get a specific config value
export async function getConfigValue(key) {
  const config = await getConfig();
  return config[key] ?? defaultConfig[key];
}

// Update a config value (admin only)
export async function setConfigValue(key, value) {
  try {
    // Check if key exists
    const existing = await db.select().from(siteConfig).where(eq(siteConfig.key, key));
    
    if (existing.length > 0) {
      await db.update(siteConfig).set({ value }).where(eq(siteConfig.key, key));
    } else {
      await db.insert(siteConfig).values({ key, value });
    }
    
    // Invalidate cache
    configCache = null;
    
    return { success: true };
  } catch (error) {
    console.error('Error setting config:', error);
    return { success: false, error: error.message };
  }
}

// Update multiple config values at once
export async function setMultipleConfigValues(updates) {
  try {
    for (const [key, value] of Object.entries(updates)) {
      await setConfigValue(key, value);
    }
    return { success: true };
  } catch (error) {
    console.error('Error setting multiple configs:', error);
    return { success: false, error: error.message };
  }
}

// Initialize config with defaults if empty
export async function initializeConfig() {
  try {
    const existing = await db.select().from(siteConfig);
    
    if (existing.length === 0) {
      // Insert all default values
      for (const [key, value] of Object.entries(defaultConfig)) {
        await db.insert(siteConfig).values({ 
          key, 
          value,
          description: getConfigDescription(key)
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing config:', error);
    return { success: false, error: error.message };
  }
}

// Get enabled days only
export function getEnabledDays(config) {
  return config.days.filter(d => d.enabled);
}

// Get enabled hours only  
export function getEnabledHours(config) {
  return config.hours.filter(h => h.enabled);
}

// Get day names array for display
export function getDayNames(config) {
  return getEnabledDays(config).map(d => d.name);
}

// Get hour labels array for display
export function getHourLabels(config) {
  return getEnabledHours(config).map(h => h.label);
}

// Helper to get description for each config key
function getConfigDescription(key) {
  const descriptions = {
    schoolName: 'Nome della scuola',
    eventName: 'Nome dell\'evento (es. Autogestione, Cogestione)',
    days: 'Giorni della settimana con relative impostazioni',
    hours: 'Ore/turni disponibili con orari',
    maxCourseLength: 'Durata massima di un corso in ore',
    registrationDeadline: 'Data limite per le iscrizioni',
    registrationOpen: 'Se le iscrizioni sono aperte',
    welcomeMessage: 'Messaggio di benvenuto nella homepage',
    socialLink: 'Link al profilo social',
    socialHandle: 'Handle social (es. @nomepagina)',
    primaryColor: 'Colore primario del sito',
    secondaryColor: 'Colore secondario del sito'
  };
  return descriptions[key] || '';
}

// Invalidate cache (useful after admin updates)
export function invalidateConfigCache() {
  configCache = null;
}
