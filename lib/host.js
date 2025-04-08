import fs from 'fs';
import os from 'os';
import colorify from './utils/colorify.js';
import { isAdmin, elevatePrivileges, getHostsPath, getElevationMessage } from './os/index.js';

export function ensureDomainInHosts(domain) {
  const HOSTS_PATH = getHostsPath();
  let content;
  
  try {
    content = fs.readFileSync(HOSTS_PATH, 'utf8');
    const alreadyExists = content.split('\n').some(line => line.trim().endsWith(domain));
    
    if (alreadyExists) {
      console.log(colorify.yellow(`ℹ️  Domain "${domain}" already mapped in hosts.`));
      return true;
    }
  } catch (err) {
    console.error(colorify.red(`❌ Failed to read hosts file: ${err.message}`));
    process.exit(1);
  }

  if (!isAdmin()) {
    const msg = getElevationMessage();
    console.log(colorify.yellow(msg.start));
    console.log(colorify.cyan(msg.attempt));
    
    if (elevatePrivileges(process.argv[1])) {
      process.exit(0);
    } else {
      msg.fail.forEach(line => console.log(colorify.cyan(line)));
      process.exit(1);
    }
  }

  try {
    const mapping = `127.0.0.1 ${domain}`;
    fs.appendFileSync(HOSTS_PATH, os.EOL + mapping);
    console.log(colorify.green(`✅ Mapped ${domain} → 127.0.0.1 in hosts file.`));
    return false;
  } catch (err) {
    console.error(colorify.red(`❌ Failed to update hosts file: ${err.message}`));
    process.exit(1);
  }
}
