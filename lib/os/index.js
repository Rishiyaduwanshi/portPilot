import * as windows from './windows.js';
import * as unix from './unix.js';

const isWindows = process.platform === 'win32';
const handler = isWindows ? windows : unix;

export const {
  isAdmin,
  elevatePrivileges,
  getHostsPath,
  getElevationMessage
} = handler;