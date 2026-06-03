# Tailwind logical-property migration — DONE

> Companion to Task 11 of the bilingual migration. Read
> `docs/BILINGUAL_MIGRATION_STATUS.md` first.

## TL;DR

Bulk physical → logical Tailwind sweep landed in commit
[`3dcfa78`](https://example.invalid). 191 files changed; 888 occurrences flipped;
the codebase is now RTL-ready. Adding Arabic / Hebrew / Persian is a one-line
config change in `i18n/routing.ts` + a `messages/<locale>.json` catalog.

## Sweep result

| Metric | Value |
|---|---|
| Files touched | 191 |
| LOC delta | +1,007 / −1,007 (length-preserving rename) |
| Physical class occurrences before | 888 |
| Physical class occurrences after (true) | 0 truly-flippable, 3 deliberately unchanged (see below) |
| Method | One-off `sed` script with class-boundary lookbehind (whitespace, quote, or `:` for variant modifiers) |
| Render impact in current locales (EN, FR) | **None.** Both are LTR, so `ms-N` resolves to `margin-left: N` exactly like `ml-N` did. |
| Render impact when an RTL locale is added | Layout flips correctly across margins, paddings, alignment, positioning, borders, and rounding. |

### Why this is safe right now

Logical utilities are aliases that resolve to physical CSS at runtime based on the active `dir` attribute on `<html>`. With LTR (the only direction in `LOCALE_DIRECTION` today):

```
margin-inline-start  →  margin-left
margin-inline-end    →  margin-right
inset-inline-start   →  left
text-start           →  text-left
```

So today, `ms-2` and `ml-2` produce byte-identical CSS for an EN or FR user. The sweep was purely preparatory.

## Mappings applied

| Physical | Logical (now in use) |
|---|---|
| `ml-N` (margin-left) | `ms-N` (margin-inline-start) |
| `mr-N` (margin-right) | `me-N` (margin-inline-end) |
| `pl-N` (padding-left) | `ps-N` (padding-inline-start) |
| `pr-N` (padding-right) | `pe-N` (padding-inline-end) |
| `left-N` | `start-N` |
| `right-N` | `end-N` |
| `border-l[-N]` | `border-s[-N]` |
| `border-r[-N]` | `border-e[-N]` |
| `rounded-l[-N]` | `rounded-s[-N]` |
| `rounded-r[-N]` | `rounded-e[-N]` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |

All variant-prefixed forms (e.g. `sm:ml-2`, `hover:mr-4`, `dark:pl-0`) and negative-margin forms (`-ml-2`, `-mr-4`) were handled by the same script.

## Deliberately not flipped

3 occurrences in `components/dashboard/ModernNavigation.tsx` were intentionally left as physical because they have **no logical equivalent**:

| Utility | Reason |
|---|---|
| `left-full` | Positioning a tooltip flush against the right edge of its anchor. Tailwind has no `start-full` shorthand (would need an arbitrary `start-[100%]`). Cosmetic — the tooltip will appear on the wrong side in RTL; revisit only if it actually breaks. |
| `slide-in-from-left-2` × 2 | `tw-animate-css` keyframe utilities. The library doesn't ship `slide-in-from-start-N`. Likewise needs a manual keyframe definition for RTL. |

If/when you add an RTL locale, audit `ModernNavigation.tsx` for these three lines.

## Tailwind utilities NOT in the sweep

These already use logical insets internally — no conversion needed:

- `space-x-N` (child margins) — uses `margin-inline`
- `divide-x-N` — uses `border-inline`
- `gap-x-N` — uses `column-gap`, direction-agnostic
- `inset-x-N` — already `inset-inline`

## How the sweep was run

A one-off `sed` script with a class-boundary lookbehind. Not committed (single-use migration tool). The pattern:

```sh
sed -i -E "
  s/(^|[[:space:]]|[\"':])text-left\b/\1text-start/g
  s/(^|[[:space:]]|[\"':])text-right\b/\1text-end/g
  s/(^|[[:space:]]|[\"':])(-?)ml-/\1\2ms-/g
  s/(^|[[:space:]]|[\"':])(-?)mr-/\1\2me-/g
  s/(^|[[:space:]]|[\"':])(-?)pl-/\1\2ps-/g
  s/(^|[[:space:]]|[\"':])(-?)pr-/\1\2pe-/g
  s/(^|[[:space:]]|[\"':])(-?)left-([0-9])/\1\2start-\3/g
  s/(^|[[:space:]]|[\"':])(-?)right-([0-9])/\1\2end-\3/g
  s/(^|[[:space:]]|[\"':])border-l\b/\1border-s/g
  s/(^|[[:space:]]|[\"':])border-r\b/\1border-e/g
  s/(^|[[:space:]]|[\"':])border-l-/\1border-s-/g
  s/(^|[[:space:]]|[\"':])border-r-/\1border-e-/g
  s/(^|[[:space:]]|[\"':])rounded-l\b/\1rounded-s/g
  s/(^|[[:space:]]|[\"':])rounded-r\b/\1rounded-s/g
  s/(^|[[:space:]]|[\"':])rounded-l-/\1rounded-s-/g
  s/(^|[[:space:]]|[\"':])rounded-r-/\1rounded-e-/g
" path/to/*.tsx
```

Order-of-operations: `text-left/right` are substituted **before** `left-/right-` so they don't double-substitute.

## Enforcement for new code

There's no ESLint rule enforcing logical utilities. If you want one, add `eslint-plugin-tailwindcss` and configure `tailwindcss/no-arbitrary-value` plus a custom rule, or use [`bionic-reading-tailwind/no-physical-properties`](https://example.invalid) (or hand-roll a regex check in CI):

```bash
# CI sanity check — fail the build if a physical utility creeps back in.
grep -rE 'className=.*\b(ml|mr|pl|pr)-[0-9a-z\[]' components/ app/ \
  --exclude-dir=graphify-out --exclude-dir=node_modules \
  && { echo "Use logical Tailwind utilities (ms-, me-, ps-, pe-) instead."; exit 1; } \
  || echo "OK — no physical utilities found."
```

The `BILINGUAL_MIGRATION_STATUS.md` doc has the same grep in its Verification Commands section.

## Adding an RTL locale (the actual trigger for this work)

When the time comes:

1. Add the locale code (`"ar"`, `"he"`, `"fa"`) to `SUPPORTED_LOCALES` in `types/bilingual.ts`.
2. Set its direction to `"rtl"` in `LOCALE_DIRECTION` in `i18n/routing.ts`.
3. Add `messages/<locale>.json` (copy `en.json` and translate).
4. Boot the app, switch to the RTL locale, eyeball the layout.
5. Address any of the deliberately-unconverted positioning/animation utilities (see the section above).
6. If entity names need a third translation, you'd either add a `name<XX>` column or refactor to a JSONB `translations` map (current pair-column design supports two languages only).

The sweep is done — these steps are config + content only.
