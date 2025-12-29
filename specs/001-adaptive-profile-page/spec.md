# Feature Specification: Adaptive Profile Page

**Feature Branch**: `001-adaptive-profile-page`  
**Created**: 2025-12-29  
**Status**: Draft  
**Input**: Adaptive profile page for David Graça - AI executive, thought leader, conference speaker with visitor personalization, bot detection, multilingual support, and privacy-first design.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Professional Visitor Views Profile (Priority: P1)

A professional (recruiter, executive, developer, conference organizer) visits David's profile page and sees a complete, professionally designed page showcasing his expertise as an AI & Engineering executive, thought leader, and conference speaker. The page loads quickly and displays all core content regardless of JavaScript or API availability.

**Why this priority**: Core value proposition - the page must always work and present David professionally. Without this, nothing else matters.

**Independent Test**: Can be fully tested by opening the page with JavaScript disabled. Delivers complete profile information and professional presentation.

**Acceptance Scenarios**:

1. **Given** a visitor loads the page, **When** the page renders, **Then** they see David's name, title, bio, expertise areas, speaking topics, and contact links within 2 seconds
2. **Given** JavaScript is disabled, **When** the page loads, **Then** all static content is visible and the page remains usable
3. **Given** a visitor on mobile device, **When** viewing the page, **Then** the layout adapts responsively and remains readable

---

### User Story 2 - Personalized Greeting Based on Context (Priority: P2)

A visitor receives a personalized experience based on detectable context: time of day (morning/evening greeting), return visit recognition, detected language, and visitor type inference from URL parameters or referrer.

**Why this priority**: Differentiates the page and demonstrates technical sophistication while creating a memorable experience. Builds on P1's foundation.

**Independent Test**: Can be tested by visiting with different URL parameters (?r=li, ?r=sp, ?r=ex) and at different times of day. Each variation delivers tailored messaging.

**Acceptance Scenarios**:

1. **Given** a visitor arrives at 9am local time, **When** the page loads, **Then** they see "Good morning" as the greeting
2. **Given** a returning visitor (detected via localStorage), **When** they visit again, **Then** they see "Welcome back" instead of generic greeting
3. **Given** a visitor arrives via ?r=sp parameter (speaker inquiry), **When** viewing the page, **Then** the messaging emphasizes speaking availability and topics
4. **Given** a visitor arrives from linkedin.com referrer, **When** viewing the page, **Then** the messaging assumes professional/recruiter context

---

### User Story 3 - Multilingual Support (Priority: P2)

A visitor whose browser language is French, Portuguese, or Spanish sees the entire page in their language. Visitors with other languages see a localized "Nice to meet you" greeting with English content.

**Why this priority**: David speaks 4 languages and serves a global audience. Equal priority with personalization as both enhance visitor experience.

**Independent Test**: Can be tested by changing browser language settings. French/Portuguese/Spanish visitors get full translation; others get greeting + English.

**Acceptance Scenarios**:

1. **Given** a visitor with browser language fr-FR, **When** the page loads, **Then** all content displays in French
2. **Given** a visitor with browser language pt-BR, **When** the page loads, **Then** all content displays in Portuguese
3. **Given** a visitor with browser language de-DE (German), **When** the page loads, **Then** they see "Schön, Sie kennenzulernen" as greeting with English content
4. **Given** a visitor with unknown/unsupported language, **When** the page loads, **Then** they see English content with default greeting

---

### User Story 4 - Weather and Location Awareness (Priority: P3)

A visitor sees contextual comments based on their approximate location and current weather, creating a human touch ("Rainy day in London? Perfect weather for browsing profiles").

**Why this priority**: Delightful enhancement but not critical. Depends on external APIs that may fail.

**Independent Test**: Can be tested by mocking IP geolocation responses. Delivers weather-aware quips when available, gracefully omits when unavailable.

**Acceptance Scenarios**:

1. **Given** IP geolocation succeeds and weather API returns rainy conditions, **When** viewing the page, **Then** visitor sees a weather-related contextual message
2. **Given** IP geolocation fails or times out, **When** viewing the page, **Then** no weather message appears and page functions normally
3. **Given** visitor is using VPN or proxy, **When** location cannot be determined, **Then** page shows generic greeting without location reference

---

### User Story 5 - Bot Detection with Structured Output (Priority: P3)

When an AI bot or crawler visits (GPTBot, ClaudeBot, etc.), the page serves structured YAML data instead of running personalization logic, optimizing for machine consumption.

**Why this priority**: Easter egg feature that demonstrates technical sophistication and serves practical purpose for AI indexing.

**Independent Test**: Can be tested by spoofing user-agent to known bot strings. Bot receives YAML; human receives full page.

**Acceptance Scenarios**:

1. **Given** a request with user-agent containing "GPTBot", **When** the page processes the request, **Then** it outputs structured YAML with profile data
2. **Given** a request with user-agent containing "ClaudeBot", **When** the page processes the request, **Then** it outputs YAML and skips external API calls
3. **Given** navigator.webdriver is true (headless browser), **When** detected, **Then** bot mode activates

---

### User Story 6 - Small Screen Awareness (Priority: P4)

Visitors on very small screens (< 380px) see a subtle indicator acknowledging the viewing constraint and reassuring them the experience is optimized for their device.

**Why this priority**: Nice-to-have polish feature. Low effort, adds personality.

**Independent Test**: Can be tested by resizing browser window below 380px. Indicator appears with helpful tooltip.

**Acceptance Scenarios**:

1. **Given** screen width below 380px, **When** viewing the page, **Then** a subtle glasses icon appears
2. **Given** user hovers/taps the icon, **When** interacting, **Then** a tooltip explains "I see you're on a small screen..."

---

### Edge Cases

- What happens when localStorage is unavailable (private browsing)? → Treat as first-time visitor, skip visit tracking
- What happens when all external APIs fail simultaneously? → Page renders with default content, no personalization
- What happens with extremely long browser language codes? → Parse primary language code only (e.g., "en-US-x-custom" → "en")
- How does system handle concurrent bot + human indicators? → Prioritize bot detection (webdriver true = bot regardless of other signals)
- What if visitor has JavaScript disabled? → Core content displays from static HTML, personalization features gracefully absent

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display complete profile content (name, title, bio, expertise, speaking topics, contact) without JavaScript
- **FR-002**: System MUST detect visitor's preferred language via navigator.language and serve appropriate content
- **FR-003**: System MUST provide full translations for English, French, Portuguese, and Spanish
- **FR-004**: System MUST display localized "Nice to meet you" greeting for unsupported languages
- **FR-005**: System MUST detect known bot user-agents and output structured YAML data
- **FR-006**: System MUST detect navigator.webdriver for headless browser identification
- **FR-007**: System MUST fetch visitor location via IP geolocation API (ip-api.com, no API key)
- **FR-008**: System MUST fetch weather data via Open-Meteo API (no API key) when location is available
- **FR-009**: System MUST timeout external API calls after 500ms and proceed without that data
- **FR-010**: System MUST store visit history in localStorage (visit count, first visit date)
- **FR-011**: System MUST adapt greeting based on local time (morning/afternoon/evening/night)
- **FR-012**: System MUST recognize URL parameters for visitor type hints (?r=li, ?r=sp, ?r=ex, ?r=gh)
- **FR-013**: System MUST analyze document.referrer for context inference
- **FR-014**: System MUST respect prefers-reduced-motion and disable animations when set
- **FR-015**: System MUST respect prefers-color-scheme (defaulting to dark mode)
- **FR-016**: System MUST display privacy disclosure in footer with expandable explanation
- **FR-017**: System MUST work on GitHub Pages (static files only, no server-side processing)
- **FR-018**: System MUST show small screen indicator when viewport width < 380px
- **FR-019**: System MUST detect high-spec hardware (8+ cores, 16GB+ RAM) as developer signal
- **FR-020**: System MUST log visitor context to console for technically curious visitors

### Key Entities

- **VisitorContext**: Represents all detectable visitor information (language, timezone, device, referrer, URL params, visit history, location, weather)
- **Translation**: Language-specific content strings for all page sections (4 languages)
- **Greeting**: Localized "Nice to meet you" strings (40+ languages)
- **ProfileData**: Static content about David (bio, expertise, speaking topics, stats, contact links)
- **InsightQuip**: Contextual messages based on visitor state (weather, time, device, return visit)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Page achieves First Contentful Paint under 1.5 seconds on 3G connection
- **SC-002**: Total page weight remains under 500KB excluding profile photo
- **SC-003**: Core content is fully visible and readable with JavaScript disabled
- **SC-004**: 100% of translated strings available for EN, FR, PT, ES languages
- **SC-005**: Bot detection correctly identifies 90%+ of known AI crawlers by user-agent
- **SC-006**: External API failures do not prevent page from rendering completely
- **SC-007**: Page passes WCAG 2.1 AA automated accessibility checks
- **SC-008**: All interactive elements are keyboard navigable
- **SC-009**: Privacy disclosure accurately describes all data collection (none transmitted externally)
- **SC-010**: Page deploys and functions correctly on GitHub Pages without server configuration
