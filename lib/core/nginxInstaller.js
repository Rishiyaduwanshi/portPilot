// lib/core/nginxInstaller.js
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { detectPlatform } from '../utils/platform.js';
import { download } from '../utils/download.js';
import * as tar from 'tar';
import extract from 'extract-zip';

export async function installNginxIfNeeded() {
  const platform = detectPlatform();
  const home = os.homedir();
  const portpilotDir = path.join(home, '.portpilot');
  const nginxExtractedDir = path.join(portpilotDir, 'nginxpilot');
  const nginxBinary = path.join(nginxExtractedDir, platform === 'windows' ? 'nginxpilot.exe' : 'nginxpilot');

  if (await fs.pathExists(nginxBinary)) return;

  console.log(`🌐 nginx not found. Downloading for ${platform}...`);

  const nginxUrls = {
    windows: 'https://portpilot.js.org/download/nginxpilot-win.zip',
    linux: 'https://portpilot.js.org/download/nginxpilot-linux.tar.gz',
    mac: 'https://portpilot.js.org/download/nginxpilot-linux.tar.gz',
  };

  const tmpPath = path.join(os.tmpdir(), `nginxpilot-${platform}.${platform === 'windows' ? 'zip' : 'tar.gz'}`);
  await download(nginxUrls[platform], tmpPath);

  await fs.ensureDir(nginxExtractedDir);

  if (platform === 'windows') {
    const tempExtractDir = path.join(portpilotDir, '__temp__');
    await extract(tmpPath, { dir: tempExtractDir });

    const innerDir = (await fs.readdir(tempExtractDir)).find(name => name.startsWith('nginx-'));
    const innerPath = path.join(tempExtractDir, innerDir);

    const contents = await fs.readdir(innerPath);
    for (const item of contents) {
      const src = path.join(innerPath, item);
      const dest = path.join(nginxExtractedDir, item);
      await fs.move(src, dest, { overwrite: true });
    }

    await fs.remove(tempExtractDir);
  } else {
    await tar.x({ file: tmpPath, cwd: nginxExtractedDir, strip: 1 });
    await fs.chmod(nginxBinary, 0o755);
  }

  console.log(`✅ nginx installed at ${nginxBinary}`);
}
