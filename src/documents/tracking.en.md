---
title: Device Location Tracking Setup
icon: FaMobileAlt
listed: false
---

Freemap supports two methods for sending your device's location.

---

## Method 1: Native Freemap HTTP protocol tracking

Use this method with apps like [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) or [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (enable the **Online tracking** feature in Trip Recording settings).

Configure the tracking URL in your app:

```
https://backend.freemap.sk/tracking/track/{token}
```

Replace `{token}` with your device token from the table in the [device list](#show=tracking-my).

The endpoint accepts HTTP `GET` or `POST` with the following parameters:

| Parameter | Description |
|---|---|
| `location` | Comma separated latitude with longitude degrees **(required)** |
| `lat` | Latitude in degrees **(required)** |
| `lon` | Longitude in degrees **(required)** |
| `time`, `timestamp` | JavaScript-parsable datetime or Unix time in seconds or milliseconds |
| `alt`, `altitude` | Altitude in meters |
| `speed` | Speed in m/s |
| `speedKmh` | Speed in km/h |
| `acc`, `accuracy` | Accuracy in meters |
| `hdop` | Horizontal DOP |
| `bearing`, `heading` | Bearing in degrees |
| `battery`, `batt` | Battery level in percent |
| `gsm_signal` | GSM signal strength in percent |
| `message` | Note / message |

---

## Method 2: Traccar-based tracking

Use this method with the [Traccar Client](https://www.traccar.org/client/) app, dedicated hardware GPS trackers (e.g. car trackers, asset trackers, pet trackers), or other Traccar-compatible apps such as Locus Map or OsmAnd (though native Freemap HTTP tracking is recommended for those).

Configure your device or app to send to:

- **Server:** `traccar.freemap.sk`
- **Port:** use the standard port for your device's protocol (see [Traccar supported devices](https://www.traccar.org/devices/)); for HTTP or HTTPS you can use ports **80** or **443** instead of 5055 (HTTP)

Use your **device token** (from the [device list](#show=tracking-my)) as the device identifier in your device or app configuration.

Traccar supports over 200 protocols — check the [Traccar device list](https://www.traccar.org/devices/) to find the correct port for your specific hardware device.
