import http from 'http';
import httpProxy from 'http-proxy';
import chalk from 'chalk';
import { isAdmin } from '../os/index.js';
import { execSync } from 'child_process';

function checkExistingWebServer() {
  try {
    const command = process.platform === 'win32'
      ? 'netstat -ano | findstr :80'
      : 'netstat -an | grep :80 | grep LISTEN';
      
    const netstat = execSync(command).toString();
    console.log(chalk.gray(`Existing web server detected: ${netstat}`));
    return netstat.includes(process.platform === 'win32' ? 'LISTENING' : 'LISTEN');
  } catch {
    return false;
  }
}

export async function createProxyServer(config) {
  const { port, domain, isLog } = config;
  const proxy = httpProxy.createProxyServer({});

  proxy.on('error', (err, req, res) => {
    console.error(chalk.red(`❌ Proxy error: ${err.message}`));
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Target server is not responding. Is your app running?');
    }
  });

  const server = http.createServer((req, res) => {
    if (isLog) {
      console.log(chalk.blue(`[${domain}] → http://localhost:${port}${req.url}`));
    }
    proxy.web(req, res, {
      target: `http://localhost:${port}`,
      changeOrigin: true
    });
  });

  const hasWebServer = checkExistingWebServer();
  
  if (!hasWebServer && !isAdmin()) {
    const msg = process.platform === 'win32'
      ? '🔒 No web server found. Need admin rights to use port 80. Run as Administrator.'
      : '🔒 No web server found. Need root privileges to use port 80. Run with sudo.';
    console.log(chalk.yellow(msg));
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    const proxyPort = hasWebServer ? port : 80;
    server.listen(proxyPort, () => {
      console.log(chalk.green(`✔ PortPilot running!`));
      console.log(chalk.cyan(`➜ Access your app at: http://${domain}`));
      console.log(chalk.gray(`  (Using ${hasWebServer ? 'existing web server' : 'direct port 80'} proxy)`));
      resolve(server);
    }).on('error', (err) => {
      reject(err);
    });
  });
}