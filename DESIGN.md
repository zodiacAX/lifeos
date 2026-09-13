# LIFE//OS Design System

## 1. Visual theme and atmosphere
LIFE//OS is a **cyberpunk personal progression operating system**, not a generic neon game dashboard. The primary reference is the supplied female cyberpunk character: twin dark hair buns, large goggles, red cropped utility jacket, black crop top, red tactical cargo trousers, mechanical forearms and lower legs, heavy boots, and small cyan illuminated modules.

The UI must feel like it was designed around her rather than placing a random character on top of a dashboard. Think: premium RPG character screen + industrial personal OS + restrained concept-art atmosphere.

Never turn the product into a combat game. The real game loop is:

`REAL ACTION → QUEST → COMPLETION → XP/CREDITS → LEVEL/ATTRIBUTES → REWARD → BETTER REAL LIFE`

## 2. Color roles
- **Void charcoal** `#0A0D0F` — page background.
- **Machine black** `#0F1417` — panels.
- **Soft off-white** `#EEF3F1` — primary text.
- **Muted steel** `#8D9A9D` — secondary text.
- **Electric cyan** `#63D9D8` — active state, progress, system energy.
- **Desaturated crimson** `#A94449` — identity accent and warning state.
- **Signal red** `#D25D5F` — sparing completion/error emphasis.
- **Earned gold** `#D6B770` — credits only.

Cyan is functional, not decorative confetti. Red connects the UI to the character's clothing. Gold means earned currency.

## 3. Typography
- System labels: IBM Plex Mono, uppercase, 7–11px, wide tracking.
- Primary UI: Inter, geometric and neutral.
- Large numbers: Inter 700/800 with tight tracking.
- Avoid sci-fi display fonts. The interface should feel authored, readable, and premium.

## 4. Component rules
- Panels: 1px technical borders, near-black surfaces, almost no rounding.
- Active nav: cyan line + icon, never a huge glowing pill.
- Progress: segmented technical bars.
- Buttons: precise rectangular controls; cyan for primary, dark outline for secondary.
- Quest cards: category signal on the left edge, progress and explicit reward.
- Character: never cover the face/body with UI; reserve negative space.
- Completion: small cyan burst + XP travel animation; no screen-filling confetti.

## 5. Layout principles
Desktop character screen uses the RPG-inspired 3-column composition:
1. Player identity/status.
2. Full-body character focal point.
3. Real-life core attributes.

Below: progression timeline + cosmetic loadout.

Quest/reward/journal screens keep the same top navigation and technical rhythm but use content-first layouts.

## 6. Motion
Motion is tactile but brief. Prefer `transform` and `opacity` only. No permanent canvas particle loop. Respect `prefers-reduced-motion`.

## 7. Guardrails
### Do
- Keep real-life purpose visible.
- Use the supplied character palette.
- Make XP, streaks, attributes, goals and rewards readable.
- Keep interactions fast and optimistic where safe.
- Use text in addition to color for status.

### Don't
- Add swords, armor, magic, spells, shields or combat stats.
- Use generic blue-purple gradients everywhere.
- Use glassmorphism on every card.
- Add random AI-looking floating blobs.
- Hide productivity behind lore.
- Trust client-submitted XP or credits.

## 8. Responsive behavior
- Desktop: cinematic 3-column character screen.
- Tablet: character first, identity next, attributes across the width.
- Mobile: character hero → level/XP → quests → attributes/rewards. Navigation becomes a compact menu, not a scaled desktop bar.
- Touch targets are at least ~44px where practical.

## 9. Accessibility
Visible focus rings, semantic buttons/forms/headings, text labels for status, sufficient contrast, reduced-motion mode, and keyboard shortcuts for main navigation.
