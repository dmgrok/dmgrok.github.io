# Data Model: Adaptive Profile Page

## Core Entities

### VisitorContext

The central object built during page load containing all detected visitor signals.

```typescript
interface VisitorContext {
  // Detection results
  isBot: boolean;
  botName: string | null;        // e.g., "GPTBot", "claudebot"
  
  // Language
  detectedLanguage: string;      // 2-letter code: "en", "fr", "pt", "es"
  hasFullTranslation: boolean;   // true if in [en, fr, pt, es]
  greeting: string;              // Localized greeting (any of 40+ languages)
  
  // Time
  localHour: number;             // 0-23
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  timezone: string;              // IANA timezone e.g., "Europe/Paris"
  
  // Location (optional - may fail)
  location: LocationData | null;
  
  // Weather (optional - may fail)  
  weather: WeatherData | null;
  
  // Referrer/Intent
  visitorType: VisitorType;
  referrerDomain: string | null;
  urlParams: Record<string, string>;
  
  // Device
  isSmallScreen: boolean;        // viewport < 768px
  isMobile: boolean;             // UA detection
  isDeveloperLikely: boolean;    // high cores + RAM heuristic
  
  // History
  isReturningVisitor: boolean;
  visitCount: number;
  lastVisit: string | null;      // ISO date
}
```

### LocationData

Geolocation data from ip-api.com.

```typescript
interface LocationData {
  city: string;
  region: string;
  country: string;
  countryCode: string;          // ISO 3166-1 alpha-2
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  org: string;                  // Company name if detected
  isProxy: boolean;
  isHosting: boolean;           // Datacenter IP
  isMobile: boolean;            // Mobile carrier
}
```

### WeatherData

Current weather from Open-Meteo.

```typescript
interface WeatherData {
  temperature: number;          // Celsius
  weatherCode: number;          // WMO code
  weatherDescription: string;   // Human-readable
  isDay: boolean;
  windSpeed: number;            // km/h
}
```

### VisitorType

Enum for inferred visitor intent.

```typescript
type VisitorType = 
  | 'recruiter'      // LinkedIn or ?r=li
  | 'speaker'        // Event sites or ?r=sp
  | 'developer'      // GitHub or ?r=gh
  | 'executive'      // ?r=ex
  | 'inperson'       // ?r=qr
  | 'general';       // Default
```

---

## Translation Files

### FullTranslation (en, fr, pt, es)

Complete UI translations stored in `i18n/{lang}.json`.

```typescript
interface FullTranslation {
  meta: {
    language: string;
    languageName: string;
    direction: 'ltr' | 'rtl';
  };
  
  greeting: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };
  
  hero: {
    tagline: string;
    subtitle: string;
  };
  
  sections: {
    about: {
      title: string;
      content: string;
    };
    expertise: {
      title: string;
      items: string[];
    };
    speaking: {
      title: string;
      availability: string;
      topics: string[];
    };
    achievements: {
      title: string;
      stats: Record<string, string>;
    };
  };
  
  cta: {
    linkedin: string;
    github: string;
    email: string;
    speakingInquiry: string;
  };
  
  footer: {
    privacyLink: string;
    sourceCode: string;
  };
  
  insights: {
    weather: Record<string, string>;     // weatherCode -> quip
    location: Record<string, string>;    // city/country -> quip
    time: Record<string, string>;        // timeOfDay -> quip
    returning: string;                    // Welcome back message
    smallScreen: string;                  // Small screen note
    developerDetected: string;            // Dev-friendly message
  };
}
```

### GreetingOnly (40+ languages)

Minimal greetings stored in `i18n/greetings.json`.

```typescript
interface GreetingsCollection {
  [languageCode: string]: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    generic: string;            // Fallback
  };
}
```

---

## LocalStorage Schema

Persisted visitor history (privacy-compliant).

```typescript
interface VisitorHistory {
  version: 1;                   // Schema version for migration
  visitCount: number;
  firstVisit: string;           // ISO date
  lastVisit: string;            // ISO date
  lastLanguage: string;         // For consistency
}
```

**Storage Key**: `davidgraca_visitor`

**TTL**: None (persists indefinitely, user can clear)

---

## Profile Data (Static)

Embedded in the page or loaded from profile.json.

```typescript
interface ProfileData {
  name: string;
  title: string;
  company: string;
  location: string;
  
  photo: {
    src: string;
    alt: string;
  };
  
  expertise: string[];
  
  speaking: {
    available: boolean;
    formats: string[];
    topics: string[];
    languages: string[];
  };
  
  achievements: {
    yearsExperience: string;
    communityMembers: string;
    summitAttendees: string;
    countriesReached: string;
    developersTrained: string;
  };
  
  links: {
    linkedin: string;
    github: string;
    email: string;
  };
  
  mentions: {
    name: string;
    url: string;
  }[];
}
```

---

## Insight Quips

Context-aware messages displayed based on visitor signals.

```typescript
interface InsightQuip {
  id: string;
  trigger: QuipTrigger;
  messages: {
    en: string;
    fr: string;
    pt: string;
    es: string;
  };
}

type QuipTrigger = 
  | { type: 'weather'; code: number }
  | { type: 'city'; name: string }
  | { type: 'country'; code: string }
  | { type: 'company'; name: string }
  | { type: 'time'; period: 'late' | 'early' | 'weekend' }
  | { type: 'returning' }
  | { type: 'developer' }
  | { type: 'smallScreen' };
```

---

## YAML Bot Output

Structured profile data for AI crawlers.

```typescript
interface BotYamlOutput {
  name: string;
  title: string;
  company: string;
  location: string;
  
  expertise: string[];
  
  speaking: {
    available: boolean;
    formats: string[];
    topics: string[];
    languages: string[];
  };
  
  experience: Record<string, string>;
  
  contact: {
    linkedin: string;
    github: string;
    email: string;
  };
  
  meta: {
    generated: string;          // ISO timestamp
    format: 'yaml';
    note: string;
  };
}
```
