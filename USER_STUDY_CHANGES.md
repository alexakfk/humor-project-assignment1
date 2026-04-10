# User-Study-Driven Changes (Project 1)

This document summarizes product updates made in direct response to user study findings from Danielle, Aviya, and Ella.

## 1) Post-auth redirect now returns users to their intended page

### What changed
- Updated the sign-in flow in `components/GatedUI.tsx` to include the current route in the OAuth callback (`/auth/callback?next=...`).
- Updated `app/auth/callback/route.ts` to honor the `next` route and fall back to `/assignment-5` rather than `/assignment-3`.

### Why this addresses feedback
- Two participants were confused after sign-in when they landed on a different assignment page than expected.
- Returning users to the page they came from removes that disorientation and supports uninterrupted task flow.

## 2) Added persistent post-results call-to-action for continued use

### What changed
- Added a bottom CTA in `components/ImageUploader.tsx` that appears below generated captions:
  - `Upload Another Image`
- Added supporting styles in `app/globals.css` for the new bottom action area.

### Why this addresses feedback
- All three participants reached a dead-end feeling after captions were generated.
- On mobile and desktop, top controls were often out of view once users scrolled through results.
- A bottom CTA keeps the next action visible exactly where users finish reading captions.

## 3) Clarified ambiguous pre-upload "Clear" action

### What changed
- Updated the secondary pre-upload button text in `components/ImageUploader.tsx` from `Clear` to `Remove Selected Image`.

### Why this addresses feedback
- One participant hesitated because `Clear` did not clearly communicate whether it would cancel processing or just remove the preview.
- The new label is explicit and reduces decision friction.

## 4) Improved mobile menu discoverability

### What changed
- Updated `components/Sidebar.tsx` mobile toggle to show both icon and text label (`Menu` / `Close`) instead of icon-only.
- Enhanced toggle contrast, size, and prominence in `app/globals.css`:
  - larger touch target
  - stronger border and background contrast
  - visible text label and icon spacing
  - subtle elevation/shadow

### Why this addresses feedback
- One participant took noticeable time to discover the hamburger menu on mobile.
- Label + stronger visual prominence improves first-time discoverability and reduces search time.

## Additional update from feedback

### What changed
- Updated assignment gate copy in `app/assignment-5/page.tsx` to explain why sign-in is required:
  - "Sign in with Google to upload images, generate captions, and keep your uploads tied to your account."

### Why this addresses feedback
- Multiple users hesitated at authentication because the reason for sign-in was unclear.
- Providing purpose-oriented copy increases trust and reduces confusion at the gate.
