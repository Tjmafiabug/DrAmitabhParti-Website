# Design System Strategy: The Digital Broadsheet

## 1. Overview & Creative North Star
**Creative North Star: "The Clinical Manuscript"**

This design system rejects the "app-like" fatigue of modern software in favor of the intellectual authority found in high-end medical journals and prestige news broadsheets. We are not building a dashboard; we are curating a definitive record of medical thought. 

The aesthetic breaks the "template" look through **structural brutalism tempered by organic tones**. By utilizing a razor-sharp 0px radius across all elements and a tight, information-dense grid, we elevate educational content to the level of "breaking" news. The layout should feel intentional and permanent, moving away from floating bubbles and toward an architectural stacking of information.

---

## 2. Colors & Surface Logic

### The Palette
The palette is grounded in **Soft Bone (#F9F7F2)** to reduce eye strain during long-form reading, accented by **Muted Clay (#B89F8D)** for intellectual warmth and **Ink Black (#1A1A1A)** for absolute authority.

- **Primary (`#6f5a4b`):** Used for key actions and authoritative highlights.
- **Surface (`#fbf9f4`):** The "Paper." All layouts begin here.
- **Secondary (`#5f5e5e`):** Reserved for technical metadata and secondary insights.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. 
Structure must be achieved through **background shifts**. To separate a sidebar from an article, shift the background from `surface` to `surface-container-low`. To highlight a "breaking" medical alert, use `primary-container`. High-contrast lines are a crutch; tonal transitions are a craft.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, premium cardstock. 
- **Base Level:** `surface`
- **In-Page Sections:** `surface-container-low`
- **Interactive Cards:** `surface-container-highest` or `surface-container-lowest` (depending on the desired "lift").
Nesting should follow a logical "recess" or "extrusion." A `surface-container-high` card should live on a `surface-container-low` section to create a subtle, tactile difference in depth.

### The "Glass & Gradient" Rule
While the system is grounded, hero sections and "Breaking Insights" should use a subtle **Linear Gradient** (from `primary` to `primary-container` at a 135° angle). This adds "soul" to the data. For mobile navigation or floating headers, use **Glassmorphism**: `surface` color at 85% opacity with a `20px` backdrop-blur.

---

## 3. Typography
The typography is the voice of the system. We use a high-contrast pairing to distinguish between "The Narrative" and "The Data."

*   **The Narrative (Newsreader):** A sophisticated serif used for all `display`, `headline`, and `body` scales. It conveys the gravity of medical research. 
    *   *Directorial Note:* Use `display-lg` (3.5rem) for major breakthroughs, ensuring tight letter-spacing (-0.02em) to maintain a modern, "ink-on-paper" feel.
*   **The Data (Space Grotesk):** A technical mono-spaced font for `label` scales. This is used for timestamps, medical IDs, and technical metadata.
    *   *Directorial Note:* Labels should always be Uppercase with +0.05em tracking to emphasize their role as "objective data points" against the "narrative" serif.

---

## 4. Elevation & Depth

### The Layering Principle
Traditional dropshadows are forbidden in the standard flow. Depth is achieved via **Tonal Layering**. By placing a `surface-container-lowest` (#ffffff) element against a `surface-container-low` (#f5f3ee) background, you create a natural "paper-on-desk" lift that feels organic to a journalism-inspired UI.

### Ambient Shadows
When an element must float (e.g., a modal or a floating action button), use **Ambient Shadows**:
- **Color:** A 10% opacity version of `on-surface` (#1b1c19).
- **Properties:** Blur: 40px, Y-Offset: 12px.
This mimics the soft diffusion of light in a gallery setting rather than a digital "glow."

### The "Ghost Border" Fallback
If a boundary is required for accessibility in forms, use a **Ghost Border**: `outline-variant` (#d2c4bb) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons (Architectural State)
- **Radius:** 0px (Strict).
- **Primary:** `primary` background with `on-primary` text. No shadow.
- **Secondary:** `surface-container-highest` background.
- **State Change:** On hover, shift background color by one tier (e.g., `primary` to `primary_container`)—do not use "lighten/darken" filters.

### Input Fields (The Ledger Style)
Inputs should not be "boxes." They are underlined fields. Use the `outline` token for the bottom border (1px). When active, the border remains 1px but transitions to `primary`. Labels must use `label-md` (Space Grotesk) to maintain the technical/medical aesthetic.

### Cards & Lists (The Editorial Feed)
- **No Dividers:** Forbid the use of horizontal rules. Use `1.5rem` to `2rem` of vertical white space to separate list items.
- **Asymmetry:** In news feeds, stagger card widths (e.g., 60% / 40% split) to break the "Bootstrap" feel and create a dynamic, editorial rhythm.

### Interactive "Medical Chips"
Used for categories like "Pathology" or "Neurology." 
- **Style:** `surface-container-highest` background, 0px radius, `label-sm` mono-spaced text.

---

## 6. Do's and Don'ts

### Do
- **Do** use whitespace as a functional element. In a high-end broadsheet, space is a luxury.
- **Do** use `headline-lg` for impactful quotes within articles, set in `primary` color.
- **Do** ensure all text maintains a contrast ratio of at least 7:1 against its background.

### Don't
- **Don't** use rounded corners. A single 4px corner breaks the entire "Broadsheet" authority.
- **Don't** use standard blue for links. Use `primary` or `ink black` with a 1px `primary` underline.
- **Don't** over-animate. Transitions should be "instant" or "slow-fade" (300ms ease-out). Avoid "bouncy" or "elastic" easing.