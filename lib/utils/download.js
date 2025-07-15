import { pipeline } from 'node:stream/promises';
import fsExtra from 'fs-extra';
const { createWriteStream } = fsExtra;

import got from 'got';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';

/**
 * Downloads a file from the given URL and saves it to the destination.
 * 
 * @param {string} url - URL to download the file from.
 * @param {string} destination - Path where the file should be saved.
 */
export async function download(url, destination) {
  const spinner = ora(`⬇️ Downloading from ${url}...`).start();

  try {
    const response = await got.stream(url);
    await pipeline(response, createWriteStream(destination));

    if (process.platform !== 'win32') {
      await fs.chmod(destination, 0o755); 
    }

    spinner.succeed(`✅ Downloaded to ${destination}`);
  } catch (err) {
    spinner.fail(`❌ Failed to download ${url}`);
    console.error(chalk.red('Error:'), err.message);
    throw err;
  }
}
