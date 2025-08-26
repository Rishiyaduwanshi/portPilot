// lib/core/configBuilder.js
import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execa } from 'execa';
import { isMkcertInstalled, isCertutilInstalled } from '../utils/sslCheck.js';

/**
 * Builds the nginx config for the given app. Handles mkcert detection and cert generation for HTTPS.
 * @async
 */
export async function buildNginxConfig(app) {
  const baseDomain = app.domain;
  const port = app.port;
  const httpsEnabled = app.https === true;
  const customConfigPath = app.customAppConfigPath;

  const certDir = path.join(os.homedir(), '.portpilot', 'certs');
  const certPath = path.posix.join(certDir.split(path.sep).join('/'), `${baseDomain}.pem`);
  const keyPath = path.posix.join(certDir.split(path.sep).join('/'), `${baseDomain}-key.pem`);  

  // ----- Use custom config if provided -----
  if (customConfigPath) {
    if (await fs.pathExists(customConfigPath)) {
      const rawConfig = await fs.readFile(customConfigPath, 'utf-8');
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
          `➡️  Falling back to default nginx config for ${baseDomain}`)
      );
    }
  }

  // ----- HTTPS certificate check and mkcert integration -----
  if (httpsEnabled) {
    const certExists = fs.existsSync(certPath) && fs.existsSync(keyPath);
    if (!certExists) {
      // Only require mkcert, everything else is automatic
      const mkcert = await isMkcertInstalled();
      if (!mkcert) {
        throw new Error(
          'mkcert is not installed. Please install mkcert to enable HTTPS. See: https://github.com/FiloSottile/mkcert#installation'
        );
      }
      // Warn if certutil is missing (for Firefox support)
      const certutil = await isCertutilInstalled();
      if (!certutil) {
        console.log(
          chalk.yellow('⚠️  certutil (NSS tools) not found. Firefox trust store integration may not work. Ignore this if you dont want to use firefox See: https://github.com/FiloSottile/mkcert#installation')
        );
      }
      // Ensure certs dir exists
      await fs.ensureDir(certDir);
      // Generate cert and key for the domain
      try {
        await execa('mkcert', ['-key-file', keyPath, '-cert-file', certPath, baseDomain]);
        console.log(chalk.green(`✅ SSL certificate generated for ${baseDomain}`));
      } catch (err) {
        throw new Error(`Failed to generate SSL cert for ${baseDomain} : ${err}`);
      }
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
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`.trim()
    );
  }

  return configParts.join('\n\n').trim();
}
