import { existsSync } from 'fs';
import { pathToFileURL } from 'url';
import { join } from 'path';
import colorify from './utils/colorify.js';

const CONFIG_FILE = join(process.cwd(), '.pilotrc.js');

export async function loadConfig() {
  if (!existsSync(CONFIG_FILE)) {
    console.error(colorify.red(`❌ Config file ".pilotrc.js" not found in project root.`));
    process.exit(1);
  }

  let config;
  try {
    // Try ESM first
    const fileUrl = pathToFileURL(CONFIG_FILE).href;
    try {
      config = await import(fileUrl).then(m => m.default);
    } catch (esmErr) {
      // If ESM fails, try CJS
      try {
        config = require(CONFIG_FILE);
      } catch (cjsErr) {
        throw new Error('Failed to load config in both ESM and CJS formats');
      }
    }
  } catch (err) {
    console.error(colorify.red(`❌ Error loading ".pilotrc.js": ${err.message}`));
    process.exit(1);
  }

  if (!config.port || typeof config.port !== "number") {
    console.error(colorify.red(`❌ "port" must be a number in your .pilotrc.js`));
    process.exit(1);
  }

  if (!config.domain || typeof config.domain !== 'string') {
    console.error(colorify.red(`❌ "domain" must be a string in your .pilotrc.js`));
    process.exit(1);
  }

  // Default values
  config.isHttps = config.isHttps ?? false;
  config.isLog = config.isLog ?? true;

  return config;
}
