# Project Lessons

- Wallpaper rollout: start with a small built-in gallery. Add remote sources,
  local uploads, daily rotation, and effects only in later, separately confirmed iterations.
- Wallpaper UI: do not embed the full gallery in the long settings form. Keep
  the entry compact, give image browsing its own clear hierarchy, and validate
  the actual light/dark visuals before calling the interface finished.
- Favicon replacements: compare the visible glyph size and stroke weight with
  real website favicons in both full and compact rows; matching the outer box
  alone can leave semantic icons looking too small.
- Wallpaper data preparation: distinguish source originals from delivery
  derivatives. Preserve original response bytes and native dimensions when
  the user requests large/original images; never silently substitute a 1080p,
  500 KiB resource. Choose online compression separately after source archiving.
- Wallpaper delivery target: the user confirmed a 4K UHD (3840 x 2160)
  maximum, high-quality WebP with no artificial 500 KiB cap, and no upscaling
  lower-resolution sources. Keep source originals separate from delivery files.
- CDN pricing: distinguish free-quota eligibility from extra HTTPS request
  charges. This wallpaper workload is static image acceleration; do not infer
  request surcharges from the console's free-quota warning.
- Online wallpaper rollout: stage and verify the hashed objects before exposing
  the new CDN gallery for acceptance. A valid HTTPS handshake or a root-path
  404 does not establish that any wallpaper is available.
- New-tab clock: treat the centered clock as standalone typography, not a small
  pill or status badge. Review mature new-tab references before choosing its
  visual hierarchy. Offer persistent tabs/clock home layouts rather than stacking
  both subjects: tabs keep the poem takeover motion; clock/date stay fixed while
  the poem expands in place.
- Clock poetry retains the original single-row poem/title, author seal and
  trailing actions. Do not stack them as a redesign. Reuse the tabs poem's
  restrained timing and easing; avoid per-line staggers or decorative motion.
- Center the poem/title itself, not the combined title/author/actions row.
  Share the original header UI across home layouts. Follow its rendered title
  width; when space runs out, hide actions first and then the author rather
  than shifting or squeezing the title. Verify the center against the clock.
- Persisted wallpaper startup: do not paint the mountain fallback while the
  selected image is loading or decoding. Show mountains only when selected or
  loading fails, and preserve intentional background-switch transitions.
- Wallpaper repository boundary: keep local source assets, curation tools and
  exports out of Git; application tests must pass without those local files.
- Theme presets: keep both collapsed and expanded mountain-poetry variants.
  Shorten preset summaries instead of widening the established settings sheet;
  the summary should foreground the layout, poem state, background and language.
- Poem defaults: synchronize both directions when the expanded-by-default setting
  changes at runtime. Let the existing controlled motion play the return animation;
  do not force a remount that resets the poem or skips the transition.
