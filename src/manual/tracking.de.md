---
title: Live-Tracking
icon: FaBullseye
order: 600
---

Mit Live-Tracking sehen Sie auf der Karte, wo sich ein Handy oder ein GPS-Tracker gerade befindet, zusammen mit dem zurückgelegten Weg. So können Sie Ihre eigene Position mit anderen teilen und Geräte beobachten, die andere mit Ihnen teilen.

Sie öffnen es im :FaBars: Hauptmenü als :FaBullseye: **Live-Tracking** oder mit den Tasten <kbd>g</kbd> <kbd>t</kbd>.

## Die eigene Position teilen

1. Melden Sie sich an und öffnen Sie :FaMobileAlt: **Meine Geräte**.
2. Drücken Sie :FaPlus: **Neu hinzufügen** und füllen Sie das Feld **Name** aus. Lassen Sie **Token** leer, er wird beim Speichern generiert.
3. Richten Sie Ihr Handy oder Ihren Tracker mit dem Token des Geräts ein – er steht in der Liste vor dem Gerätenamen. Siehe den nächsten Abschnitt.
4. Damit Sie jemand beobachten kann, wählen Sie im Menü des Geräts :FaKey: **Beobachtungstoken** und drücken Sie :FaPlus: **Neu hinzufügen**. Senden Sie den Token oder den mit :FaClipboard: **URL kopieren** kopierten Link.

Behalten Sie den Geräte-Token für sich – wer ihn kennt, kann im Namen Ihres Geräts Positionen senden. Teilen Sie stattdessen Beobachtungstoken.

## Einrichtung des Geräts

Freemap unterstützt zwei Methoden zum Senden des Gerätestandorts.

### Methode 1: Native Freemap-HTTP-Protokollverfolgung

Verwenden Sie diese Methode mit Apps wie [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) oder [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (aktivieren Sie die Funktion **Online tracking** in den Trip-Recording-Einstellungen).

Konfigurieren Sie die Tracking-URL in Ihrer App:

```
https://backend.freemap.sk/tracking/track/{token}
```

Ersetzen Sie `{token}` durch Ihren Geräte-Token aus der [Geräteliste](#show=tracking-my).

Die Adresse akzeptiert HTTP `GET` oder `POST` mit folgenden Parametern:

| Parameter | Beschreibung |
|---|---|
| `location` | Kommagetrennte Breiten- und Längengrad in Grad **(erforderlich, oder `lat` und `lon`)** |
| `lat` | Breitengrad in Grad |
| `lon` | Längengrad in Grad |
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

### Methode 2: Traccar-basierte Verfolgung

Verwenden Sie diese Methode mit der [Traccar Client](https://www.traccar.org/client/) App, dedizierten Hardware-GPS-Trackern (z. B. Fahrzeugtracker, Asset-Tracker, Tiertracker) oder anderen Traccar-kompatiblen Apps wie Locus Map oder OsmAnd (für diese wird jedoch die native Freemap-HTTP-Verfolgung empfohlen).

Konfigurieren Sie Ihr Gerät oder Ihre App zum Senden an:

- **Server:** `traccar.freemap.sk`
- **Port:** Verwenden Sie den Standardport für das Protokoll Ihres Geräts (siehe [Traccar-Geräteliste](https://www.traccar.org/devices/)); für HTTP oder HTTPS können Sie die Ports **80** oder **443** statt 5055 (HTTP) verwenden

Verwenden Sie Ihren **Geräte-Token** (aus der [Geräteliste](#show=tracking-my)) als Gerätekennung. Für Traccar Client zeigt :SiTraccar: **Traccar-QR-Code** im Menü des Geräts einen Code; scannen Sie ihn in der App, um sie mit dem Token Ihres Geräts einzurichten.

Traccar unterstützt über 200 Protokolle — prüfen Sie die [Traccar-Geräteliste](https://www.traccar.org/devices/), um den richtigen Port für Ihr spezifisches Hardwaregerät zu finden.

## Geräte beobachten

1. Öffnen Sie :FaRegEye: **Beobachtet** und drücken Sie :FaPlus: **Neu hinzufügen**.
2. Geben Sie den erhaltenen **Beobachtungs-Token** ein und drücken Sie :FaCheck: **Speichern**. Das Gerät erscheint auf der Karte.

Ein Link, den jemand mit Ihnen geteilt hat, öffnet die Karte mit seinem Gerät bereits beobachtet. Die Liste der beobachteten Geräte wird nur in der Seitenadresse festgehalten; um sie zu behalten, speichern Sie die Karte in :FaRegMap: [Meine Karten](#show=my-maps).
