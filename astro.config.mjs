import { defineConfig } from 'astro/config';

// The old Weebly addresses (/rationale.html, /projects--plans.html, ...) keep working
// through small redirect files in public/ (made by _source/make_redirects.py).
export default defineConfig({
  site: 'https://www.musicpaintmachine.be',
});
