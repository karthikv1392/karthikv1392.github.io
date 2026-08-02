# Migration guide

This Eleventy project is designed to replace the current Jekyll source in `karthikv1392/karthikv1392.github.io` while preserving the existing domain and important public URLs.

## Content already migrated

- Home, academic, consulting, speaking, about, and sustainability pages
- Research, teaching, students, service activities, and talks archive
- All 40 BibTeX publication entries
- Seven research and applied project summaries
- Media coverage and 34 dated news posts
- Existing routes including `/research/`, `/publications/`, `/projects/`, `/teaching/`, `/students/`, `/activities/`, `/talks/`, `/events/`, `/media/`, and `/news/`

## Replacing the portrait

The responsive portrait files are:

- `src/assets/images/karthik-320.webp`
- `src/assets/images/karthik-600.webp`

Replace both files while preserving their names. Use a square source image. The path and alternative text are configured in `src/_data/site.js`.

## Re-running content migrations

The reusable scripts are in `scripts/`:

- `migrate-bibliography.js` converts the Jekyll BibTeX bibliography to Eleventy JSON.
- `migrate-pages.js` converts compatible detailed Markdown pages.
- `migrate-news.js` converts dated Jekyll news posts.

Review generated content before publishing, especially dates, current student status, event status, and external links.

## Publishing safely

1. Preserve the existing repository on a backup branch or tag.
2. Replace the repository source with this project.
3. In GitHub repository settings, select **GitHub Actions** as the Pages source.
4. Push to `master`; the workflow builds, checks the carbon budget, and deploys `_site`.
5. Keep `karthikvaidhyanathan.com` configured as the custom domain in GitHub Pages settings.

Do not switch the live site until the content and links have been reviewed.
