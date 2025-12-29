# Implementation Plan: Adaptive Profile Page

**Branch**: `001-adaptive-profile-page` | **Date**: 2025-12-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-adaptive-profile-page/spec.md`

## Summary

Build an adaptive personal profile page for David Graça that personalizes the visitor experience based on detected context (language, time, location, weather, referrer, device) while maintaining strict privacy principles. The page serves as an executive/speaker portfolio, outputs structured YAML for AI bots, supports 4 full translations plus 40+ greeting languages, and degrades gracefully when JavaScript or APIs fail. Hosted on GitHub Pages using vanilla HTML/CSS/JS.

## Technical Context

**Language/Version**: HTML5, CSS3, ES6+ JavaScript (no transpilation needed)  
**Primary Dependencies**: None (vanilla stack for GitHub Pages compatibility)  
**Storage**: localStorage (client-side only, visit history)  
**Testing**: Manual browser testing + Lighthouse audits  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) + GitHub Pages hosting  
**Project Type**: Static web (single page)  
**Performance Goals**: FCP < 1.5s on 3G, total weight < 500KB  
**Constraints**: No server-side code, no build step, no API keys, WCAG 2.1 AA  
**Scale/Scope**: Single page, 4 full translations, ~40 greeting translations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Validation |
|-----------|--------|------------|
| I. Visitor-First Experience | ✅ PASS | Core HTML renders without JS; CSS loads inline-critical; personalization enhances but isn't required |
| II. Privacy by Design | ✅ PASS | No cookies, no server transmission, localStorage only, privacy footer included |
| III. Graceful Degradation | ✅ PASS | API timeout at 500ms, fallbacks for all external calls, static HTML baseline |
| IV. Multilingual Excellence | ✅ PASS | 4 full translations in JSON, 40+ greetings, navigator.language detection |
| V. Professional Positioning | ✅ PASS | Content focuses on AI/engineering leadership, speaking, executive positioning |

**Gate Status**: ✅ PASSED - No violations, proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-adaptive-profile-page/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Research findings
├── data-model.md        # Phase 1: Data structures
├── quickstart.md        # Phase 1: Developer guide
├── contracts/           # Phase 1: API contracts (external APIs used)
│   ├── ip-api.md        # IP geolocation API contract
│   └── open-meteo.md    # Weather API contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2: Implementation tasks
```

### Source Code (repository root)

```text
/
├── index.html           # Main page (all 4 language versions inline or loaded)
├── styles.css           # All styles with CSS custom properties
├── adaptive.js          # Visitor detection + personalization logic
├── i18n/
│   ├── en.json          # English translations
│   ├── fr.json          # French translations
│   ├── pt.json          # Portuguese translations
│   ├── es.json          # Spanish translations
│   └── greetings.json   # "Nice to meet you" in 40+ languages
├── assets/
│   └── 1669655461502.jpeg  # Profile photo (already exists)
└── README.md            # Project documentation
```

**Structure Decision**: Single-page static site with external JSON for translations. No build step required. All files served directly by GitHub Pages.

## Complexity Tracking

No constitution violations to justify. Structure is minimal:
- 1 HTML file
- 1 CSS file  
- 1 JS file
- 5 JSON translation files
- 1 image asset

This is the simplest viable structure for the requirements.
