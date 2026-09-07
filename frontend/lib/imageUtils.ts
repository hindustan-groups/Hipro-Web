/**
 * Utility to verify if an image URL is from a configured domain in next.config.mjs.
 * Configured remote domains: 'images.unsplash.com', 'res.cloudinary.com'
 * Local images starting with '/' (e.g. '/logo.jpg') are also optimizable.
 */
const ALLOWED_HOSTS = new Set([
  'images.unsplash.com',
  'res.cloudinary.com',
]);

export function isOptimizableImage(src?: string | null): boolean {
  if (!src || typeof src !== 'string') return false;
  // Local static images (e.g. /logo.jpg, /images/...)
  if (src.startsWith('/') && !src.startsWith('//')) return true;

  try {
    const url = new URL(src);
    return ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
