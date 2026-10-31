/** @type {import('next').NextConfig} */
const nextConfig = {
  // The repo root has its own lockfile; skyview is its own project.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
