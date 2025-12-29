# API Contract: Open-Meteo

**Service**: Weather Data  
**Type**: External REST API  
**Authentication**: None required

## Endpoint

```
GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true
```

## Rate Limits

- **Free tier**: Unlimited (no rate limiting)
- **Fair use**: Non-commercial projects welcome
- **No API key required**

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | float | Yes | Latitude (-90 to 90) |
| `longitude` | float | Yes | Longitude (-180 to 180) |
| `current_weather` | boolean | Yes | Include current conditions |

## Response

### Success (HTTP 200)

```json
{
  "latitude": 48.86,
  "longitude": 2.35,
  "generationtime_ms": 0.15,
  "utc_offset_seconds": 0,
  "timezone": "GMT",
  "timezone_abbreviation": "GMT",
  "elevation": 42.0,
  "current_weather": {
    "temperature": 12.5,
    "windspeed": 15.2,
    "winddirection": 230,
    "weathercode": 61,
    "is_day": 1,
    "time": "2024-01-15T14:00"
  }
}
```

### Error Response (HTTP 400)

```json
{
  "error": true,
  "reason": "Latitude must be in range of -90 to 90°."
}
```

## Weather Codes (WMO)

| Code | Description | Quip Trigger |
|------|-------------|--------------|
| 0 | Clear sky | sunny |
| 1-3 | Partly cloudy | cloudy |
| 45, 48 | Fog | foggy |
| 51-55 | Drizzle | drizzle |
| 61-65 | Rain | rainy |
| 66, 67 | Freezing rain | freezing |
| 71-75 | Snow | snowy |
| 77 | Snow grains | snowy |
| 80-82 | Rain showers | rainy |
| 85, 86 | Snow showers | snowy |
| 95 | Thunderstorm | stormy |
| 96, 99 | Thunderstorm w/hail | stormy |

## Error Handling

| Scenario | Response | Our Action |
|----------|----------|------------|
| Invalid coords | HTTP 400 | Skip weather entirely |
| Network error | Timeout | Skip weather entirely |
| Missing current_weather | Malformed | Skip weather entirely |

## Implementation

```javascript
async function fetchWeather(lat, lon) {
  if (!lat || !lon) return null;
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  
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
```

## CORS

✅ Enabled - No proxy needed for client-side requests.

## Dependencies

Requires latitude/longitude from ip-api.com. If ip-api.com fails, weather API is skipped entirely.

## Attribution

Per Open-Meteo terms: No attribution required for non-commercial use, but appreciated. Consider:

```html
<small>Weather data by <a href="https://open-meteo.com/">Open-Meteo</a></small>
```
