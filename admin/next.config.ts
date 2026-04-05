import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const adminDir = path.dirname(__filename);

const nextConfig: NextConfig = {
  // Resolve React from the local admin node_modules to avoid the workspace-
  // hoisted copy (different version) causing dual-instance "useContext is null"
  // errors during static page prerendering.
  outputFileTracingRoot: path.resolve(adminDir, '..'),
  webpack: (config) => {
    // Prepend local node_modules so it takes priority over the hoisted root copy
    config.resolve.modules = [
      path.resolve(adminDir, 'node_modules'),
      ...(config.resolve.modules || ['node_modules']),
    ];
    return config;
  },
};

export default nextConfig;
