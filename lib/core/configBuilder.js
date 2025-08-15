// lib/core/configBuilder.js
import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import chalk from 'chalk';

export function buildNginxConfig(app) {
  const baseDomain = app.domain;
  const port = app.port;
  const httpsEnabled = app.https === true;
  const customConfigPath = app.customAppConfigPath;

  const certDir = path.join(os.homedir(), '.portpilot', 'certs');
  const certPath = path.join(certDir, `${baseDomain}.pem`);
  const keyPath = path.join(certDir, `${baseDomain}-key.pem`);

  // ----- Use custom config if provided -----
  if (customConfigPath) {
    if (fs.pathExistsSync(customConfigPath)) {
      const rawConfig = fs.readFileSync(customConfigPath, 'utf-8');
      console.log(
        chalk.green(`🧩 Using custom nginx config for ${baseDomain}`)
      );
      return rawConfig.trim();
    } else {
      console.log(
        chalk.yellow(
          `⚠️  Custom config enabled for ${baseDomain} but file not found: ${customConfigPath}`
        )
      );
      console.log(
        chalk.yellow(
          `➡️  Falling back to default nginx config for ${baseDomain}`
        )
      );
    }
  }

  // ----- HTTPS certificate check -----
  if (httpsEnabled) {
    if (!fs.pathExistsSync(certPath) || !fs.pathExistsSync(keyPath)) {
      throw new Error(
        `SSL certificate or key not found for ${baseDomain}. Please generate them at:\n- ${certPath}\n- ${keyPath}`
      );
    }
  }

  // ----- Build config parts -----
  const configParts = [];

  if (httpsEnabled) {
    // Redirect HTTP → HTTPS
    configParts.push(
      `
server {
    listen 80;
    server_name ${baseDomain};

    return 301 https://$host$request_uri;
}`.trim()
    );

    // HTTPS server block
    configParts.push(
      `
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
    }
}`.trim()
    );
  } else {
    // Only HTTP server block
    configParts.push(
      `
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
    }
}`.trim()
    );
  }

  return configParts.join('\n\n').trim();
}
