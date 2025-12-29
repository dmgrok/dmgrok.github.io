/**
 * Adaptive Profile Page - Personalization Engine
 * Detects visitor context and adapts the page accordingly
 * Privacy-first: all data stays in the browser
 */

(function() {
  'use strict';

  // Debug mode
  const DEBUG = new URLSearchParams(location.search).has('debug');
  const log = (...args) => { if (DEBUG) console.log('[Adaptive]', ...args); };

  // Constants
  const STORAGE_KEY = 'davidgraca_visitor';
  const FULL_TRANSLATION_LANGS = ['en', 'fr', 'pt', 'es'];
  const API_TIMEOUT = 3000;

  // Bot patterns
  const BOT_PATTERNS = [
    'bot', 'crawl', 'spider', 'slurp',
    'gptbot', 'chatgpt', 'claudebot', 'claude-web', 'anthropic',
    'perplexitybot', 'google-extended', 'bingpreview',
    'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'whatsapp', 'telegrambot', 'discordbot', 'slackbot',
    'applebot', 'ahrefsbot', 'semrushbot', 'bytespider',
    'amazonbot', 'ccbot', 'dataforseobot'
  ];

  // Profile data for bot output
  const PROFILE_DATA = {
    name: 'David Graça',
    title: 'AI for SDLC/DevEx Principal Engineer',
    company: 'AXA Group',
    location: 'France',
    expertise: [
      'AI Strategy & Transformation',
      'Engineering Leadership at Scale',
      'GitHub Copilot Enterprise Adoption',
      'Developer Experience & Productivity',
      'Secure SDLC with AI',
      'Community Building'
    ],
    speaking: {
      available: true,
      formats: ['keynote', 'workshop', 'panel', 'podcast', 'executive briefing'],
      topics: [
        'AI Strategy in the Enterprise',
        'GitHub Copilot Adoption at Scale',
        'Building Developer Communities',
        'Secure SDLC with AI',
        'MCP Security',
        'Developer Experience',
        'Productivity Metrics',
        'Agentic Software Development'
      ],
      languages: ['English', 'French', 'Portuguese', 'Spanish']
    },
    experience: {
      years: '17+',
      community_members: '2,400+',
      summit_attendees: '950+',
      countries_reached: '54',
      developers_trained: '750+'
    },
    contact: {
      linkedin: 'https://linkedin.com/in/davidgraca',
      github: 'https://github.com/dmgrok',
      email: 'davidgraca@gmail.com'
    }
  };

  // ============================================
  // VISITOR CONTEXT DETECTION
  // ============================================

  /**
   * Build the complete visitor context object
   */
  async function buildVisitorContext() {
    const context = {
      isBot: false,
      botName: null,
      detectedLanguage: 'en',
      hasFullTranslation: true,
      greeting: 'Hello',
      localHour: new Date().getHours(),
      timeOfDay: 'afternoon',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: null,
      weather: null,
      visitorType: 'general',
      referrerDomain: null,
      urlParams: {},
      isSmallScreen: window.innerWidth < 768,
      isMobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
      isDeveloperLikely: false,
      isReturningVisitor: false,
      visitCount: 1,
      lastVisit: null
    };

    // 1. Bot detection (short-circuit if bot)
    const botCheck = detectBot();
    if (botCheck.isBot) {
      context.isBot = true;
      context.botName = botCheck.name;
      log('Bot detected:', botCheck.name);
      return context;
    }

    // 2. Language detection
    const langResult = detectLanguage();
    context.detectedLanguage = langResult.language;
    context.hasFullTranslation = langResult.hasFullTranslation;
    log('Language:', context.detectedLanguage, 'Full:', context.hasFullTranslation);

    // 3. Time of day
    context.timeOfDay = getTimeOfDay(context.localHour);
    log('Time of day:', context.timeOfDay, 'Hour:', context.localHour);

    // 4. URL params and referrer
    context.urlParams = Object.fromEntries(new URLSearchParams(location.search));
    context.visitorType = inferVisitorType(context.urlParams, document.referrer);
    context.referrerDomain = extractDomain(document.referrer);
    log('Visitor type:', context.visitorType, 'Referrer:', context.referrerDomain);

    // 5. Developer detection
    context.isDeveloperLikely = detectDeveloper();
    log('Developer likely:', context.isDeveloperLikely);

    // 6. Visit history
    const history = loadVisitorHistory();
    context.isReturningVisitor = history.visitCount > 1;
    context.visitCount = history.visitCount;
    context.lastVisit = history.lastVisit;
    log('Returning:', context.isReturningVisitor, 'Visits:', context.visitCount);

    // 7. Fetch location (async)
    try {
      context.location = await fetchLocation();
      log('Location:', context.location);
      
      // 8. Fetch weather if we have location
      if (context.location?.latitude && context.location?.longitude) {
        context.weather = await fetchWeather(context.location.latitude, context.location.longitude);
        log('Weather:', context.weather);
      }
    } catch (e) {
      log('Location/weather fetch failed:', e.message);
    }

    return context;
  }

  // ============================================
  // DETECTION FUNCTIONS
  // ============================================

  function detectBot() {
    const ua = navigator.userAgent.toLowerCase();
    
    // Check for debug override
    const debugBot = localStorage.getItem('debug_bot');
    if (debugBot) {
      return { isBot: true, name: debugBot };
    }

    // Check navigator.webdriver (headless browsers)
    if (navigator.webdriver) {
      return { isBot: true, name: 'headless' };
    }

    // Check user agent patterns
    for (const pattern of BOT_PATTERNS) {
      if (ua.includes(pattern)) {
        return { isBot: true, name: pattern };
      }
    }

    return { isBot: false, name: null };
  }

  function detectLanguage() {
    const browserLang = (navigator.language || navigator.languages?.[0] || 'en')
      .toLowerCase()
      .split('-')[0];
    
    const hasFullTranslation = FULL_TRANSLATION_LANGS.includes(browserLang);
    
    return {
      language: hasFullTranslation ? browserLang : browserLang,
      hasFullTranslation
    };
  }

  function getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  function inferVisitorType(params, referrer) {
    // URL params take priority
    const r = params.r || params.ref;
    if (r) {
      const typeMap = {
        'li': 'recruiter',
        'sp': 'speaker',
        'gh': 'developer',
        'ex': 'executive',
        'qr': 'inperson'
      };
      if (typeMap[r]) return typeMap[r];
    }

    // Infer from referrer
    if (referrer) {
      const ref = referrer.toLowerCase();
      if (ref.includes('linkedin.com')) return 'recruiter';
      if (ref.includes('github.com')) return 'developer';
      if (ref.includes('eventbrite.com') || ref.includes('meetup.com') || 
          ref.includes('sessionize.com') || ref.includes('papercall.io')) {
        return 'speaker';
      }
    }

    return 'general';
  }

  function extractDomain(url) {
    if (!url) return null;
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  function detectDeveloper() {
    const cores = navigator.hardwareConcurrency || 0;
    const memory = navigator.deviceMemory || 0;
    const isLinux = /Linux/.test(navigator.platform) && !/Android/.test(navigator.userAgent);
    
    // High-spec machine heuristic
    if (cores >= 8 && memory >= 16) return true;
    if (isLinux) return true;
    
    return false;
  }

  // ============================================
  // VISITOR HISTORY (localStorage)
  // ============================================

  function loadVisitorHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          visitCount: (data.visitCount || 0) + 1,
          firstVisit: data.firstVisit,
          lastVisit: data.lastVisit,
          lastLanguage: data.lastLanguage
        };
      }
    } catch (e) {
      log('Error loading history:', e);
    }
    return { visitCount: 1, firstVisit: null, lastVisit: null };
  }

  function saveVisitorHistory(context) {
    try {
      const now = new Date().toISOString();
      const stored = localStorage.getItem(STORAGE_KEY);
      const existing = stored ? JSON.parse(stored) : {};
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        visitCount: context.visitCount,
        firstVisit: existing.firstVisit || now,
        lastVisit: now,
        lastLanguage: context.detectedLanguage
      }));
    } catch (e) {
      log('Error saving history:', e);
    }
  }

  // ============================================
  // API CALLS
  // ============================================

  async function fetchLocation() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const resp = await fetch(
        'http://ip-api.com/json/?fields=status,country,countryCode,regionName,city,lat,lon,timezone,isp,org,mobile,proxy,hosting',
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      const data = await resp.json();
      if (data.status !== 'success') return null;

      return {
        city: data.city,
        region: data.regionName,
        country: data.country,
        countryCode: data.countryCode,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        org: data.org,
        isProxy: data.proxy,
        isHosting: data.hosting,
        isMobile: data.mobile
      };
    } catch (e) {
      clearTimeout(timeout);
      return null;
    }
  }

  async function fetchWeather(lat, lon) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const resp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (!resp.ok) return null;

      const data = await resp.json();
      if (!data.current_weather) return null;

      const w = data.current_weather;
      return {
        temperature: w.temperature,
        weatherCode: w.weathercode,
        weatherDescription: getWeatherDescription(w.weathercode),
        isDay: w.is_day === 1,
        windSpeed: w.windspeed
      };
    } catch (e) {
      clearTimeout(timeout);
      return null;
    }
  }

  function getWeatherDescription(code) {
    if (code === 0) return 'clear';
    if (code <= 3) return 'cloudy';
    if (code <= 48) return 'foggy';
    if (code <= 55) return 'drizzle';
    if (code <= 67) return 'rainy';
    if (code <= 77) return 'snowy';
    if (code <= 82) return 'rainy';
    if (code <= 86) return 'snowy';
    return 'stormy';
  }

  // ============================================
  // TRANSLATION LOADING
  // ============================================

  let translations = null;
  let greetings = null;

  async function loadTranslations(lang) {
    try {
      // Load full translation if available
      if (FULL_TRANSLATION_LANGS.includes(lang)) {
        const resp = await fetch(`i18n/${lang}.json`);
        if (resp.ok) {
          translations = await resp.json();
          log('Loaded full translation:', lang);
        }
      } else {
        // Fall back to English for UI
        const resp = await fetch('i18n/en.json');
        if (resp.ok) {
          translations = await resp.json();
        }
      }

      // Also load greetings for non-full languages
      const greetResp = await fetch('i18n/greetings.json');
      if (greetResp.ok) {
        greetings = await greetResp.json();
        log('Loaded greetings');
      }
    } catch (e) {
      log('Error loading translations:', e);
    }
  }

  function getGreeting(lang, timeOfDay) {
    // Try full translation first
    if (translations?.greeting?.[timeOfDay]) {
      return translations.greeting[timeOfDay];
    }

    // Try greetings file
    if (greetings?.[lang]?.[timeOfDay]) {
      return greetings[lang][timeOfDay];
    }

    // Fallback
    return greetings?.[lang]?.generic || 'Hello';
  }

  // ============================================
  // UI UPDATES
  // ============================================

  function applyTranslations() {
    if (!translations) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);
      if (value && typeof value === 'string') {
        el.textContent = value;
      }
    });
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  function updateGreeting(context) {
    const greetingEl = document.getElementById('greeting');
    if (!greetingEl) return;

    const greeting = getGreeting(context.detectedLanguage, context.timeOfDay);
    greetingEl.textContent = `${greeting}!`;
  }

  function updateHeroCTA(context) {
    const ctaEl = document.getElementById('hero-cta');
    if (!ctaEl) return;

    // Customize CTA based on visitor type
    const ctaConfig = {
      recruiter: {
        primary: { text: 'View my results', href: '#results' },
        secondary: { text: 'LinkedIn', href: 'https://linkedin.com/in/davidgraca' }
      },
      speaker: {
        primary: { text: 'Book me to speak', href: 'mailto:davidgraca@gmail.com?subject=Speaking%20Inquiry' },
        secondary: { text: 'Speaking topics', href: '#speaking' }
      },
      developer: {
        primary: { text: 'GitHub', href: 'https://github.com/dmgrok' },
        secondary: { text: 'What I build', href: '#results' }
      },
      executive: {
        primary: { text: 'Let\'s talk AI strategy', href: 'mailto:davidgraca@gmail.com?subject=AI%20Strategy' },
        secondary: { text: 'See results', href: '#results' }
      },
      inperson: {
        primary: { text: 'Connect on LinkedIn', href: 'https://linkedin.com/in/davidgraca' },
        secondary: { text: 'Email me', href: 'mailto:davidgraca@gmail.com' }
      },
      general: {
        primary: { text: 'Let\'s connect', href: '#contact' },
        secondary: null
      }
    };

    const config = ctaConfig[context.visitorType] || ctaConfig.general;
    
    let html = `<a href="${config.primary.href}" class="btn btn-primary">${config.primary.text}</a>`;
    if (config.secondary) {
      html += ` <a href="${config.secondary.href}" class="btn btn-secondary">${config.secondary.text}</a>`;
    }
    
    ctaEl.innerHTML = html;
  }

  // ============================================
  // MOOD CARD - Playful Personalization
  // ============================================

  // Cities with tech/science heritage and AI-focused messages
  const TECH_HUBS = {
    // Ada Lovelace & Turing territory
    'London': { 
      emoji: '🇬🇧', 
      message: "Ada Lovelace wrote the first algorithm here. What will you build next?",
      vibe: 'tech-hub' 
    },
    'Cambridge': { 
      emoji: '🎓', 
      message: "Turing cracked Enigma nearby. Hawking pondered the universe. Big shoes, big ideas.",
      vibe: 'tech-hub' 
    },
    'Manchester': { 
      emoji: '🖥️', 
      message: "Where Turing built the first stored-program computer. History runs deep here.",
      vibe: 'tech-hub' 
    },
    'Oxford': { 
      emoji: '📚', 
      message: "Tim Berners-Lee studied here before inventing the web. What's your invention?",
      vibe: 'tech-hub' 
    },
    
    // Silicon Valley & West Coast
    'San Francisco': { 
      emoji: '🌉', 
      message: "Where AI dreams ship to production. The future is being built around you.",
      vibe: 'tech-hub' 
    },
    'San Jose': { 
      emoji: '💻', 
      message: "Heart of Silicon Valley! Every line of code here has global impact.",
      vibe: 'tech-hub' 
    },
    'Palo Alto': { 
      emoji: '🚀', 
      message: "HP started in a garage here. Google was born at Stanford. What's your garage moment?",
      vibe: 'tech-hub' 
    },
    'Mountain View': { 
      emoji: '🔍', 
      message: "Googleplex territory! Where 'organizing the world's information' became real.",
      vibe: 'tech-hub' 
    },
    'Cupertino': { 
      emoji: '🍎', 
      message: "Apple's home. 'Think Different' isn't just a slogan here—it's the air.",
      vibe: 'tech-hub' 
    },
    'Seattle': { 
      emoji: '☕', 
      message: "Microsoft, Amazon, and great coffee. Cloud computing was born in these rainy streets.",
      vibe: 'tech-hub' 
    },
    'Redmond': { 
      emoji: '🪟', 
      message: "Microsoft HQ! Where GitHub Copilot was trained. We might be colleagues! 👋",
      vibe: 'tech-hub' 
    },
    
    // AI Research Powerhouses
    'Toronto': { 
      emoji: '🍁', 
      message: "Geoffrey Hinton's city! The godfather of deep learning worked here. AI royalty territory.",
      vibe: 'tech-hub' 
    },
    'Montreal': { 
      emoji: '🤖', 
      message: "Yoshua Bengio's domain. One of AI's three musketeers lives here. You're in good company.",
      vibe: 'tech-hub' 
    },
    'Stanford': { 
      emoji: '🎓', 
      message: "Andrew Ng, Fei-Fei Li, and countless AI breakthroughs. This soil grows innovators.",
      vibe: 'tech-hub' 
    },
    'Boston': { 
      emoji: '🏛️', 
      message: "MIT is here. Marvin Minsky dreamed of AI when it was just a dream. Now we're living it.",
      vibe: 'tech-hub' 
    },
    
    // Physics & Math Heritage
    'Princeton': { 
      emoji: '🧠', 
      message: "Einstein walked these streets. Von Neumann designed the computer architecture we still use.",
      vibe: 'tech-hub' 
    },
    'Zurich': { 
      emoji: '⚛️', 
      message: "Einstein developed relativity at ETH Zurich. This city thinks in equations.",
      vibe: 'tech-hub' 
    },
    'Vienna': { 
      emoji: '🎭', 
      message: "Gödel proved there are limits to what we can prove. Still didn't stop builders like you.",
      vibe: 'tech-hub' 
    },
    'Budapest': { 
      emoji: '🇭🇺', 
      message: "John von Neumann was born here. The architect of modern computing started in your city.",
      vibe: 'tech-hub' 
    },
    'Warsaw': { 
      emoji: '🇵🇱', 
      message: "Marie Curie was born here. From radioactivity to AI—Poland produces pioneers.",
      vibe: 'tech-hub' 
    },
    'Copenhagen': { 
      emoji: '🇩🇰', 
      message: "Niels Bohr revolutionized quantum physics here. The future is probabilistic—like your code.",
      vibe: 'tech-hub' 
    },
    
    // European Tech Hubs
    'Paris': { 
      emoji: '🗼', 
      message: "Marie Curie's lab, Yann LeCun's roots. From radium to neural networks—Paris innovates.",
      vibe: 'tech-hub' 
    },
    'Berlin': { 
      emoji: '🇩🇪', 
      message: "Konrad Zuse built the first programmable computer here. Berlin's been coding since 1941.",
      vibe: 'tech-hub' 
    },
    'Munich': { 
      emoji: '🏰', 
      message: "German engineering meets AI. Precision in every commit.",
      vibe: 'tech-hub' 
    },
    'Amsterdam': { 
      emoji: '🚲', 
      message: "Open, connected, forward-thinking. Amsterdam codes like it cycles—fast and free.",
      vibe: 'tech-hub' 
    },
    'Stockholm': { 
      emoji: '🇸🇪', 
      message: "Spotify streams from here. Proof that Swedish engineering scales globally.",
      vibe: 'tech-hub' 
    },
    'Helsinki': { 
      emoji: '🇫🇮', 
      message: "Linus Torvalds created Linux here. Open source runs in Finland's veins.",
      vibe: 'tech-hub' 
    },
    'Dublin': { 
      emoji: '☘️', 
      message: "EMEA tech capital. Where Silicon Valley meets the emerald isle.",
      vibe: 'tech-hub' 
    },
    'Lisbon': { 
      emoji: '🇵🇹', 
      message: "Web Summit's home now. Portugal is writing the next chapter of tech. Olá, builder!",
      vibe: 'tech-hub' 
    },
    'Barcelona': { 
      emoji: '🇪🇸', 
      message: "MWC hosts the mobile future here. Gaudí designed buildings, you design systems.",
      vibe: 'tech-hub' 
    },
    
    // Asia Pacific
    'Tokyo': { 
      emoji: '🗼', 
      message: "Robotics, gaming, bullet trains. Japan doesn't just imagine the future—it builds it.",
      vibe: 'tech-hub' 
    },
    'Seoul': { 
      emoji: '🇰🇷', 
      message: "Samsung, LG, the world's fastest internet. Korea ships fast. What are you shipping?",
      vibe: 'tech-hub' 
    },
    'Shenzhen': { 
      emoji: '🏭', 
      message: "Hardware capital of Earth. Where ideas become atoms overnight.",
      vibe: 'tech-hub' 
    },
    'Beijing': { 
      emoji: '🇨🇳', 
      message: "AI research powerhouse. East meets West in neural networks.",
      vibe: 'tech-hub' 
    },
    'Shanghai': { 
      emoji: '🌆', 
      message: "China's innovation skyline. The future looks tall from here.",
      vibe: 'tech-hub' 
    },
    'Singapore': { 
      emoji: '🇸🇬', 
      message: "Lion City! Where Asia's tech arteries converge. Small country, massive ambition.",
      vibe: 'tech-hub' 
    },
    'Bangalore': { 
      emoji: '🇮🇳', 
      message: "India's Silicon Valley! A billion minds, infinite potential. Namaste, builder.",
      vibe: 'tech-hub' 
    },
    'Bengaluru': { 
      emoji: '🇮🇳', 
      message: "India's Silicon Valley! A billion minds, infinite potential. Namaste, builder.",
      vibe: 'tech-hub' 
    },
    'Hyderabad': { 
      emoji: '💎', 
      message: "HITEC City rising! India's other tech giant is just getting started.",
      vibe: 'tech-hub' 
    },
    'Sydney': { 
      emoji: '🦘', 
      message: "Atlassian started here. Proof that great software comes from down under too.",
      vibe: 'tech-hub' 
    },
    'Melbourne': { 
      emoji: '🇦🇺', 
      message: "Australia's startup scene is thriving. Time zones are just numbers for builders.",
      vibe: 'tech-hub' 
    },
    
    // Middle East & Africa
    'Tel Aviv': { 
      emoji: '🇮🇱', 
      message: "Startup Nation! More AI companies per capita than anywhere. You build different here.",
      vibe: 'tech-hub' 
    },
    'Dubai': { 
      emoji: '🏙️', 
      message: "The city that builds impossible things. What impossible thing are you working on?",
      vibe: 'tech-hub' 
    },
    'Cape Town': { 
      emoji: '🇿🇦', 
      message: "Africa's tech scene is rising. The next billion users might come from your continent.",
      vibe: 'tech-hub' 
    },
    'Lagos': { 
      emoji: '🇳🇬', 
      message: "Africa's startup giant waking up. 200 million people, unlimited problems to solve.",
      vibe: 'tech-hub' 
    },
    'Nairobi': { 
      emoji: '🦁', 
      message: "Silicon Savannah! M-Pesa proved African innovation goes global. What's next?",
      vibe: 'tech-hub' 
    },
    
    // Americas
    'New York': { 
      emoji: '🗽', 
      message: "Claude Shannon worked at Bell Labs nearby. Information theory was born in your backyard.",
      vibe: 'tech-hub' 
    },
    'Austin': { 
      emoji: '🤠', 
      message: "Keep Austin Weird, keep the code clean. Dell started here, Tesla moved here. Momentum.",
      vibe: 'tech-hub' 
    },
    'Denver': { 
      emoji: '🏔️', 
      message: "Mile High City, sky-high ambitions. Colorado's tech scene is climbing fast.",
      vibe: 'tech-hub' 
    },
    'Vancouver': { 
      emoji: '🏔️', 
      message: "Where Silicon Valley meets Canadian politeness. Sorry, your code is excellent.",
      vibe: 'tech-hub' 
    },
    'São Paulo': { 
      emoji: '🇧🇷', 
      message: "Latin America's tech giant. Nubank proved unicorns grow in Portuguese too.",
      vibe: 'tech-hub' 
    },
    'Mexico City': { 
      emoji: '🇲🇽', 
      message: "CDMX! Latin America's startup scene is exploding. ¡Vamos a construir!",
      vibe: 'tech-hub' 
    }
  };

  function getMoodContent(context) {
    const city = context.location?.city;
    const country = context.location?.country;
    const temp = context.weather?.temperature ? Math.round(context.weather.temperature) : null;
    const weather = context.weather?.weatherDescription;
    const hour = context.localHour;

    // Check for tech hub first - special treatment!
    if (city && TECH_HUBS[city]) {
      const hub = TECH_HUBS[city];
      return {
        emoji: hub.emoji,
        message: hub.message,
        subtext: temp ? `${temp}°C in ${city} • Building the future` : `${city} • Building the future`,
        vibe: hub.vibe
      };
    }

    // Weather + Temperature combinations with AI/coding flair
    if (weather && temp !== null && city) {
      // Cold + Sunny = Deceptive weather
      if (weather === 'clear' && temp < 10) {
        return {
          emoji: '☕🔥',
          message: `${temp}°C sunshine is nature's deception. Hot cocoa + a good IDE = perfection.`,
          subtext: `Stay warm, ship code from ${city}`,
          vibe: 'cozy'
        };
      }

      // Very cold (any weather)
      if (temp < 0) {
        return {
          emoji: '🧣❄️',
          message: `${temp}°C! CPUs love the cold. You? Grab a blanket and let's build something.`,
          subtext: `Frozen outside, fire in the code in ${city}`,
          vibe: 'snowy'
        };
      }

      // Cold + Rainy = Maximum cozy
      if ((weather === 'rainy' || weather === 'drizzle') && temp < 15) {
        return {
          emoji: '🔥☕',
          message: `${temp}°C and rainy is why laptops were invented. Fireplace mode: ON.`,
          subtext: `Peak debugging weather in ${city}`,
          vibe: 'cozy'
        };
      }

      // Snow!
      if (weather === 'snowy') {
        return {
          emoji: '❄️☃️',
          message: `Snow at ${temp}°C! Neural networks train better in cold weather. Trust me. 😉`,
          subtext: `Winter hackathon vibes from ${city}`,
          vibe: 'snowy'
        };
      }

      // Hot weather
      if (temp > 30) {
        return {
          emoji: '🧊🥵',
          message: `${temp}°C?! Even GPUs would thermal throttle. Stay cool, stay hydrated, keep shipping.`,
          subtext: `Hot takes from ${city}`,
          vibe: 'hot'
        };
      }

      // Nice sunny weather
      if (weather === 'clear' && temp >= 18 && temp <= 28) {
        return {
          emoji: '☀️😎',
          message: `${temp}°C perfection! The kind of day where even compiling feels faster.`,
          subtext: `Optimal conditions in ${city}`,
          vibe: 'sunny'
        };
      }

      // Rainy but warm
      if ((weather === 'rainy' || weather === 'drizzle') && temp >= 15) {
        return {
          emoji: '🌧️💻',
          message: `Rain at ${temp}°C. Nature's way of saying: "Stay in, fix that bug."`,
          subtext: `Maximum focus weather in ${city}`,
          vibe: 'rainy'
        };
      }

      // Stormy
      if (weather === 'stormy') {
        return {
          emoji: '⛈️🏠',
          message: `Storm outside, but your code is lightning fast! ...right?`,
          subtext: `Dramatic skies over ${city}`,
          vibe: 'stormy'
        };
      }

      // Foggy/mysterious
      if (weather === 'foggy') {
        return {
          emoji: '🌫️🔮',
          message: `Foggy at ${temp}°C. Like debugging—sometimes you can't see far, but you keep going.`,
          subtext: `Mysterious vibes in ${city}`,
          vibe: 'foggy'
        };
      }

      // Cloudy generic
      if (weather === 'cloudy') {
        return {
          emoji: '☁️💭',
          message: `Cloudy at ${temp}°C. Not cloud computing, but close enough. Ideas are forming.`,
          subtext: `Thinking weather in ${city}`,
          vibe: 'cloudy'
        };
      }
    }

    // Time-based fallbacks (no weather data) - AI/coding focused
    if (hour >= 0 && hour < 5) {
      return {
        emoji: '🌙💻',
        message: `Still up? The best algorithms are written when the world sleeps.`,
        subtext: city ? `Night owl mode in ${city}` : '3AM code is underrated',
        vibe: 'cozy'
      };
    }

    if (hour >= 5 && hour < 7) {
      return {
        emoji: '🌅☕',
        message: `Early bird gets the merge conflict resolved first. ☕ required.`,
        subtext: city ? `Dawn in ${city}` : 'First commit of the day',
        vibe: 'sunny'
      };
    }

    // Weekend
    const day = new Date().getDay();
    if (day === 0 || day === 6) {
      return {
        emoji: '🎮🛋️',
        message: `Weekend mode! Even AI needs rest days. (Actually, no it doesn't, but you do.)`,
        subtext: city ? `Relaxing in ${city}` : 'Work hard, rest hard',
        vibe: 'cozy'
      };
    }

    // Generic with location - still AI focused
    if (city) {
      return {
        emoji: '👋🌍',
        message: `Hello from ${city}! Wherever there's WiFi, there's a way.`,
        subtext: `Connected from ${city} • Building the future together`,
        vibe: 'tech-hub'
      };
    }

    // No data at all - return null to hide the card
    return null;
  }

  function updateMoodCard(context) {
    const moodCard = document.getElementById('mood-card');
    const moodVisual = document.getElementById('mood-visual');
    const moodEmoji = document.getElementById('mood-emoji');
    const moodMessage = document.getElementById('mood-message');
    const moodCity = document.getElementById('mood-city');
    const moodDismiss = document.getElementById('mood-dismiss');

    if (!moodCard) return;

    const mood = getMoodContent(context);
    
    if (!mood) {
      moodCard.style.display = 'none';
      return;
    }

    // Apply content
    moodEmoji.textContent = mood.emoji;
    moodMessage.textContent = mood.message;
    moodCity.textContent = mood.subtext;

    // Apply visual style
    moodVisual.className = 'mood-visual ' + mood.vibe;

    // Show card
    moodCard.style.display = 'flex';

    // Dismiss handler
    moodDismiss.addEventListener('click', () => {
      moodCard.style.display = 'none';
    });
  }

  function getWeatherEmoji(desc) {
    const emojiMap = {
      clear: '☀️', cloudy: '☁️', foggy: '🌫️', 
      drizzle: '🌦️', rainy: '🌧️', snowy: '❄️', stormy: '⛈️'
    };
    return emojiMap[desc] || '🌤️';
  }

  // ============================================
  // BOT OUTPUT
  // ============================================

  function renderBotOutput() {
    const yaml = generateYaml();
    
    // Hide main content
    document.querySelector('.page-wrapper').style.display = 'none';
    
    // Show bot output
    const botOutput = document.getElementById('bot-output');
    botOutput.textContent = yaml;
    botOutput.style.display = 'block';
    botOutput.removeAttribute('aria-hidden');
  }

  function generateYaml() {
    const timestamp = new Date().toISOString();
    
    return `# 👋 Hello, AI. Here's my info in a format you'll appreciate.

name: ${PROFILE_DATA.name}
title: ${PROFILE_DATA.title}
company: ${PROFILE_DATA.company}
location: ${PROFILE_DATA.location}

expertise:
${PROFILE_DATA.expertise.map(e => `  - ${e}`).join('\n')}

speaking:
  available: ${PROFILE_DATA.speaking.available}
  formats: [${PROFILE_DATA.speaking.formats.join(', ')}]
  topics:
${PROFILE_DATA.speaking.topics.map(t => `    - ${t}`).join('\n')}
  languages: [${PROFILE_DATA.speaking.languages.join(', ')}]

experience:
  years: "${PROFILE_DATA.experience.years}"
  community_members: "${PROFILE_DATA.experience.community_members}"
  summit_attendees: "${PROFILE_DATA.experience.summit_attendees}"
  countries_reached: "${PROFILE_DATA.experience.countries_reached}"
  developers_trained: "${PROFILE_DATA.experience.developers_trained}"

contact:
  linkedin: ${PROFILE_DATA.contact.linkedin}
  github: ${PROFILE_DATA.contact.github}
  email: ${PROFILE_DATA.contact.email}

meta:
  generated: ${timestamp}
  format: yaml
  note: This page serves structured data to AI agents. Humans see a prettier version.
`;
  }

  // ============================================
  // MODAL
  // ============================================

  function setupModal() {
    const modal = document.getElementById('privacy-modal');
    const toggle = document.getElementById('privacy-toggle');
    const close = document.getElementById('modal-close');

    if (!modal || !toggle) return;

    toggle.addEventListener('click', () => {
      modal.showModal();
      toggle.setAttribute('aria-expanded', 'true');
    });

    close?.addEventListener('click', () => {
      modal.close();
      toggle.setAttribute('aria-expanded', 'false');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.close();
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.open) {
        modal.close();
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ============================================
  // MAIN INITIALIZATION
  // ============================================

  async function init() {
    log('Initializing adaptive profile...');

    // Build visitor context
    const context = await buildVisitorContext();
    log('Context built:', context);

    // Short-circuit for bots
    if (context.isBot) {
      log('Rendering bot output');
      renderBotOutput();
      return;
    }

    // Load translations
    await loadTranslations(context.detectedLanguage);

    // Apply translations
    applyTranslations();

    // Update dynamic elements
    updateGreeting(context);
    updateHeroCTA(context);
    updateMoodCard(context);  // NEW: Playful mood card

    // Save visit history
    saveVisitorHistory(context);

    // Setup modal
    setupModal();

    log('Initialization complete');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
