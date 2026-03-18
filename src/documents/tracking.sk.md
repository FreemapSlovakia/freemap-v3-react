---
title: Nastavenie sledovania polohy zariadenia
---

Freemap podporuje dva spôsoby odosielania polohy vášho zariadenia.

---

## Metóda 1: Sledovanie natívnym HTTP protokolom Freemap

Použite túto metódu s aplikáciami ako [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) alebo [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (zapnite funkciu **Online tracking** v nastaveniach Trip Recording).

Nakonfigurujte URL sledovania vo svojej aplikácii:

```
https://backend.freemap.sk/tracking/track/{token}
```

Nahraďte `{token}` tokenom vášho zariadenia z tabuľky v [zozname zariadení](#show=tracking-my).

Endpoint prijíma HTTP `GET` alebo `POST` s nasledujúcimi parametrami:

| Parameter | Popis |
|---|---|
| `location` | Zemepisná šírka a dĺžka v stupňoch oddelené čiarkou **(povinné)** |
| `lat` | Zemepisná šírka v stupňoch **(povinné)** |
| `lon` | Zemepisná dĺžka v stupňoch **(povinné)** |
| `time`, `timestamp` | Dátum a čas parsovateľný JavaScriptom alebo Unix čas v sekundách alebo milisekundách |
| `alt`, `altitude` | Nadmorská výška v metroch |
| `speed` | Rýchlosť v m/s |
| `speedKmh` | Rýchlosť v km/h |
| `acc`, `accuracy` | Presnosť v metroch |
| `hdop` | Horizontálna DOP |
| `bearing`, `heading` | Smer v stupňoch |
| `battery`, `batt` | Úroveň batérie v percentách |
| `gsm_signal` | Sila GSM signálu v percentách |
| `message` | Poznámka / správa |

---

## Metóda 2: Sledovanie cez Traccar

Použite túto metódu s aplikáciou [Traccar Client](https://www.traccar.org/client/), dedikovanými hardvérovými GPS trackermi (napr. autotrackery, sledovače majetku, pet trackery) alebo inými aplikáciami kompatibilnými s Traccarom, ako sú Locus Map alebo OsmAnd (hoci pre tieto je odporúčané natívne HTTP sledovanie Freemap).

Nakonfigurujte vaše zariadenie alebo aplikáciu na odosielanie na:

- **Server:** `traccar.freemap.sk`
- **Port:** použite štandardný port pre protokol vášho zariadenia (pozri [zoznam zariadení Traccar](https://www.traccar.org/devices/)); pre HTTP alebo HTTPS môžete použiť porty **80** alebo **443** namiesto 5055 (HTTP)

Ako identifikátor zariadenia použite váš **token zariadenia** (zo [zoznamu zariadení](#show=tracking-my)).

Traccar podporuje viac ako 200 protokolov — pozrite si [zoznam zariadení Traccar](https://www.traccar.org/devices/) a zistite správny port pre vaše konkrétne hardvérové zariadenie.
