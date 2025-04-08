import http from 'http';
import net from 'net';
import colorify from '../utils/colorify.js';
import { isAdmin } from '../os/index.js';
import { execSync } from 'child_process';

function checkPort80() {
  try {
    const portCheck = execSync('netstat -ano | findstr ":80" | findstr "LISTENING"', { encoding: 'utf8' });
    if (portCheck) {
      console.log(colorify.red('❌ Port 80 is in use'));
      console.log(colorify.yellow('Quick fix: Run these commands as Administrator:'));
      console.log(colorify.gray('net stop W3SVC'));
      console.log(colorify.gray('net stop WAS'));
      console.log(colorify.gray('Then try running PortPilot again'));
      return true;
    }
    return false;
  } catch {
    return false; 
  }
}

export async function createProxyServer(config, domainAlreadyMapped = false) {
  const { port, domain, isLog } = config;
  const port80InUse = checkPort80();
  const proxyPort = 9876;

  // Create server first
  const server = http.createServer((clientReq, clientRes) => {
    const requestHost = clientReq.headers.host?.toLowerCase() || '';
    const domainWithoutPort = requestHost.split(':')[0];
    
    if (!domainWithoutPort || (domainWithoutPort !== 'localhost' && domainWithoutPort !== domain.toLowerCase())) {
      clientRes.writeHead(404, { 'Content-Type': 'text/html' });
      clientRes.end(`
        <h1>Domain Not Found</h1>
        <p>The domain "${clientReq.headers.host}" is not configured with PortPilot.</p>
        <p>Expected domain: ${domain}</p>
      `);
      return;
    }

    const proxyReq = http.request({
      port: port,
      host: 'localhost',
      path: clientReq.url,
      method: clientReq.method,
      headers: {
        ...clientReq.headers,
        host: 'localhost:' + port
      }
    }, (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(clientRes);
    });

    proxyReq.on('error', (err) => {
      console.error(colorify.red(`❌ Proxy error: ${err.message}`));
      if (!clientRes.headersSent) {
        clientRes.writeHead(502, { 'Content-Type': 'text/html' });
        clientRes.end(`
          <h1>Application Not Running</h1>
          <p>Cannot connect to application on port ${port}</p>
          <p>Please make sure your application is running first!</p>
        `);
      }
      clientReq.destroy();
    });

    clientReq.pipe(proxyReq);

    // Handle client disconnect
    clientReq.on('error', () => {
      proxyReq.destroy();
    });
  });

  // Handle CONNECT for HTTPS
  server.on('connect', (req, clientSocket, head) => {
    const targetSocket = net.connect(port, 'localhost', () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      targetSocket.write(head);
      targetSocket.pipe(clientSocket);
      clientSocket.pipe(targetSocket);
    });
  });

  // Then handle port selection
  if (port80InUse) {
    console.log(colorify.yellow('⚠️ Port 80 is already in use by System. Using fallback port.'));
    return startOnPort(proxyPort);
  }

  // If domain was already mapped, we can try port 80 without admin rights
  const tryPort = domainAlreadyMapped ? 80 : (isAdmin() ? 80 : proxyPort);

  return startOnPort(tryPort);

  // Helper function to start server
  function startOnPort(port) {
    return new Promise((resolve, reject) => {
      server.listen(port, () => {
        console.log(colorify.green(`✔ PortPilot running on port ${port}`));
        console.log(colorify.cyan(`➜ Access your app at: http://${domain}${port !== 80 ? `:${port}` : ''}`));
        console.log(colorify.gray(`  (Proxying to localhost:${config.port})`));
        if (!domainAlreadyMapped && port !== 80) {
          console.log(colorify.yellow('ℹ️  Run as administrator to use port 80'));
        }
        resolve(server);
      }).on('error', (err) => {
        if (port === 80) {
          console.log(colorify.yellow('Falling back to port 3001...'));
          return startOnPort(proxyPort).then(resolve).catch(reject);
        }
        reject(err);
      });
    });
  }
}