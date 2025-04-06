export function isAdmin() {
  return process.getuid && process.getuid() === 0;
}

export function elevatePrivileges() {
  return false; 
}

export function getHostsPath() {
  return '/etc/hosts';
}

export function getElevationMessage() {
  return {
    start: '🔒 Root privileges required to modify hosts file.',
    attempt: 'Please run with sudo.',
    fail: [
      '❌ Please run PortPilot with sudo:',
      '    sudo pnpm dev'
    ]
  };
}