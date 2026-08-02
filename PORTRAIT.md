# Replacing the portrait

The site reads the portrait paths from `src/_data/site.js` and currently uses:

- `src/assets/images/karthik-320.webp` for compact screens
- `src/assets/images/karthik-600.webp` for high-density and larger displays

To replace the photograph, export a square source image and regenerate these two WebP files. Keep the small file below 30 KB and the large file below 70 KB where practical. Preserve the filenames to avoid changing any templates.

You can also add the original JPG, PNG, HEIC, or WebP to `src/assets/images/` and ask Codex to crop, resize, and compress it. The original source does not need to be published with the built site.
