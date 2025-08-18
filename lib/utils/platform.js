import os from 'os';

export function detectPlatform() {
  const platform = os.platform();
  if (platform === 'win32') return 'windows';
  if (platform === 'linux') return 'linux';
  if (platform === 'darwin') return 'mac';
  throw new Error('Unsupported platform');
}

export const isWindows = detectPlatform() === 'windows';