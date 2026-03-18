---
title: Einrichtung der Gerätestandortverfolgung
---

Freemap unterstützt zwei Methoden zum Senden des Gerätestandorts.

---

## Methode 1: Native Freemap-HTTP-Protokollverfolgung

Verwenden Sie diese Methode mit Apps wie [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) oder [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (aktivieren Sie die Funktion **Online tracking** in den Trip-Recording-Einstellungen).

Konfigurieren Sie die Tracking-URL in Ihrer App:

```
https://backend.freemap.sk/tracking/track/{token}
```

Ersetzen Sie `{token}` durch Ihren Geräte-Token aus der Tabelle in der [Geräteliste](#show=tracking-my).

Der Endpunkt akzeptiert HTTP `GET` oder `POST` mit folgenden Parametern:

| Parameter | Beschreibung |
|---|---|
| `location` | Kommagetrennte Breiten- und Längengrad in Grad **(erforderlich)** |
| `lat` | Breitengrad in Grad **(erforderlich)** |
| `lon` | Längengrad in Grad **(erforderlich)** |
| `time`, `timestamp` | JavaScript-parsebares Datum/Uhrzeit oder Unix-Zeit in Sekunden oder Millisekunden |
| `alt`, `altitude` | Höhe in Metern |
| `speed` | Geschwindigkeit in m/s |
| `speedKmh` | Geschwindigkeit in km/h |
| `acc`, `accuracy` | Genauigkeit in Metern |
| `hdop` | Horizontale DOP |
| `bearing`, `heading` | Richtung in Grad |
| `battery`, `batt` | Akkustand in Prozent |
| `gsm_signal` | GSM-Signalstärke in Prozent |
| `message` | Notiz / Nachricht |

---

## Methode 2: Traccar-basierte Verfolgung

Verwenden Sie diese Methode mit der [Traccar Client](https://www.traccar.org/client/) App, dedizierten Hardware-GPS-Trackern (z. B. Fahrzeugtracker, Asset-Tracker, Tiertracker) oder anderen Traccar-kompatiblen Apps wie Locus Map oder OsmAnd (für diese wird jedoch die native Freemap-HTTP-Verfolgung empfohlen).

Konfigurieren Sie Ihr Gerät oder Ihre App zum Senden an:

- **Server:** `traccar.freemap.sk`
- **Port:** Verwenden Sie den Standardport für das Protokoll Ihres Geräts (siehe [Traccar-Geräteliste](https://www.traccar.org/devices/)); für HTTP oder HTTPS können Sie die Ports **80** oder **443** statt 5055 (HTTP) verwenden

Verwenden Sie Ihren **Geräte-Token** (aus der [Geräteliste](#show=tracking-my)) als Gerätekennung.

Traccar unterstützt über 200 Protokolle — prüfen Sie die [Traccar-Geräteliste](https://www.traccar.org/devices/), um den richtigen Port für Ihr spezifisches Hardwaregerät zu finden.
