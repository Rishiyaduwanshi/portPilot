// lib/core/configBuilder.js
import path from 'path';
import fs from 'fs-extra';
import { getNginxRootDir } from '../utils/resolvePath.js';
import chalk from 'chalk';

export function buildNginxConfig(app) {
  const baseDomain = app.domain;
  const port = app.port;
  const httpsEnabled = app.https === true;
  const customConfigPath = app.customNginxConfigPath;

  const certDir = path.join(getNginxRootDir(), 'certs');
  const certPath = path.join(certDir, `${baseDomain}.pem`);
  const keyPath = path.join(certDir, `${baseDomain}-key.pem`);


  if (customConfigPath) {
    if (fs.existsSync(customConfigPath)) {
      let rawConfig = fs.readFileSync(customConfigPath, 'utf-8');

      if (!/X-Served-By/i.test(rawConfig)) {
        rawConfig = rawConfig.replace(/location\s+\/\s*{[^}]*}/, (match) => {
          return match.replace(
            /}/,
            `
      proxy_set_header X-Served-By "PortPilot";
      add_header X-Served-By "PortPilot" always;
}`
          );
        });
      }

      console.log(chalk.green(`🧩 Using custom nginx config for ${baseDomain}`));
      return rawConfig.trim();
    } else {
      console.log(chalk.yellow(`⚠️  Custom config enabled for ${baseDomain} but file not found: ${customConfigPath}`));
      console.log(chalk.yellow(`➡️  Falling back to default nginx config for ${baseDomain}`));
    }
  } else {

  }

  const configParts = [];

  if (httpsEnabled) {
    configParts.push(`
server {
    listen 80;
    server_name ${baseDomain};

    return 301 https://$host$request_uri;
}`.trim());

    configParts.push(`
server {
    listen 443 ssl;
    server_name ${baseDomain};

    ssl_certificate ${certPath};
    ssl_certificate_key ${keyPath};


    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Served-By "PortPilot";
        add_header X-Served-By "PortPilot" always;
    }
}`.trim());
  } else {
    configParts.push(`
server {
    listen 80;
    server_name ${baseDomain};   

    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Served-By "PortPilot";
        add_header X-Served-By "PortPilot" always;
    }
}`.trim());
  }

  return configParts.join('\n\n');
}
