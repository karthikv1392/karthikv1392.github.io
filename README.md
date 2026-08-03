# Karthik Vaidhyanathan — personal website

Low-carbon personal website built with Eleventy. The generated site is static HTML and CSS with no client-side JavaScript, tracking, external fonts, or third-party runtime requests.

## Requirements

- Node.js 22
- npm

## Local development

```bash
npm ci
npm run dev
```

The preview runs at `http://localhost:8080/`.

## Content updates

- Publications: replace `src/bibliography/publications.bib`, then run `npm run publications:sync`.
- News: add a Markdown file under `src/news/`.
- Projects: edit `src/_data/projects.json`.
- Teaching, students, service, research, and talks: edit their Markdown files under `src/`.
- Profile and navigation: edit `src/_data/site.js`.

See `PUBLICATIONS.md`, `PORTRAIT.md`, and `MIGRATION.md` for focused instructions.

## Validation

```bash
npm run build
npm run check:links
npm run check:accessibility
npm run check:budget
npm run report:carbon
```

## Deployment

GitHub Pages deploys through `.github/workflows/deploy.yml`. Netlify can use the included `netlify.toml`. Both build with `npm run build` and publish `_site`.
