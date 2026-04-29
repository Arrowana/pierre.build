import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://pierre.build',
  trailingSlash: 'never',
  markdown: {
    shikiConfig: {
      theme: 'catppuccin-mocha',
      wrap: true
    }
  }
});
