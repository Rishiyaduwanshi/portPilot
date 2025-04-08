import { loadConfig } from '../lib/config.js';
import { startProxy } from '../main.js';

async function main() {
  try {
    const config = await loadConfig();
    startProxy(config);
  } catch (error) {
    console.error('Failed to start PortPilot:', error);
    process.exit(1);
  }
}

main();
