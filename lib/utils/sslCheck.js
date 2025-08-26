import { execa } from 'execa';

/**
 * Checks if mkcert is installed on the system.
 * @returns {Promise<boolean>}
 */
export async function isMkcertInstalled() {
  try {
    await execa('mkcert', ['--version']);
    return true;
  } catch {
    return false;
  }
}


/**
 * Checks if Firefox NSS support is available (for mkcert -install).
 * @returns {Promise<boolean>} True if certutil is available.
 */
export async function isCertutilInstalled() {
  try {
    await execa('certutil', ['-V']);
    return true;
  } catch {
    return false;
  }
}
