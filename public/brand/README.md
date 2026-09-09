# Manifly brand assets

Source art lives in `libraries/manifly-docs/manifly-icon/`. Regenerate everything
in this folder plus `public/icons/*` and `app/favicon.ico` with:

```bash
npm run brand
```

| File | Use |
|---|---|
| `manifly-mark.png` | The winged-banknote mark on its own (transparent). Rendered by `<BrandMark />` / `<Logo />` in `components/shared/Logo.tsx`. Use in nav rails, headers, auth screens. |
| `manifly-lockup.png` | Vertical mark + wordmark + tagline. Splash / centered hero use. |
| `manifly-wordmark-color.png` | Horizontal lockup, full colour, on light backgrounds. |
| `manifly-wordmark-mono.png` | Horizontal lockup, all-black, for print / single-colour contexts. |
| `manifly-wordmark-light.png` | Horizontal lockup with light text, for dark backgrounds. |

Brand colours (see `app/globals.css`): navy `#151515`, lime `#c9f45a`,
violet `#e8a0ff`, blue `#006ee9`, sky `#83e7ff`. Tagline: *Uang cepat, mimpi dekat.*
