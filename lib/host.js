import fs from 'fs';
import os from 'os';
import chalk from 'chalk';
import { isAdmin, elevatePrivileges, getHostsPath, getElevationMessage } from './os/index.js';

export function ensureDomainInHosts(domain) {
  const HOSTS_PATH = getHostsPath();
  let content;
  
  // First try to read without admin rights
  try {
    content = fs.readFileSync(HOSTS_PATH, 'utf8');
    const alreadyExists = content.split('\n').some(line => line.trim().endsWith(domain));
    
    if (alreadyExists) {
      console.log(chalk.yellow(`ℹ️  Domain "${domain}" already mapped in hosts.`));
      return true; // Return true if domain already exists
    }
  } catch (err) {
    console.error(chalk.red(`❌ Failed to read hosts file: ${err.message}`));
    process.exit(1);
  }

  // Only ask for admin rights if we need to modify the file
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

  // Now write with admin rights
  try {
    const mapping = `127.0.0.1 ${domain}`;
    fs.appendFileSync(HOSTS_PATH, os.EOL + mapping);
    console.log(chalk.green(`✅ Mapped ${domain} → 127.0.0.1 in hosts file.`));
    return false; // Return false if we had to add the domain
  } catch (err) {
    console.error(chalk.red(`❌ Failed to update hosts file: ${err.message}`));
    process.exit(1);
  }
}
