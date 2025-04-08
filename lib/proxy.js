import fs from 'fs';
import os from 'os';
import path from 'path';
import colorify from './utils/colorify.js';

const HOSTS_PATH = os.platform() === 'win32'
  ? path.join(process.env.SystemRoot, 'System32', 'drivers', 'etc', 'hosts')
  : '/etc/hosts';

export function ensureDomainInHosts(domain) {
  let content;
  try {
    content = fs.readFileSync(HOSTS_PATH, 'utf8');
  } catch (err) {
    console.error(colorify.red(`❌ Failed to read hosts file: ${err.message}`));
    process.exit(1);
  }

  const mapping = `127.0.0.1 ${domain}`;
  const alreadyExists = content.split('\n').some(line => line.trim().endsWith(domain));

  if (alreadyExists) {
    console.log(colorify.yellow(`ℹ️  Domain "${domain}" already mapped in hosts.`));
    return;
  }

  try {
    fs.appendFileSync(HOSTS_PATH, os.EOL + mapping);
    console.log(colorify.green(`✅ Mapped ${domain} → 127.0.0.1 in hosts file.`));
  } catch (err) {
    console.error(colorify.red(`❌ Failed to update hosts file (maybe need sudo): ${err.message}`));
    process.exit(1);
  }
}
