// lib/commands/start.js
import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { buildNginxConfig } from '../core/configBuilder.js';
import { installNginxIfNeeded } from '../core/nginxInstaller.js';
import { validatePilotConfig } from '../../validation/pilotrc.validate.js';
import { installHostBinaryIfNeeded } from '../core/hostInstaller.js';
import {
  getBundledNginxPath,
  getNginxRootDir,
  getCustomNginxConfPath,
  getHostPilotPath,
} from '../utils/resolvePath.js';
import { killExistingNginx } from '../utils/killNginx.js';

export async function startCommand() {
  console.log(chalk.cyan('🚀 Starting PortPilot...'));

  await installHostBinaryIfNeeded();

  const configPath = path.join(process.cwd(), '.pilotrc.json');
  const configExists = await fs.pathExists(configPath);

  if (!configExists) {
    console.log(chalk.red('❌ .pilotrc.json not found.'));
    process.exit(1);
  }

  const config = await validatePilotConfig(configPath);

  const nginxBinary = getBundledNginxPath();
  const nginxRoot = getNginxRootDir();
  const confD = path.join(nginxRoot, 'conf', 'conf.d');

  await killExistingNginx();
  await installNginxIfNeeded();
  await fs.ensureDir(confD);

  const domains = config.apps.map((app) => app.domain);

  try {
    const spinner = ora('🧩 Prompting to allow...').start();
    const subprocess = await execa(
      getHostPilotPath(),
      ['addHost', ...domains],
      {
        stdio: 'pipe',
      }
    );
    await subprocess;
    spinner.succeed('Port mapped successfully ');
  } catch (err) {
    console.error(chalk.red('❌ Failed to add domains to hosts file.'));
    process.exit(1);
  }

  for (const app of config.apps) {
    const customPath = getCustomNginxConfPath(
      process.cwd(),
      app.customNginxConfig
    );

    const confContent = buildNginxConfig({
      domain: app.domain,
      port: app.port,
      https: app.https === true,
      customNginxConfigPath: customPath,
    });

    const confPath = path.join(confD, `${app.domain}.conf`);
    await fs.writeFile(confPath, confContent);
  }

  try {
    await execa(nginxBinary, ['-t', '-p', nginxRoot, '-c', 'conf/nginx.conf'], {
      stdio: 'inherit',
    });
  } catch (err) {
    console.error(chalk.red(`❌ nginx config test failed: ${err.message}`));
    return;
  }

  try {
    const subprocess = execa(
      nginxBinary,
      ['-c', 'conf/nginx.conf', '-p', nginxRoot],
      {
        detached: true,
        stdio: 'ignore',
      }
    );
    subprocess.unref();
    console.log(chalk.green('✅ nginx started successfully.'));
    config.apps.forEach((app, index) => {
      const protocol = app.https ? 'https' : 'http';
      const url = `${protocol}://${app.domain}`;

      console.log(
        chalk.green(`\n[App ${index + 1}]`) +
          ' ➡️  ' +
          chalk.bgGreen.black(` ${url} `)
      );
    });
  } catch (err) {
    console.error(chalk.red(`❌ Failed to start nginx: ${err.message}`));
  }
}
