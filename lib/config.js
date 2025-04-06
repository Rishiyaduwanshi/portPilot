import { existsSync } from 'fs';
import { pathToFileURL } from 'url';
import { join } from 'path';
import chalk from 'chalk';

const CONFIG_FILE = join(process.cwd(), '.pilotrc.js');

export async function loadConfig() {
  if (!existsSync(CONFIG_FILE)) {
    console.error(chalk.red(`❌ Config file ".pilotrc.js" not found in project root.`));
    process.exit(1);
  }

  let config;
  try {
    const fileUrl = pathToFileURL(CONFIG_FILE).href;
    config = await import(fileUrl).then(m => m.default);
  } catch (err) {
    console.error(chalk.red(`❌ Error loading ".pilotrc.js": ${err.message}`));
    process.exit(1);
  }

  // Validation
  if (!config.port || typeof config.port !== 'number') {
    console.error(chalk.red(`❌ "port" must be a number in your .pilotrc.js`));
    process.exit(1);
  }

  if (!config.domain || typeof config.domain !== 'string') {
    console.error(chalk.red(`❌ "domain" must be a string in your .pilotrc.js`));
    process.exit(1);
  }

  // Default values
  config.isHttps = config.isHttps ?? false;
  config.isLog = config.isLog ?? true;

  return config;
}
