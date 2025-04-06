import { ensureDomainInHosts } from './lib/host.js';
import { createProxyServer } from './lib/proxy/server.js';

export async function startProxy(config) {
  const domainAlreadyMapped = await ensureDomainInHosts(config.domain);
  await createProxyServer(config, domainAlreadyMapped);
}
