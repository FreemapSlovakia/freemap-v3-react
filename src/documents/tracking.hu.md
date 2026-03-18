---
title: Eszköz helymeghatározás beállítása
---

A Freemap kétféle módszert támogat az eszköz helyzetének küldéséhez.

---

## 1. módszer: Natív Freemap HTTP protokoll alapú követés

Ezt a módszert használja [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) vagy [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) alkalmazásokkal (engedélyezze az **Online tracking** funkciót a Trip Recording beállításaiban).

Konfigurálja a követési URL-t az alkalmazásában:

```
https://backend.freemap.sk/tracking/track/{token}
```

Cserélje le a `{token}` részt az eszköz tokenjére az [eszközlistában](#show=tracking-my) szereplő táblázatból.

A végpont HTTP `GET` vagy `POST` kéréseket fogad a következő paraméterekkel:

| Paraméter | Leírás |
|---|---|
| `location` | Vesszővel elválasztott szélességi és hosszúsági fok **(kötelező)** |
| `lat` | Szélességi fok **(kötelező)** |
| `lon` | Hosszúsági fok **(kötelező)** |
| `time`, `timestamp` | JavaScript által értelmezhető dátum vagy Unix idő másodpercben vagy milliszekundumban |
| `alt`, `altitude` | Magasság méterben |
| `speed` | Sebesség m/s-ban |
| `speedKmh` | Sebesség km/h-ban |
| `acc`, `accuracy` | Pontosság méterben |
| `hdop` | Vízszintes DOP |
| `bearing`, `heading` | Irányszög fokban |
| `battery`, `batt` | Akkumulátor szint százalékban |
| `gsm_signal` | GSM jelerősség százalékban |
| `message` | Megjegyzés / üzenet |

---

## 2. módszer: Traccar-alapú követés

Ezt a módszert használja a [Traccar Client](https://www.traccar.org/client/) alkalmazással, dedikált hardveres GPS nyomkövetőkkel (pl. jármű-nyomkövetők, eszközkövetők, háziállat-nyomkövetők) vagy más Traccar-kompatibilis alkalmazásokkal, mint a Locus Map vagy OsmAnd (bár ezeknél a natív Freemap HTTP követés ajánlott).

Konfigurálja eszközét vagy alkalmazását az alábbi szerverre való küldésre:

- **Szerver:** `traccar.freemap.sk`
- **Port:** Használja eszköze protokolljának alapértelmezett portját (lásd [Traccar eszközlista](https://www.traccar.org/devices/)); HTTP vagy HTTPS esetén használhatja a **80**-as vagy **443**-as portot az 5055 (HTTP) helyett

Az eszközazonosítóként használja az **eszköz tokenjét** (az [eszközlistából](#show=tracking-my)).

A Traccar több mint 200 protokollt támogat — tekintse meg a [Traccar eszközlistát](https://www.traccar.org/devices/) a konkrét hardvereszközéhez szükséges port meghatározásához.
