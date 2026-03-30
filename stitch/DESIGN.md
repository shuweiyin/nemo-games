# Design System Document: The Immersive High-End Gaming Experience

## 1. Overview & Creative North Star: "The Neon Nocturne"
This design system is built to transform a standard gaming interface into a premium, cinematic destination. Our Creative North Star is **"The Neon Nocturne"**—an aesthetic that balances the infinite depth of deep space with the electric energy of high-performance hardware.

To move beyond the "generic dark mode" template, this system utilizes **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid, centered grids, we use overlapping elements (e.g., hero imagery bleeding into the navigation) and exaggerated typography scales to create an editorial feel. We prioritize breathing room over information density to ensure every game title feels like a curated gallery piece.

---

## 2. Colors & Surface Philosophy
The palette is rooted in `surface` (#0e0e11) to provide a true "void" background, allowing our vibrant accents to vibrate against the dark.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning are strictly prohibited. We define boundaries through tonal shifts. 
- To separate a sidebar from a main feed, transition from `surface` to `surface-container-low`. 
- For an inner content area, move to `surface-container-high`. 
- This creates a sophisticated, "molded" look rather than a "boxed-in" feel.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- **Base Level:** `surface` (#0e0e11)
- **Primary Layout Sections:** `surface-container-low` (#131316)
- **Nested Cards/Modules:** `surface-container-highest` (#25252a)
This "stacked glass" approach ensures the UI feels like a single, cohesive unit rather than fragmented pieces.

### The "Glass & Gradient" Rule
To achieve a premium "glow," floating elements (modals, dropdowns) must use **Glassmorphism**.
- **Formula:** `surface-variant` at 60% opacity + 20px Backdrop Blur.
- **CTAs:** Never use a flat color. Use a linear gradient transitioning from `primary` (#d095ff) to `primary-container` (#c782ff) at a 135-degree angle to give buttons "soul" and dimension.

---

## 3. Typography: Editorial Dominance
We pair the technical precision of **Space Grotesk** for headlines with the approachable readability of **Manrope** for body text.

*   **Display-LG (Space Grotesk, 3.5rem):** Reserved for game titles and major marketing beats. Use tight letter-spacing (-0.02em) to create a high-fashion, "Display" impact.
*   **Headline-MD (Space Grotesk, 1.75rem):** Used for section headers. Ensure these have significant `spacing-12` top margins to let the content breathe.
*   **Body-LG (Manrope, 1rem):** The workhorse for descriptions. Use `on_surface_variant` (#acaaae) for secondary body text to maintain the dark-room atmosphere.
*   **Label-MD (Manrope, 0.75rem):** All-caps with 0.1rem letter spacing, used exclusively for metadata (e.g., GENRE, RELEASE DATE) to provide a technical, "HUD" feel.

---

## 4. Elevation & Depth
In this system, light doesn't come from above; it radiates from the components themselves.

### The Layering Principle
Avoid "drop shadows" that look like gray fuzzy clouds. Instead, use **Tonal Layering**. Place a `surface-container-lowest` (#000000) card on a `surface-container` (#19191d) background. The "lift" is perceived by the eye through contrast, not artificial shadow.

### Ambient Glows
When a "floating" effect is required for a featured game card:
- **Shadow:** Use the `primary` token (#d095ff) at 8% opacity with a 40px blur. 
- This mimics the "Ambient Link" lighting found in high-end gaming setups.

### The "Ghost Border" Fallback
If contrast is needed for accessibility, use a **Ghost Border**: 
- Token: `outline-variant` (#48474b) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Cards (The "Hero" Component)
*   **Styling:** Radius `xl` (1.5rem). No borders.
*   **Interaction:** On hover, the card should scale (1.02x) and the `primary` ambient glow should increase from 8% to 15% opacity.
*   **Content:** Forbid dividers. Use `spacing-6` to separate the image from the title.

### Buttons
*   **Primary:** Gradient (`primary` to `primary-container`), Radius `full`. Text color `on_primary_container` (#38005e).
*   **Secondary:** Ghost style. No background. `Ghost Border` (15% opacity `outline-variant`).
*   **Tertiary:** Text-only using `secondary` (#00e3fd) with an underline that only appears on hover.

### Input Fields
*   **Base:** `surface_container_highest` background. 
*   **Active State:** Change background to `surface_bright` and add a subtle 2px bottom "glow" line using the `secondary` token.
*   **Error:** Use `error` (#ff6e84) but only for the helper text and a 2px left-side indicator, never a full red box.

### Chips (Game Tags)
*   **Style:** `surface-container-high` background with `label-sm` typography. Radius `md`. 
*   **Selection:** When selected, the chip's background becomes `primary` with `on_primary` text.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. For example, a hero image aligned to the right with text overlapping it from the left.
*   **Do** use `surface-container-lowest` (#000000) for the most "sunken" interactive areas, like chat inputs or search bars.
*   **Do** embrace negative space. If a screen feels crowded, increase your spacing tokens.

### Don't:
*   **Don't** use dividers or lines. If you need to separate content, use a background shift to `surface-container-low` or increase the `spacing` scale to `8` or `12`.
*   **Don't** use pure white (#ffffff) for text. Always use `on_surface` (#f0edf1) or `on_surface_variant` (#acaaae) to prevent eye strain in dark environments.
*   **Don't** use sharp corners. Every interactive element must use at least `DEFAULT` (0.5rem) or `lg` (1rem) roundedness to maintain the "premium liquid" aesthetic.

---

## 7. Signature Interaction: The "Pulse"
Whenever an action is completed (e.g., game purchased, friend added), the component should emit a subtle, 0.5s radial gradient pulse of the `secondary` (#00e3fd) color at 5% opacity. This reinforces the "living" nature of the gaming platform.