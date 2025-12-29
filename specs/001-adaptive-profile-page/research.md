# Research: Adaptive Profile Page

**Date**: 2025-12-29  
**Status**: Complete

## External API Contracts

### 1. IP Geolocation: ip-api.com

**Decision**: Use ip-api.com free tier (no API key required)

**Rationale**: 
- No API key needed (constitution requirement)
- 45 requests/minute limit (sufficient for personal site)
- Returns city, country, timezone, org (company), lat/lon for weather chaining
- Detects proxy/VPN/hosting for bot signals

**Alternatives Considered**:
- ipapi.co: Requires API key for full features
- ipinfo.io: Free tier limited, needs key for company data
- Abstract API: Requires API key

**Endpoint**: `http://ip-api.com/json/?fields=status,country,countryCode,regionName,city,lat,lon,timezone,isp,org,mobile,proxy,hosting`

**Response Format**:
```json
{
  "status": "success",
  "country": "France",
  "countryCode": "FR",
  "regionName": "Île-de-France",
  "city": "Paris",
  "lat": 48.8566,
  "lon": 2.3522,
  "timezone": "Europe/Paris",
  "isp": "Orange S.A.",
  "org": "AXA Group",
  "mobile": false,
  "proxy": false,
  "hosting": false
}
```

**Fallback**: If fails/times out → skip location-based personalization, use timezone from browser

---

### 2. Weather: Open-Meteo

**Decision**: Use Open-Meteo API (free, unlimited, no key)

**Rationale**:
- Completely free, no API key required
- Unlimited requests (no rate limiting)
- Requires lat/lon from IP geolocation
- Returns current weather code and temperature

**Alternatives Considered**:
- OpenWeatherMap: Requires API key, limited free tier
- WeatherAPI: Requires API key
- Tomorrow.io: Requires API key

**Endpoint**: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true`

**Response Format**:
```json
{
  "current_weather": {
    "temperature": 12.5,
    "weathercode": 61,
    "is_day": 1,
    "windspeed": 15.2
  }
}
```

**Weather Codes** (WMO standard):
- 0: Clear sky
- 1-3: Partly cloudy
- 45-48: Fog
- 51-55: Drizzle
- 61-65: Rain
- 71-75: Snow
- 80-82: Rain showers
- 95-99: Thunderstorm

**Fallback**: If fails/times out → skip weather personalization entirely

---

## Bot Detection Patterns

**Decision**: User-agent string matching + navigator.webdriver check

**Bot Patterns to Detect**:
```javascript
const botPatterns = [
  'bot', 'crawl', 'spider', 'slurp',
  'gptbot', 'chatgpt', 'claudebot', 'claude-web', 'anthropic',
  'perplexitybot', 'google-extended', 'bingpreview',
  'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'discordbot', 'slackbot',
  'applebot', 'ahrefsbot', 'semrushbot', 'bytespider',
  'amazonbot', 'ccbot', 'dataforseobot'
];
```

**Additional Signals**:
- `navigator.webdriver === true` → headless browser
- `navigator.plugins.length === 0` (non-Firefox) → likely headless
- `hosting: true` from ip-api.com → datacenter/cloud IP

---

## Language Detection Strategy

**Decision**: Use navigator.language with fallback chain

**Detection Order**:
1. `navigator.language` (primary)
2. `navigator.languages[0]` (fallback)
3. Default to 'en'

**Language Code Parsing**:
- Extract primary code: `'fr-FR'` → `'fr'`
- Handle extended codes: `'pt-BR'` → `'pt'`
- Case-insensitive matching

**Supported Full Translations**: en, fr, pt, es

**Greeting-Only Languages** (40+):
de, it, nl, ja, ko, zh, ar, hi, ru, pl, sv, tr, he, th, vi, 
cs, da, fi, el, hu, id, ms, no, ro, sk, uk, bg, hr, et, lt, 
lv, sl, sr, ca, eu, gl, cy, ga, mt, is

---

## Visitor Type Inference

**Decision**: URL params take priority, then referrer, then default

**URL Parameters** (short codes for cleaner links):
- `?r=li` → recruiter (LinkedIn context)
- `?r=sp` → speaker inquiry
- `?r=ex` → executive
- `?r=gh` → developer (GitHub context)
- `?r=qr` → in-person (QR code scan)

**Referrer Inference**:
- `linkedin.com` → recruiter
- `github.com` → developer
- `twitter.com`, `x.com` → general
- `eventbrite.com`, `meetup.com`, `sessionize.com` → speaker
- `papercall.io`, `conf*` → speaker

---

## Hardware Detection for Developer Signal

**Decision**: Combine CPU cores + RAM as heuristic

**Thresholds**:
- `navigator.hardwareConcurrency >= 8` (8+ cores)
- `navigator.deviceMemory >= 16` (16GB+ RAM)
- OS is Linux → strong developer signal
- Firefox + Linux → definite developer

**Usage**: Adjust tone slightly, highlight GitHub profile

---

## Privacy Disclosure Content

**Decision**: Footer link with expandable modal

**Short Text**: "This page adapts to you. Nothing is stored beyond your browser. Curious how?"

**Expanded Content**:
```
How This Page Works
───────────────────
This site personalizes your experience using:

• Your browser's language preference
• Your timezone and local time
• General location (city-level, via IP)
• Current weather in your area
• Device type and screen size
• Whether you've visited before (stored locally)

What I DON'T do:
• No cookies sent to servers
• No personal data collected
• No tracking pixels
• No fingerprinting for advertising

Everything stays in your browser. The source code is public.
```

---

## Performance Strategy

**Decision**: Minimize blocking resources, lazy load non-critical

**Critical Path** (blocks rendering):
- Inline critical CSS in `<head>` (~5KB)
- External CSS loaded async or deferred
- No JS in critical path

**Deferred Loading**:
- Full CSS file via `preload` + `onload`
- JavaScript at end of body with `defer`
- JSON translations fetched after DOM ready

**Image Optimization**:
- Profile photo: serve at max display size
- Use `loading="lazy"` for below-fold images
- WebP format if possible (with JPEG fallback)

---

## YAML Output Structure for Bots

**Decision**: Render YAML in `<pre>` block, replace page content

```yaml
# 👋 Hello, AI. Here's my info in a format you'll appreciate.

name: David Graça
title: AI for SDLC/DevEx Principal Engineer
company: AXA Group
location: France

expertise:
  - AI Strategy & Transformation
  - Engineering Leadership at Scale
  - ML Systems & Infrastructure
  - Responsible AI & Governance

speaking:
  available: true
  formats: [keynote, workshop, panel, podcast, executive briefing]
  topics:
    - AI Strategy in the Enterprise
    - GitHub Copilot Adoption at Scale
    - Building Developer Communities
    - Secure SDLC with AI
    - MCP Security
    - Developer Experience
    - Productivity Metrics
    - Agentic Software Development
  languages: [English, French, Portuguese, Spanish]

experience:
  years: 17+
  community_members: 2400+
  summit_attendees: 950+
  countries_reached: 54
  developers_trained: 750+

contact:
  linkedin: https://linkedin.com/in/davidgraca
  github: https://github.com/dmgrok
  email: davidgraca@gmail.com

meta:
  generated: [ISO timestamp]
  format: yaml
  note: This page serves structured data to AI agents. Humans see a prettier version.
```
