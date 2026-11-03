---
title: Live tracking
icon: FaBullseye
order: 600
---

With live tracking you see on the map where a phone or a GPS tracker is right now, together with the path it has taken. You can share your own position with others, and watch the devices others share with you.

Open it from the :FaBars: main menu as :FaBullseye: **Live tracking**, or with the keys <kbd>g</kbd> <kbd>t</kbd>.

## The toolbar

![The live tracking toolbar](./images/tracking-toolbar.en.webp)

- :FaRegEye: **Watched** – the devices you watch (<kbd>g</kbd> <kbd>w</kbd>).
- :FaMobileAlt: **My Devices** – your own devices that send their position (<kbd>g</kbd> <kbd>d</kbd>). You need to be logged in.
- :FaRegEye: **Display** – draw the tracks as **Points**, a **Line**, or **Line + Points**.
- :FaPalette: **Colorize by** – colour the tracks by a recorded value, such as elevation, speed or time. Only the values the tracks carry are offered; some modes need premium access.
- :FaChartArea: **Elevation profile** – shown when a track includes altitude.
- :FaEllipsisV: – :MdShapeLine: **Copy to Drawing and data** makes an editable copy of the tracks, which you can then export. Tracking goes on.

## Sharing your position

1. Log in and open :FaMobileAlt: **My Devices**.
2. Press :FaPlus: **Add new** and enter a **Name**. Leave **Token** empty and it will be generated on save. **Max Count** and **Max Age** limit how many positions are kept and for how long.
3. Set up your phone or tracker with the device's token – it is shown in the list before the device name. See the next section.
4. To let someone watch you, choose :FaKey: **Watch tokens** in the device's menu and press :FaPlus: **Add new**. **From** and **To** limit the period the token covers and **Note** is for recording whom you gave it to. Send them the token, or the link copied with :FaClipboard: **Copy URL**, which opens the map with your device on it.

Keep the device token to yourself – anyone who has it can send positions in your device's name. Share watch tokens instead: you can make a separate one for each person and delete it to stop sharing.

## Setting up the device

### Freemap HTTP protocol

Use this with apps like [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) or [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (enable **Online tracking** in the Trip Recording settings). Set the tracking URL in the app to:

```
https://backend.freemap.sk/tracking/track/{token}
```

Replace `{token}` with your device token from :FaMobileAlt: [My Devices](#show=tracking-my).

The address accepts HTTP `GET` or `POST` with these parameters:

| Parameter | Description |
|---|---|
| `location` | Latitude and longitude in degrees, separated by a comma **(required, or `lat` and `lon`)** |
| `lat` | Latitude in degrees |
| `lon` | Longitude in degrees |
| `time`, `timestamp` | JavaScript-parsable datetime or Unix time in seconds or milliseconds |
| `alt`, `altitude` | Altitude in metres |
| `speed` | Speed in m/s |
| `speedKmh` | Speed in km/h |
| `acc`, `accuracy` | Accuracy in metres |
| `hdop` | Horizontal DOP |
| `bearing`, `heading` | Bearing in degrees |
| `battery`, `batt` | Battery level in percent |
| `gsm_signal` | GSM signal strength in percent |
| `message` | Note / message |

### Traccar

Use this with the [Traccar Client](https://www.traccar.org/client/) app, with hardware GPS trackers (car, asset or pet trackers), or with other Traccar-compatible apps. For Locus Map and OsmAnd the Freemap HTTP protocol above is recommended.

- **Server:** `traccar.freemap.sk`
- **Port:** the standard port of your device's protocol (see the [Traccar device list](https://www.traccar.org/devices/) – Traccar supports over 200 protocols); for HTTP or HTTPS you can use port **80** or **443** instead of 5055
- **Device identifier:** your device token

For Traccar Client there is a shortcut: :SiTraccar: **Traccar QR Code** in the device's menu shows a code; scan it in the app to set it up with your device's token.

## Watching devices

1. Open :FaRegEye: **Watched** and press :FaPlus: **Add new**.
2. Enter the **Watch Token** you were given. Optionally set a **Label**, the line's **Color** and **Width**, and which positions to show: **Since**, **Max Age**, **Max Count**. **Split Distance** and **Split Duration** break the line where two positions are further apart or longer apart than that.
3. Press :FaCheck: **Save**. The device appears on the map.

A link someone has shared with you opens the map with their device already watched. Your own devices can be watched too: :FaRegEye: **Watch** in a device's watch tokens list.

The list of watched devices is kept only in the page address. To keep it, save the map in :FaRegMap: [My maps](#show=my-maps).

## Devices on the map

Each device is drawn in its colour, its latest position marked with a figure of a person and, where the device reports it, a circle showing its accuracy. Positions arrive as the device sends them. Pointing at a position shows its time and, where the device sends them, the altitude, speed, signal, battery and message.

Clicking a track selects it. Its toolbar has :FaPencil: **Modify**, :FaTrash: **Delete** to stop watching it, and :FaEllipsisV: to copy just this track to Drawing and data.

## GPS recorder

On Android, :FaCircle: **GPS recorder** in the main menu is for recording your own trip with the separate Freemap GPS Recorder app, so the recording goes on even when the browser is closed. It is described in the chapter [GPS recorder](#show=manual/gps-recorder).
