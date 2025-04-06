import fs from 'fs';
import os from 'os';
import chalk from 'chalk';
import { isAdmin, elevatePrivileges, getHostsPath, getElevationMessage } from './os/index.js';

export function ensureDomainInHosts(domain) {
  if (!isAdmin()) {
    const msg = getElevationMessage();
    console.log(chalk.yellow(msg.start));
    console.log(chalk.cyan(msg.attempt));
    
    if (elevatePrivileges(process.argv[1])) {
      process.exit(0);
    } else {
      msg.fail.forEach(line => console.log(chalk.cyan(line)));
      process.exit(1);
    }
  }

  const HOSTS_PATH = getHostsPath();
  let content;
  try {
    content = fs.readFileSync(HOSTS_PATH, 'utf8');
  } catch (err) {
    console.error(chalk.red(`❌ Failed to read hosts file: ${err.message}`));
    process.exit(1);
  }

  const mapping = `127.0.0.1 ${domain}`;
  const alreadyExists = content.split('\n').some(line => line.trim().endsWith(domain));

  if (alreadyExists) {
    console.log(chalk.yellow(`ℹ️  Domain "${domain}" already mapped in hosts.`));
    return;
  }

  try {
    fs.appendFileSync(HOSTS_PATH, os.EOL + mapping);
    console.log(chalk.green(`✅ Mapped ${domain} → 127.0.0.1 in hosts file.`));
  } catch (err) {
    console.error(chalk.red(`❌ Failed to update hosts file: ${err.message}`));
    process.exit(1);
  }
}
