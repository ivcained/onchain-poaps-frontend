# Farcaster artwork drop folder

Upload the designed files into this directory. Use PNG for maximum compatibility.

## Required/expected assets

| File | Use | Exact recommended size | Aspect ratio |
|---|---|---:|---:|
| `embed.png` | Feed/cast Mini App preview (`fc:miniapp.imageUrl`) | 1200 × 800 px | 3:2 |
| `icon.png` | App icon and launcher identity | 200 × 200 px | 1:1 |
| `splash.png` | Launch splash artwork | 200 × 200 px | 1:1 |
| `og-image.png` | Standalone website social preview | 1200 × 630 px | 1.91:1 |

The 3:2 constraints you found apply to the feed/embed image: PNG, JPG, GIF, or WebP; minimum 600×400; maximum 3000×2000; under 10 MB; URL no longer than 1024 characters.

For the best single design target, make `embed.png` exactly 1200×800 px and keep important text/logo elements inside a safe margin of roughly 70 px on every side.

The icon and splash are separate square assets. Keep them simple and legible at small sizes; do not use the 3:2 canvas for those files.

## Naming

Use these exact lowercase filenames:

- `embed.png`
- `icon.png`
- `splash.png`
- `og-image.png`

Do not upload API keys, private keys, or other secrets here. These files will become publicly served assets.
