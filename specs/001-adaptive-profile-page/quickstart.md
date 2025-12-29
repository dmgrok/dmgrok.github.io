# Quickstart: Adaptive Profile Page

## Prerequisites

- Any modern browser with dev tools
- Python 3 (for local server) OR VS Code Live Server extension
- Text editor (VS Code recommended)
- Git (for deployment)

No build tools, no npm, no framework dependencies.

## Project Setup

```bash
# Already in the project directory
cd /Users/a447ah/Github/personal_profile

# Project structure will be:
├── index.html              # Main page
├── styles.css              # All styles
├── adaptive.js             # Personalization logic
├── i18n/
│   ├── en.json             # English (full)
│   ├── fr.json             # French (full)
│   ├── pt.json             # Portuguese (full)
│   ├── es.json             # Spanish (full)
│   └── greetings.json      # 40+ languages (greetings only)
├── assets/
│   └── profile.jpg         # Profile photo
└── CNAME                   # Custom domain (optional)
```

## Local Development

### Option 1: Python Server (Recommended)

```bash
# From project root
python3 -m http.server 8000

# Open http://localhost:8000
```

### Option 2: VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

### Option 3: npx (if you have Node)

```bash
npx serve .
```

## Testing Personalization

### Simulate Bot Detection

Add to browser console:
```javascript
localStorage.setItem('debug_bot', 'GPTBot');
location.reload();
```

### Simulate Different Languages

Chrome: Settings → Languages → Add → Move to top
Firefox: `about:config` → `intl.accept_languages`

### Simulate Visitor Types

```
http://localhost:8000/?r=li    # Recruiter
http://localhost:8000/?r=sp    # Speaker inquiry
http://localhost:8000/?r=gh    # Developer
http://localhost:8000/?r=ex    # Executive
http://localhost:8000/?r=qr    # QR code scan
```

### Simulate Returning Visitor

```javascript
localStorage.setItem('davidgraca_visitor', JSON.stringify({
  version: 1,
  visitCount: 5,
  firstVisit: '2024-01-01',
  lastVisit: '2024-06-15'
}));
location.reload();
```

### Simulate Weather/Location Failure

Block requests to `ip-api.com` in DevTools Network tab.

## Key Files to Modify

| File | Purpose |
|------|---------|
| `index.html` | Profile content, structure |
| `styles.css` | Visual design, dark mode, responsive |
| `adaptive.js` | All personalization logic |
| `i18n/*.json` | Translations and insight quips |

## Deployment

### GitHub Pages (Recommended)

1. Push to `main` branch
2. Repository Settings → Pages → Source: main branch
3. Site available at `https://dmgrok.github.io/personal_profile/`

### Custom Domain

1. Create `CNAME` file with domain name
2. Configure DNS A records:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`

## Validation Checklist

Before deploying:

- [ ] Test on mobile viewport (iPhone SE size)
- [ ] Test with JavaScript disabled (graceful fallback)
- [ ] Test with blocked APIs (no location/weather shows)
- [ ] Test all 4 translation files load correctly
- [ ] Verify bot detection shows YAML output
- [ ] Check Lighthouse score (target: 90+ all categories)
- [ ] Validate HTML (no errors)
- [ ] Check console for errors
- [ ] Test dark mode toggle if implemented

## Common Issues

### CORS Error on ip-api.com

Use HTTP, not HTTPS: `http://ip-api.com/json/...`

### Translations Not Loading

- Check file paths are relative
- Verify JSON syntax is valid
- Check Network tab for 404s

### No Personalization Showing

- Check console for JavaScript errors
- Verify `adaptive.js` is loaded
- Test with hardcoded values first

## Debug Mode

Add `?debug=1` to URL for verbose console logging:

```javascript
// In adaptive.js
const DEBUG = new URLSearchParams(location.search).has('debug');
function log(...args) { if (DEBUG) console.log('[Adaptive]', ...args); }
```
