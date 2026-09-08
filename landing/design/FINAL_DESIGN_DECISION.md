# PymIA Landing — Final Design Decision

## Selected version

**Human Technical Studio — Event Hybrid, final polish (Direction C + Connected Operations layer).**

- **Stitch project:** `18367602588032126261`
- **Desktop screen:** `9497df7b3d854f36952c909dd1c045c9`
- **Mobile screen:** `c001bcdef1094f6bb0267180acfd3ec5`
- **Desktop image:** https://lh3.googleusercontent.com/aida/AEtjO1WD3QKbhbnSAeEazZ8KsNGRkherY1sQBrWqdGitjHboaP6PmhvmdX5MgARs32WJWXAqs29IQu0NBrhEB6yrevMsFS50aI9l5bRTBlqS8lgCTs5Ct0lXI9HStky4F-X2Sqo5EyQD-52vLOqPdTBXQCf1A1Dxr1yjSSclZNF1dU5H6p6EZoUXTxH7WBEXiVwcO7azhilA0ZPAQTOowOis91uMi8TIP8NpseU0rOQAq-TX4InSHt0Wtwa7U5HX
- **Mobile image:** https://lh3.googleusercontent.com/aida/AEtjO1W3L0hen0O-SbQ_TT6u2YXNOGEx8LEL_FoRZYOkebdflupeWL92HOvirUoXTerS8pk7_6E6MQadu4y9AZBaFI9EhKJD_8QRw6AdbHwdJLt_WVSer2gYrk-7DiedS2f8-TbeSb1MnvO2wOTW6lbR5vO3jYB02nHatmcBGcTHwbhIhl5hNhzghCx3wiJMDDyiM5wVwZetGyGAks2Eik909-NX4aFjCdX67Gmcwhlzfhthl42P8C-PoMTrM3Z5
- **HTML:** available from the corresponding Stitch screen metadata.

## Why this version

It is the clearest mixed-audience story for the event: human enough for sellers and Excel users, technically credible for developers, and immediately legible as “we add the missing piece” rather than “replace your stack.” The operational rail brings Direction B's strongest idea into Direction C without turning the page into a dashboard.

## Design plan

- **Atmosphere:** calm expertise, technical editorial, human studio.
- **Palette:** restrained neutrals with one functional accent; no purple/neon gradients or decorative glow.
- **Typography:** distinctive editorial display paired with a legible sans and monospaced technical labels.
- **Layout:** asymmetric desktop grid, alternating evidence bands, one-column mobile collapse, large QR quiet zone.
- **Memorable element:** the five-step operational rail and the oversized QR panel; everything else stays quiet.

## Required content preserved

Hero promise and subheadline, three audience doorways, seller pains, developer capabilities, Excel/PymIA checks, Determinístico + LLM responsibility split, integration-before-migration coexistence, operational WhatsApp use cases, survey CTA and `QR → SURVEY` placeholder.

## Assets

- Existing logo: `E:/BuenosPasos/smartbridge/Meli2026/landing/logopymia2.jpg`.
- QR remains a clearly marked placeholder until a public survey URL exists.
- Stitch screenshot and HTML references are stored in `design/iteration-01`, `iteration-02` and `iteration-03`.

## Motion decisions

One-time hero reveal; finite scroll reveals; restrained stagger for evidence rows; line-draw on the operational rail; hover/CTA feedback. Animate only `transform` and `opacity`. Respect `prefers-reduced-motion` with opacity-only or static fallback. No scroll hijacking or perpetual decorative animation.

## Vercel criteria

Design review: **0 critical issues / 0 high issues**. React handoff must use semantic `<a>`/`<button>` elements, visible focus states, balanced headings, meaningful image `alt` plus explicit dimensions, 44px touch targets, `touch-action: manipulation`, no horizontal overflow, lazy loading below the fold, and no `transition: all`.

## Skills used

- `stitch-design` / `generate-design`
- `stitch-build`
- `stitch-utilities` / `taste-design` / `design-md` / `stitch-loop`
- `frontend-design` (Anthropic)
- `web-design-guidelines` (Vercel Labs)
- `react-best-practices` (Vercel Labs)

**OWNER_DECISION_REQUIRED:** YES — direction is recommended, not locked for implementation without owner selection.
