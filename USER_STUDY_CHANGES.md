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

## QA Test Plan (Branch Tree)

Each branch below represents a logical pathway through the app. The goal is full branch coverage across navigation, auth-gated states, data states, and API behavior.

1. **Global shell and navigation branch**
   - Sidebar renders on all routes.
   - Navigation links route correctly to `/`, `/assignment-2`, `/assignment-3`, `/assignment-5`.
   - Active nav state highlights correctly for the current page.
   - User menu appears only when authenticated.

2. **Assignment 1 branch (`/`)**
   - Page renders expected title/content.
   - No auth requirement.
   - Route returns HTTP 200.

3. **Assignment 2 data-table branch (`/assignment-2`)**
   - Page renders title and table selector.
   - `table` query param switches table correctly.
   - Handles Supabase-unconfigured state with a clear error message.
   - Handles empty-table state (`No rows in this table.`).
   - Handles successful table load and renders columns/rows.

4. **List page branch (`/list`)**
   - Page renders table name and back link.
   - Handles Supabase-unconfigured state.
   - Handles Supabase query error state.
   - Handles successful table load and row rendering.

5. **Assignments 3 & 4 auth gate branch (`/assignment-3`)**
   - Unauthenticated users see `GatedUI` sign-in prompt.
   - Authenticated users with valid session see caption voting UI.
   - Empty-caption state is shown when no unrated captions remain.
   - Vote actions submit valid payloads and advance captions correctly.
   - Count updates and refresh behavior remain consistent after each vote.

6. **Assignment 5 upload branch (`/assignment-5`)**
   - Unauthenticated users see sign-in gate copy.
   - Authenticated users see uploader.
   - File type validation blocks unsupported files.
   - Pipeline steps progress in order: presigned URL -> upload -> register -> caption generation.
   - Error handling surfaces actionable messages.
   - Success state shows generated captions and `Upload Another Image`.

7. **Auth/API branch**
   - `/api/vote` rejects unauthenticated requests with 401.
   - `/api/vote` rejects unsupported methods with 405.
   - OAuth route sequence (`authorize` -> `callback` -> app callback) preserves intended `next` destination.
   - Logout route clears server-side session cookie.

## Testing Summary (End-to-End Verification)

- Ran production-mode full workflow smoke tests **3 complete times** across `/`, `/assignment-2`, `/assignment-3`, `/assignment-5`, `/list`, and `/api/vote`.
- Confirmed all core route branches returned expected statuses/content in each run; all three runs passed after fixes.
- Found and fixed a voting flow bug in `components/CaptionVoter.tsx`: votes after the first transition could submit the stale initial `caption_id`.
- Updated vote submission to use the currently displayed caption ID, with a guard for missing display state.
- Rebuilt the app (`next build`) after the fix and re-ran the full 3-pass workflow test set; all passes succeeded.
- Verified unauthenticated API behavior is correct (`POST /api/vote` -> 401 Unauthorized; `GET /api/vote` -> 405 Method Not Allowed).
- Identified local dev-server watcher instability (`EMFILE`) during `next dev`; used production server testing to avoid false negatives and ensure demo readiness.
