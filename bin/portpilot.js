#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from '../lib/commands/init.js';
import { startCommand } from '../lib/commands/start.js';
import { stopCommand } from '../lib/commands/stop.js';
import fs from 'fs-extra'
const version = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url))).version

const program = new Command();

program
  .name('portpilot')
  .description('🚢 Localhost port proxy with ease')
  .version(version);

program.command('init').description('Initialize config').action(initCommand);
program.command('start').description('Start the proxy').action(startCommand);
program.command('stop').description('Stop the proxy').action(stopCommand);

program.parse();