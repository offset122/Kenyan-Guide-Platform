# 🎨 Premium UI/UX Design To-Do List
> My Kenyan Guide — Mobile App

---

## 1. Typography & Visual Hierarchy

- [ ] Introduce a display font (e.g. **Playfair Display** or **DM Serif Display**) for hero headings on Home and Listing Detail to contrast with Inter body text — creates a luxury editorial feel
- [ ] Increase the Home greeting font size to ~28–30px with tighter letter-spacing (`-0.8`) and add a subtle gold text gradient using `expo-linear-gradient` + `MaskedView`
- [ ] Standardise section title style across all screens — currently `sectionTitle` varies between screens (13px uppercase on Profile vs 16px bold on Listing Detail)
- [ ] Add `lineHeight` to all multi-line body text that's currently missing it (e.g. listing subtitles, tag text) for better readability

---

## 2. Home Screen (`index.tsx`)

- [ ] **Hero Banner** — replace the plain search bar area with a full-width hero card (LinearGradient, Kenyan landscape or abstract pattern, app tagline) above the search bar for a strong first impression
- [ ] **Search Bar** — add a glowing gold border on focus, increase height to 52px, round to `borderRadius: 26` (pill shape), and add a subtle inner shadow
- [ ] **Stats Chips** — replace flat chips with mini glass cards that have a faint gold shimmer border (`glassBorderStrong`) and a larger icon (16px) — currently they look too small and plain
- [ ] **Category Chips** — increase icon container to 52×52, add a pressed scale animation (`Animated.spring` to 0.93), and show the category subtitle below the title on two lines
- [ ] **Featured Section** — widen `FeaturedCard` to 190px, increase image area to 150px height, and add a horizontal parallax scroll hint (show 30% of next card)
- [ ] **"Nearby" Section** — add a pulsing green dot next to the section title when GPS is active to signal live data
- [ ] **Jobs Strip** — style job cards with a left-side colored accent bar (category color) instead of the plain card — makes them scannable at a glance
- [ ] **Marketplace Grid** — increase product card image height to 160px and add a price badge overlay on the image (bottom-right) instead of below it
- [ ] **Location Nudge Banner** — redesign as a full-width gradient banner (green→darkBg) with a map pin animation instead of a plain chip

---

## 3. FeaturedCard (`FeaturedCard.tsx`)

- [ ] Add a **gold shimmer sweep animation** on the bottom accent bar using `Animated` — signals "premium" listing
- [ ] Replace the plain `bottomAccent` (2px bar) with a `LinearGradient` strip going from `gold` to `transparent` left-to-right
- [ ] Add a subtle **scale-up on press** (`activeOpacity` is not enough — use `Animated.spring` to 1.02 on `onPressIn`)
- [ ] Show the **category name** as a small pill badge on the image (top-left) instead of only the listing badge

---

## 4. ListingCard (`ListingCard.tsx`)

- [ ] Add a **left-side category color accent bar** (4px wide, full height, `borderRadius: 2`) to the standard card for instant visual category identification
- [ ] The `cardHighlight` top line is too subtle — increase opacity to `0.35` and extend it full-width
- [ ] **Avatar** — increase to 58×58, add a `borderWidth: 1.5` with `glassBorderStrong` color for depth
- [ ] **Image card** — increase image height from 200px to 220px; add a subtle vignette gradient on all 4 edges (not just bottom)
- [ ] **Tags** — add a left-side colored dot matching the tag category color before each tag text

---

## 5. Explore Screen (`explore.tsx`)

- [ ] **Header** — add a subtle animated count that ticks up when filters change (use `Animated.timing` on the number)
- [ ] **Category Filter Chips** — add a bottom indicator line (2px gold) under the active chip instead of just a border color change — more native/premium feel
- [ ] **Grid Cards** — the grid card (`gridCard`) has `borderRadius: 14` but list cards use 20 — unify to 18 across the board
- [ ] **Filter Modal** — add a `BlurView` background overlay instead of plain `rgba(0,0,0,0.6)` for a frosted glass sheet effect
- [ ] **Empty State** — replace the plain icon with a Lottie animation (search/empty animation) for a polished no-results experience
- [ ] **Sort Bar** — animate it sliding in from the top with `FadeInDown` when a sort is applied

---

## 6. Listing Detail Screen (`listing/[id].tsx`)

- [ ] **Photo Gallery** — add a full-bleed hero image that extends behind the nav bar (remove `paddingTop` from the container, overlay the nav buttons on top of the image with a gradient fade)
- [ ] **Nav Buttons** — use `BlurView` background on nav buttons when over the photo for a native iOS feel
- [ ] **Photo Dots** — replace with a thin progress bar style indicator (like Instagram Stories) instead of dots
- [ ] **Category Banner** — add a `LinearGradient` overlay on the category color banner so it fades into `darkBg` at the bottom
- [ ] **Price Box** — add a subtle gold glow (`shadowColor: Colors.gold, shadowOpacity: 0.3`) to the price box
- [ ] **Action Bar** — add a `BlurView` background to the bottom action bar instead of `darkBg + F0` opacity hack; add a top border gradient
- [ ] **Reviews** — add star fill animation when the user taps a star in the review form (scale + color transition)
- [ ] **Contact Card** — show a WhatsApp green indicator dot next to the phone number if `listing.whatsapp` exists

---

## 7. Profile Screen (`profile.tsx`)

- [ ] **Profile Card** — add a `LinearGradient` background to the profile card (dark green → darkCard) instead of flat `darkCard`
- [ ] **Avatar** — increase to 80×80, add a gold ring with a 3px gap (double border trick using a wrapper View) for a premium look
- [ ] **Stats Row** — animate the stat numbers counting up from 0 on mount using `Animated.timing`
- [ ] **Quick Action Grid** — add a pressed state glow (gold shadow) on action cards; currently they feel flat
- [ ] **Menu Items** — add a right-side chevron animation (slide right 3px) on press for tactile feedback
- [ ] **Guest State** — add a `LinearGradient` hero area at the top with the app logo and tagline before the sign-in buttons

---

## 8. Auth Screens (`auth/index.tsx`, `auth/signup.tsx`)

- [ ] **Logo/Hero** — replace the plain `shield-checkmark` icon with the actual app logo or a Kenya-themed illustration; add a `LinearGradient` background behind it
- [ ] **Input Fields** — add a gold `borderColor` transition on focus (use `useState` + `onFocus`/`onBlur` to toggle border color)
- [ ] **Sign In Button** — add a `LinearGradient` fill (gold → goldDark) instead of flat gold background
- [ ] **Divider** — replace the plain text divider with a more elegant OR divider with decorative lines

---

## 9. Create Listing Screen (`create.tsx`)

- [ ] **Progress Bar** — increase height to 4px, add a gold glow (`shadowColor: gold`) and animate the fill with `Animated.timing` instead of a static width
- [ ] **Category Cards** — add a checkmark animation (scale in from 0) when a category is selected; currently the check just appears
- [ ] **Step Transitions** — add `FadeInRight` / `FadeOutLeft` slide animations between steps instead of instant swap
- [ ] **Photo Grid** — add a drag-to-reorder interaction for photos (use `react-native-draggable-flatlist`)
- [ ] **Publish Button** — add a success confetti/particle burst animation on successful publish

---

## 10. Tab Bar (`_layout.tsx`)

- [ ] **Post Tab (center)** — make the center "Post" tab button larger (elevated, gold background circle, 56×56) that floats above the tab bar — standard premium marketplace pattern
- [ ] **Active Tab Indicator** — add a small gold dot below the active tab icon instead of just color change
- [ ] **Tab Bar** — increase `borderTopColor` opacity to `glassBorderStrong` for a more defined separation

---

## 11. Skeleton / Loading States (`SkeletonCard.tsx`)

- [ ] Replace the basic opacity pulse with a **horizontal shimmer sweep** using a `LinearGradient` that animates left-to-right (true skeleton shimmer effect like Facebook/LinkedIn)
- [ ] Add skeleton variants for the FeaturedCard (horizontal scroll) and the grid card layouts

---

## 12. Micro-interactions & Motion

- [ ] Add **haptic feedback** to all bookmark toggles, category selections, and filter changes (currently only some actions have it)
- [ ] Add a **bookmark save animation** — the icon should scale up to 1.3 then back to 1.0 with a gold color flash
- [ ] Add **scroll-based header compression** on Home — the greeting shrinks and the search bar sticks to the top as the user scrolls down
- [ ] Add **pull-to-refresh** custom indicator using the app logo or a Kenyan flag color spinner instead of the default system spinner

---

## 13. Color & Theming Refinements

- [ ] Add `goldGradient` as a reusable constant: `["#E8C87A", "#C9A84C", "#A07830"]` and use it consistently on all primary CTAs
- [ ] The `textMuted` color (`#5A6B58`) is too green-tinted — shift to `#6B7280` (neutral grey) for better readability on muted text
- [ ] Add a `surface` color token (`rgba(255,255,255,0.03)`) for very subtle card differentiation on the darkest backgrounds
- [ ] Ensure all interactive elements have a minimum 44×44pt touch target (audit small icon buttons like the `searchIconBtn` at 20px icon with no explicit size)

---

## 14. Empty & Error States

- [ ] **Saved Screen empty state** — add an illustration or Lottie animation instead of just an icon
- [ ] **Search no-results** — add a "Did you mean...?" suggestion row
- [ ] **Network error states** — add a consistent full-screen error component with a retry button and illustration across all data-fetching screens
- [ ] **Not Found (404)** — the listing not-found state is very bare — add an illustration and a "Browse similar listings" CTA

---

## 15. Accessibility & Polish

- [ ] Add `accessibilityLabel` and `accessibilityRole` to all `TouchableOpacity` buttons that only contain icons
- [ ] Ensure all text meets WCAG AA contrast ratio against their backgrounds (especially `textMuted` on `darkCard`)
- [ ] Add `numberOfLines` limits to all listing titles and subtitles in list views to prevent layout breaks with long text
- [ ] Test and fix safe area insets on Android — the `isWeb ? 67 : insets.top` pattern may not account for all Android notch sizes correctly
