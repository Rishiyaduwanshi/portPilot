import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function initCommand() {
  console.log(chalk.cyan('\n🛠️  Initializing PortPilot config...\n'));

  const apps = [];
  while (true) {
    const { domain, port, https } = await inquirer.prompt([
      { name: 'domain', message: '🌐 Domain name (e.g. app.local):', default: 'app.local' },
      { name: 'port', message: '📦 Port your app runs on:', default: 3000 },
      { type: 'confirm', name: 'https', message: '🔒 Use HTTPS?', default: false }
    ]);

    apps.push({ domain, port: parseInt(port), https });

    const { addMore } = await inquirer.prompt([
      { type: 'confirm', name: 'addMore', message: '➕ Add another app?', default: false }
    ]);

    if (!addMore) break;
  }

  const config = { apps };
  await fs.writeJSON(path.join(process.cwd(), '.pilotrc.json'), config, { spaces: 2 });

  console.log(chalk.green('\n✅ Created .pilotrc.json with'), apps.length, 'app(s)');
  console.log(chalk.blue('➡️  You can now run: portpilot start\n'));
}
