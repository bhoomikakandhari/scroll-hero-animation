// Static export so the site can be hosted on GitHub Pages.
const REPO = 'scroll-hero-animation';
const isProd = process.env.NODE_ENV === 'production';

export default {
  output: 'export',
  images: { unoptimized: true },
  basePath: isProd ? `/${REPO}` : '',
  assetPrefix: isProd ? `/${REPO}/` : '',
};