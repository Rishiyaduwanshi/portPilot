import fs from 'fs-extra';
import { download } from '../utils/download.js';
import { detectPlatform } from '../utils/platform.js';
import { getHostPilotPath } from '../utils/resolvePath.js';
import chalk from 'chalk';

export async function installHostBinaryIfNeeded() {
  const platform = detectPlatform(); 
  if (await fs.exists(getHostPilotPath())) {
    console.log(chalk.gray(`🔹 hostpilot already exists at ${getHostPilotPath()}`));
    return;
  }

  console.log(`⬇️ binary file not found. Downloading for ${platform}...`);

  const binaryURLs = {
    windows: 'https://raw.githubusercontent.com/rishiyaduwanshi/portpilot/main/bin/win/hostpilot.exe',
    linux:   'https://raw.githubusercontent.com/rishiyaduwanshi/portpilot/main/bin/linux/hostpilot',
    mac:     'https://raw.githubusercontent.com/rishiyaduwanshi/portpilot/main/bin/mac/hostpilot',
  };

  const url = binaryURLs[platform];
  if (!url) {
    console.error(chalk.red(`❌ No binary URL found for platform: ${platform}`));
    process.exit(1);
  }

  await download(url, getHostPilotPath());

  if (platform !== 'windows') {
    await fs.chmod(getHostPilotPath(), 0o755); 
  }

}
