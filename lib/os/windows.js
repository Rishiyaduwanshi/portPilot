import { execSync } from 'child_process';
import path from 'path';

export function isAdmin() {
    try {
        execSync('net session', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

export function elevatePrivileges(scriptPath) {
    try {
        const nodePath = process.execPath;
        const command = `powershell Start-Process "${nodePath}" -ArgumentList "${scriptPath}" -Verb RunAs -WindowStyle Hidden`;
        execSync(command, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

export function getHostsPath() {
    return path.join(process.env.SystemRoot, 'System32', 'drivers', 'etc', 'hosts');
}
export function getElevationMessage() {
    return {
        start: '🔒 Administrator privileges required to modify hosts file.',
        attempt: 'Attempting to restart with elevated privileges...',
        fail: [`
  🛑 Admin rights needed to modify hosts file.
  ⚠️ Auto-elevation failed.
  
  🧰 Fix it by running this command:
  
  ▶️ Start-Process powershell -ArgumentList "pnpm dev" -Verb RunAs
  
  🖱️ OR Right-click on your terminal → "Run as Administrator"
      `]
    };
}
