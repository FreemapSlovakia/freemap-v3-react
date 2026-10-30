---
title: Live-Tracking
icon: FaBullseye
order: 600
---

Mit Live-Tracking sehen Sie auf der Karte, wo sich ein Handy oder ein GPS-Tracker gerade befindet, zusammen mit dem zurückgelegten Weg. Sie können Ihre eigene Position mit anderen teilen und Geräte beobachten, die andere mit Ihnen teilen.

Sie öffnen es im :FaBars: Hauptmenü als :FaBullseye: **Live-Tracking** oder mit den Tasten <kbd>g</kbd> <kbd>t</kbd>.

## Die Werkzeugleiste

![Die Werkzeugleiste des Live-Trackings](./images/tracking-toolbar.en.webp)

- :FaRegEye: **Beobachtet** – die Geräte, die Sie beobachten (<kbd>g</kbd> <kbd>w</kbd>).
- :FaMobileAlt: **Meine Geräte** – Ihre eigenen Geräte, die ihre Position senden (<kbd>g</kbd> <kbd>d</kbd>). Dafür ist eine Anmeldung nötig.
- :FaRegEye: **Anzeige** – die Tracks als **Punkte**, als **Linie** oder als **Linie + Punkte** darstellen.
- :FaPalette: **Einfärben nach** – die Tracks nach einem aufgezeichneten Wert einfärben, etwa nach Höhe, Geschwindigkeit oder Zeit. Angeboten werden nur die Werte, die die Tracks enthalten; manche Modi erfordern Premium-Zugang.
- :FaChartArea: **Höhenprofil** – erscheint, wenn ein Track Höhenangaben enthält.
- :FaEllipsisV: – :MdShapeLine: **Nach Tracks und Daten kopieren** erstellt eine bearbeitbare Kopie der Tracks, die Sie anschließend exportieren können. Das Tracking läuft weiter.

## Die eigene Position teilen

1. Melden Sie sich an und öffnen Sie :FaMobileAlt: **Meine Geräte**.
2. Drücken Sie :FaPlus: **Neu hinzufügen** und füllen Sie das Feld **Name** aus. Bleibt **Tracking-Token** leer, wird der Token beim Speichern generiert. **Maximale Anzahl** und **Maximales Alter** begrenzen, wie viele Positionen wie lange aufbewahrt werden.
3. Richten Sie Ihr Handy oder Ihren Tracker mit dem Token des Geräts ein – er steht in der Liste vor dem Gerätenamen. Siehe den nächsten Abschnitt.
4. Damit jemand Sie beobachten kann, wählen Sie im Menü des Geräts :FaKey: **Beobachtungstoken** und drücken Sie :FaPlus: **Neu hinzufügen**. **Von** und **Bis** begrenzen den Zeitraum, für den der Token gilt, und unter **Notiz** können Sie festhalten, wem Sie ihn gegeben haben. Senden Sie der Person den Token oder den mit :FaClipboard: **URL kopieren** kopierten Link, der die Karte mit Ihrem Gerät öffnet.

Behalten Sie den Geräte-Token für sich – wer ihn kennt, kann im Namen Ihres Geräts Positionen senden. Teilen Sie stattdessen Beobachtungstoken: Sie können für jede Person einen eigenen anlegen und ihn löschen, um das Teilen zu beenden.

## Einrichtung des Geräts

### Freemap-HTTP-Protokoll

Dieses Protokoll eignet sich für Apps wie [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) oder [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (aktivieren Sie **Online tracking** in den Einstellungen von Trip Recording). Tragen Sie in der App als Tracking-URL ein:

```
https://backend.freemap.sk/tracking/track/{token}
```

Ersetzen Sie `{token}` durch den Token Ihres Geräts aus :FaMobileAlt: [Meine Geräte](#show=tracking-my).

Die Adresse akzeptiert HTTP `GET` oder `POST` mit folgenden Parametern:

| Parameter | Beschreibung |
|---|---|
| `location` | Breiten- und Längengrad in Grad, durch Komma getrennt **(erforderlich, oder `lat` und `lon`)** |
| `lat` | Breitengrad in Grad |
| `lon` | Längengrad in Grad |
| `time`, `timestamp` | Von JavaScript lesbares Datum mit Uhrzeit oder Unix-Zeit in Sekunden oder Millisekunden |
| `alt`, `altitude` | Höhe in Metern |
| `speed` | Geschwindigkeit in m/s |
| `speedKmh` | Geschwindigkeit in km/h |
| `acc`, `accuracy` | Genauigkeit in Metern |
| `hdop` | Horizontale DOP |
| `bearing`, `heading` | Richtung in Grad |
| `battery`, `batt` | Akkustand in Prozent |
| `gsm_signal` | GSM-Signalstärke in Prozent |
| `message` | Notiz / Nachricht |

### Traccar

Dieses Protokoll eignet sich für die App [Traccar Client](https://www.traccar.org/client/), für GPS-Tracker (im Auto, für Eigentum, für Haustiere) oder für andere Traccar-kompatible Apps. Für Locus Map und OsmAnd wird das oben beschriebene Freemap-HTTP-Protokoll empfohlen.

- **Server:** `traccar.freemap.sk`
- **Port:** der Standardport des Protokolls Ihres Geräts (siehe die [Traccar-Geräteliste](https://www.traccar.org/devices/) – Traccar unterstützt über 200 Protokolle); für HTTP oder HTTPS können Sie statt 5055 auch Port **80** oder **443** verwenden
- **Gerätekennung:** der Token Ihres Geräts

Für Traccar Client gibt es eine Abkürzung: :SiTraccar: **Traccar-QR-Code** im Menü des Geräts zeigt einen Code; scannen Sie ihn in der App, um sie mit dem Token Ihres Geräts einzurichten.

## Geräte beobachten

1. Öffnen Sie :FaRegEye: **Beobachtet** und drücken Sie :FaPlus: **Neu hinzufügen**.
2. Geben Sie den erhaltenen **Beobachtungs-Token** ein. Optional legen Sie eine **Bezeichnung**, die **Farbe** und **Breite** der Linie fest sowie, welche Positionen angezeigt werden: **Seit**, **Maximales Alter**, **Maximale Anzahl**. **Distanzaufteilung** und **Zeitaufteilung** unterbrechen die Linie dort, wo zwei Positionen räumlich oder zeitlich weiter auseinanderliegen als angegeben.
3. Drücken Sie :FaCheck: **Speichern**. Das Gerät erscheint auf der Karte.

Ein Link, den jemand mit Ihnen geteilt hat, öffnet die Karte mit dem bereits beobachteten Gerät. Auch Ihre eigenen Geräte lassen sich beobachten: :FaRegEye: **Beobachten** in der Liste der Beobachtungstoken eines Geräts.

Die Liste der beobachteten Geräte steht nur in der Seitenadresse. Um sie zu behalten, speichern Sie die Karte in :FaRegMap: [Meine Karten](#show=my-maps).

## Geräte auf der Karte

Jedes Gerät wird in seiner Farbe dargestellt; seine letzte Position markiert eine Personenfigur und, sofern das Gerät sie meldet, ein Kreis, der die Genauigkeit anzeigt. Positionen erscheinen, sobald das Gerät sie sendet. Beim Zeigen auf eine Position sehen Sie deren Zeit und, sofern das Gerät sie sendet, Höhe, Geschwindigkeit, Signal, Akkustand und Nachricht.

Ein Klick auf einen Track wählt ihn aus. Seine Werkzeugleiste bietet :FaPencil: **Bearbeiten**, :FaTrash: **Löschen**, um die Beobachtung zu beenden, und :FaEllipsisV:, um nur diesen Track nach Tracks und Daten zu kopieren.

## GPS-Recorder

Unter Android dient :FaCircle: **GPS-Recorder** im Hauptmenü dazu, die eigene Tour mit der separaten App Freemap GPS Recorder aufzuzeichnen, sodass die Aufzeichnung auch bei geschlossenem Browser weiterläuft. Er wird im Kapitel [GPS-Recorder](#show=manual/gps-recorder) beschrieben.
