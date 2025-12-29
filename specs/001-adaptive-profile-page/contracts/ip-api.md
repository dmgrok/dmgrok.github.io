# API Contract: ip-api.com

**Service**: IP Geolocation  
**Type**: External REST API  
**Authentication**: None required (free tier)

## Endpoint

```
GET http://ip-api.com/json/?fields=status,country,countryCode,regionName,city,lat,lon,timezone,isp,org,mobile,proxy,hosting
```

**Note**: Use HTTP, not HTTPS (HTTPS requires paid tier)

## Rate Limits

- **Free tier**: 45 requests/minute
- **Response** on rate limit: HTTP 429
- **Recommendation**: Single request per page load, no retry

## Request

No parameters needed - IP is inferred from requester.

**Custom fields** (specified in query):
- `status` - success/fail indicator
- `country` - Country name
- `countryCode` - ISO 3166-1 alpha-2
- `regionName` - State/Province
- `city` - City name
- `lat` - Latitude
- `lon` - Longitude
- `timezone` - IANA timezone
- `isp` - ISP name
- `org` - Organization (company)
- `mobile` - Mobile carrier flag
- `proxy` - VPN/Proxy flag
- `hosting` - Datacenter flag

## Response

### Success (HTTP 200)

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

### Failure (HTTP 200, status=fail)

```json
{
  "status": "fail",
  "message": "reserved range",
  "query": "127.0.0.1"
}
```

## Error Handling

| Scenario | Response | Our Action |
|----------|----------|------------|
| Rate limited | HTTP 429 | Skip location, use browser timezone |
| Reserved IP | `status: "fail"` | Skip location, use browser timezone |
| Network error | Timeout | Skip location, use browser timezone |
| Invalid fields | Missing data | Use available fields only |

## Implementation

```javascript
async function fetchLocation() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  
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
```

## CORS

✅ Enabled - No proxy needed for client-side requests.

## Privacy Note

The API receives the visitor's IP address. We do not store or transmit this to any other service. The IP is only used transiently to fetch location data.
