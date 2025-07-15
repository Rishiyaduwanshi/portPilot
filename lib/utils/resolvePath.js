// lib/core/nginxPath.js
import os from 'os';
import path from 'path';
import { detectPlatform } from './platform.js';

export function getBundledNginxPath() {
  const platform = detectPlatform();
  const binaryName = platform === 'windows' ? 'nginx.exe' : 'nginx';
  return path.join(os.homedir(), '.portpilot', 'nginx-1.28.0', binaryName);
}

export function getNginxRootDir() {
  return path.join(os.homedir(), '.portpilot', 'nginx-1.28.0');
}

export function getHostPilotPath(){
  const portPilotRootDir = path.join(os.homedir(),'.portpilot')
  const executable = path.join(detectPlatform() === 'windows' ? 'hostpilot.exe' : 'hostpilot');
  return path.join(portPilotRootDir, executable)
}


export function getCustomNginxConfPath(baseDir, config) {
  if (typeof config === 'string') {
    return path.resolve(baseDir, config);
  }

  if (
    typeof config === 'object' &&
    config.enabled === true &&
    typeof config.path === 'string' &&
    config.path.trim() !== ''
  ) {
    return path.resolve(baseDir, config.path);
  }

  return null;
}
