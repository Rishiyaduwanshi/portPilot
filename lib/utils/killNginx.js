// lib/utils/killNginx.js
import { execa } from 'execa';
import os from 'os';

export async function killExistingNginx() {
  try {
    if (os.platform() === 'win32') {
      const { stdout } = await execa('tasklist');
      const lines = stdout.split('\n');
      const nginxProcs = lines.filter(line => line.toLowerCase().includes('nginx.exe'));

      for (const line of nginxProcs) {
        const pid = line.trim().split(/\s+/)[1];
        await execa('taskkill', ['/F', '/PID', pid]);
      }

    } else {
      await execa('pkill', ['-f', 'nginx']);
    }
  } catch (err) {
    
    // If pkill or taskkill fails, ignore
  }
}
