<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0
Modified principles: Initial creation
Added sections: Core Principles (5), Privacy & Ethics, Technical Standards, Governance
Removed sections: None (initial)
Templates requiring updates: ✅ No updates needed (initial setup)
Follow-up TODOs: None
-->

# Adaptive Profile Page Constitution

## Core Principles

### I. Visitor-First Experience
Every design decision MUST prioritize the visitor's experience over technical cleverness. Personalization MUST feel helpful, not creepy. The page MUST load fast, adapt gracefully, and respect user preferences (dark mode, reduced motion, language). If personalization fails, the page MUST still deliver a complete, professional experience.

### II. Privacy by Design
No personal data MUST be collected, transmitted, or stored on external servers. All visitor context (IP geolocation, weather, visit history) MUST remain client-side only. Bot detection and analytics MUST NOT fingerprint users for tracking purposes. The privacy model MUST be transparent and explainable to visitors. localStorage is acceptable; cookies and server-side tracking are NOT.

### III. Graceful Degradation
Every external API call (IP, weather) MUST have a fallback. If APIs fail, timeout, or are blocked, the page MUST still render correctly with default content. Bot detection MUST err on the side of treating ambiguous visitors as human. JavaScript failures MUST NOT break the core content display.

### IV. Multilingual Excellence
Full translations MUST exist for English, French, Portuguese, and Spanish. For other languages, a localized greeting ("Nice to meet you") MUST be displayed with English content. Language detection MUST use navigator.language as the primary signal. Translation strings MUST be externalized in JSON files, not hardcoded.

### V. Professional Positioning
All content MUST position David Graça as an AI & Engineering executive, thought leader, and conference speaker. The tone MUST be confident but approachable, technical but accessible. Stats and achievements MUST be verifiable and current. The page MUST adapt messaging based on visitor context (recruiter, developer, speaker inquiry, executive) without being manipulative.

## Privacy & Ethics

- IP geolocation is used ONLY for weather/location context, not stored beyond the session
- Company/org detection from IP MUST be used only for anonymous analytics aggregation
- No third-party tracking pixels, advertising cookies, or fingerprinting
- Clear disclosure: "This page adapts to you. Nothing is stored beyond your browser."
- Source code MUST be public and auditable
- YAML output for bots is a feature, not deception

## Technical Standards

### Performance
- First Contentful Paint MUST be under 1.5 seconds on 3G
- Total page weight MUST be under 500KB (excluding photo)
- No render-blocking JavaScript for core content
- Images MUST be optimized and lazy-loaded where appropriate

### Accessibility
- WCAG 2.1 AA compliance MUST be maintained
- All interactive elements MUST be keyboard navigable
- Color contrast MUST meet minimum ratios
- prefers-reduced-motion MUST disable animations

### Code Quality
- Vanilla HTML/CSS/JS preferred over frameworks (GitHub Pages constraint)
- CSS MUST use custom properties for theming
- JavaScript MUST be modular and well-commented
- No external dependencies for core functionality

## Governance

This constitution establishes non-negotiable principles for the Adaptive Profile Page project. All implementation decisions MUST align with these principles.

**Amendment Process:**
1. Propose changes with rationale
2. Evaluate impact on existing implementation
3. Update constitution version following semver
4. Update implementation to comply

**Compliance:**
- Every feature MUST be evaluated against Privacy by Design principle
- Performance budgets MUST be verified before deployment
- Accessibility MUST be tested with automated tools + manual review

**Version**: 1.0.0 | **Ratified**: 2025-12-29 | **Last Amended**: 2025-12-29
