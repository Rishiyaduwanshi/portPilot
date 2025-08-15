import { pipeline } from 'node:stream/promises';
import fs from 'fs-extra';
import got from 'got';
import chalk from 'chalk';
import ora from 'ora';
import path from 'node:path'; 

export async function download(url, destination) {
  const spinner = ora(`⬇️ Downloading from ${url}...`).start();

  try {
    await fs.ensureDir(path.dirname(destination)); 
    const response = await got.stream(url);
    await pipeline(response, fs.createWriteStream(destination));

    if (process.platform !== 'win32') {
      await fs.chmod(destination, 0o755); 
    }

    spinner.succeed(`Downloaded to ${destination}`);
  } catch (err) {
    spinner.fail(`❌ Failed to download ${url}`);
    console.error(chalk.red('Error:'), err.message);
    throw err;
  }
}
