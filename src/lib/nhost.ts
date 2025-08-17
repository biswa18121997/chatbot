import { NhostClient } from '@nhost/nhost-js';

// Nhost configuration - update with your actual values
const nhost = new NhostClient({
  subdomain: process.env.VITE_NHOST_SUBDOMAIN || 'localhost',
  region: process.env.VITE_NHOST_REGION || 'local',
});

export { nhost };
export const { auth, storage, functions } = nhost;