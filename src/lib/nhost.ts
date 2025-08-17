import { NhostClient } from '@nhost/nhost-js';

// Replace with your actual Nhost subdomain and region
const nhost = new NhostClient({
  subdomain: 'your-subdomain',
  region: 'your-region',
});

export { nhost };
export const { auth, storage, functions } = nhost;