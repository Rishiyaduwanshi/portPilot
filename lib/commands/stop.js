import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execa } from 'execa';
import os from 'os';
import { getNginxRootDir, getHostPilotPath } from '../utils/resolvePath.js';
import { validatePilotConfig } from '../../validation/pilotrc.validate.js'; 
import { isWindows } from '../utils/platform.js';

export async function stopCommand() {
  console.log(chalk.cyan('\n🛑 Stopping PortPilot...\n'));

  const configPath = path.join(process.cwd(), '.pilotrc.json');
  const configExists = await fs.pathExists(configPath);
  if (!configExists) {
    console.log(chalk.red('❌ .pilotrc.json not found.'));
    process.exit(1);
  }

  const config = await validatePilotConfig(configPath);

  const nginxRoot = getNginxRootDir();

  // 🔻 Step 1: Kill nginx process
  try {
    if (os.platform() === 'win32') {
      await execa('taskkill', ['/F', '/IM', 'nginxpilot.exe']);
    } else {
      await execa('pkill', ['nginxpilot']);
    }
    console.log(chalk.green('✅ nginxpilot processes stopped.'));
  } catch (err) {
    console.warn(chalk.yellow('⚠️ No running nginxpilot process found.'));
  }

  // 🔻 Step 2: Clean nginx configs
  if (config?.on?.stop?.cleanConfigs) {
    const confD = path.join(nginxRoot, 'conf.d');
    await fs.emptyDir(confD);
    console.log(chalk.green('🧹 Nginx conf.d cleaned'));
  }

  // 🔻 Step 3: Clean hosts entries using cleanupManaged
  if (config?.on?.stop?.cleanHosts) {
    try {
      let cmd, args;
      if (isWindows) {
        cmd = getHostPilotPath();
        args = ['cleanupManaged'];
      } else {
        cmd = 'sudo';
        args = [getHostPilotPath(), 'cleanupManaged'];
      }
      const { _ } = await execa(cmd, args, { stdio: 'inherit' });
      console.log(chalk.green('👻 Host cleaned'));
    } catch (err) {
      console.error(
        chalk.red('❌ Failed to clean hosts:'),
        err.stderr || err.message
      );
    }
  }

  // 🔻 Step 4: Delete full nginx folder (optional)
  if (config?.on?.stop?.cleanNginx) {
    try {
      await fs.remove(nginxRoot);
      console.log(chalk.green('🗑️ Nginxpilot directory deleted'));
    } catch (err) {
      console.warn(chalk.yellow('⚠️ Could not delete nginxpilot folder.'));
    }
  }

  console.log(chalk.cyan('\n🛑 PortPilot stopped.\n'));
}
